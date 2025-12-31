export class WebUsbCcidDriver {
    constructor() {
        this.device = null;
        this.interfaceNumber = 0;
        this.endpointIn = 0;
        this.endpointOut = 0;
        this.seq = 0; // Sequence number
    }

    async connect() {
        try {
            // Filter: CCID devices usually have Class 0x0B (Smart Card)
            // But some readers don't advertise properly. We'll verify after selection.
            this.device = await navigator.usb.requestDevice({ filters: [] });
            console.log(`Device selected: ${this.device.productName} (Vendor: ${this.device.vendorId}, Product: ${this.device.productId})`);

            await this.device.open();
            
            // Select Configuration (usually 1)
            await this.device.selectConfiguration(1);

            // Find CCID Interface (Class 0x0B)
            // If not found, fallback to the first interface and hope.
            let iface = this.device.configuration.interfaces.find(i => i.alternates[0].interfaceClass === 0x0B);
            if (!iface) {
                console.warn("CCID Interface not found by class 0x0B. Using first interface.");
                iface = this.device.configuration.interfaces[0];
            }
            
            this.interfaceNumber = iface.interfaceNumber;
            await this.device.claimInterface(this.interfaceNumber);

            // Find Endpoints (Bulk In/Out)
            const endpoints = iface.alternates[0].endpoints;
            const epIn = endpoints.find(e => e.direction === 'in' && e.type === 'bulk');
            const epOut = endpoints.find(e => e.direction === 'out' && e.type === 'bulk');

            if (!epIn || !epOut) {
                throw new Error("Bulk Endpoints not found");
            }

            this.endpointIn = epIn.endpointNumber;
            this.endpointOut = epOut.endpointNumber;
            
            console.log(`Interface ${this.interfaceNumber} Claimed. EP In: ${this.endpointIn}, Out: ${this.endpointOut}`);
            return true;
        } catch (e) {
            console.error("WebUSB Connect Error:", e);
            return false;
        }
    }

    async powerOn() {
        if (!this.device) throw new Error("Device not connected");
        
        // PC_to_RDR_IccPowerOn (0x62)
        // Header: [Type(1), Len(4), Slot(1), Seq(1), PowerSelect(1), Reserved(2)]
        // PowerSelect: 00=Auto, 01=5V, 02=3V, 03=1.8V
        const header = new Uint8Array([
            0x62, 
            0x00, 0x00, 0x00, 0x00, // Length = 0
            0x00, // Slot 0
            this.nextSeq(),
            0x00, // Auto Voltage
            0x00, 0x00 // Reserved
        ]);

        await this.device.transferOut(this.endpointOut, header);
        
        // Read Response (ATR)
        // CCID header is 10 bytes usually. Response might be longer.
        const res = await this.device.transferIn(this.endpointIn, 64); // Read enough
        return this.parseResponse(new Uint8Array(res.data.buffer));
    }

    async transmit(apdu) {
        if (!this.device) throw new Error("Device not connected");

        // PC_to_RDR_XfrBlock (0x6F)
        // Header: [Type(1), Len(4), Slot(1), Seq(1), BWI(1), Reserved(2)]
        const len = apdu.length;
        const header = new Uint8Array([
            0x6F,
            len & 0xFF, (len >> 8) & 0xFF, (len >> 16) & 0xFF, (len >> 24) & 0xFF,
            0x00, // Slot 0
            this.nextSeq(),
            0x00, // BWI (Block Wait Time Integer) - 0 means default
            0x00, 0x00 // Reserved
        ]);

        // Combine header and APDU
        const packet = new Uint8Array(header.length + apdu.length);
        packet.set(header);
        packet.set(apdu, header.length);

        console.log(">> CCID XfrBlock:", this.toHex(packet));
        await this.device.transferOut(this.endpointOut, packet);

        // Read Response
        // RDR_to_PC_DataBlock (0x80)
        // We need to loop if the response is fragmented or just read a large buffer.
        // For JPKI, standard APDU response won't be huge (usually < 256 + status).
        // Max packet size for Full Speed is 64, High Speed 512. 
        // We'll try reading 512 bytes.
        const res = await this.device.transferIn(this.endpointIn, 512);
        const data = new Uint8Array(res.data.buffer);
        console.log("<< CCID DataBlock (Raw):", this.toHex(data));

        return this.parseResponse(data);
    }

    parseResponse(data) {
        if (data.length < 10) throw new Error("CCID Response too short");

        const msgType = data[0];
        const len = data[1] | (data[2] << 8) | (data[3] << 16) | (data[4] << 24);
        const status = data[7];
        const error = data[8];

        if (msgType !== 0x80) { // RDR_to_PC_DataBlock
            // Could be RDR_to_PC_SlotStatus (0x81) if error or no card
            console.warn(`Unexpected CCID MsgType: ${msgType.toString(16)}`);
        }

        // Check command status in 'status' byte (bmCommandStatus)
        // bit 0: 0=Passed, 1=Failed
        if ((status & 0x01) !== 0) {
            throw new Error(`CCID Command Failed. Status: ${status.toString(16)}, Error: ${error.toString(16)}`);
        }

        // Response Data starts at index 10
        // The length field 'len' tells how much valid data follows the header.
        const actualData = data.slice(10, 10 + len);
        return actualData;
    }

    nextSeq() {
        const s = this.seq;
        this.seq = (this.seq + 1) % 256;
        return s;
    }

    toHex(arr) {
        return Array.from(arr).map(b => b.toString(16).padStart(2,'0')).join('');
    }
}
