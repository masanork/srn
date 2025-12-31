export class PcscAdapter {
    private pscs: any;
    private reader: any;
    private protocol: any;

    constructor() {
        console.log("Initializing PC/SC Adapter...");
    }

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const pcsclite = require("@pokusew/pcsclite");
                this.pscs = pcsclite();

                this.pscs.on('reader', (reader: any) => {
                    console.log(`Reader detected: ${reader.name}`);
                    
                    reader.on('status', (status: any) => {
                        const changes = reader.state ^ status.state;
                        if (changes & reader.SCARD_STATE_PRESENT && status.state & reader.SCARD_STATE_PRESENT) {
                            console.log("Card inserted");
                            reader.connect({ share_mode: reader.SCARD_SHARE_SHARED }, (err: any, protocol: any) => {
                                if (err) {
                                    console.error("Card connection failed:", err);
                                    // Don't reject yet, user might re-insert
                                } else {
                                    console.log("Protocol:", protocol);
                                    this.reader = reader;
                                    this.protocol = protocol;
                                    resolve();
                                }
                            });
                        }
                    });

                    reader.on('end', () => {
                        console.log('Reader removed');
                        if (this.reader === reader) {
                            this.reader = null;
                        }
                    });

                    reader.on('error', (err: any) => {
                        console.error('Reader error:', err);
                    });
                });

                this.pscs.on('error', (err: any) => {
                    console.error('PCSC error:', err);
                    reject(err);
                });

                console.log("PC/SC Listening... Please insert card.");
                // Note: If card is already inserted, 'status' event fires immediately.

            } catch (e) {
                console.error("Failed to load PC/SC module. Ensure @pokusew/pcsclite is installed and built.");
                reject(e);
            }
        });
    }

    async transmit(apdu: Uint8Array): Promise<Uint8Array> {
        if (!this.reader) {
            throw new Error("Reader not connected or card not present");
        }

        return new Promise((resolve, reject) => {
            // Buffer is needed for pcsclite usually, or Uint8Array works?
            // Safer to convert to Buffer for Node.js native modules
            const buffer = Buffer.from(apdu);
            
            // 256 is usually max for short APDU response, but extended APDU can be longer.
            // Using 4096 to be safe.
            this.reader.transmit(buffer, 4096, this.protocol, (err: any, data: Buffer) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(new Uint8Array(data));
                }
            });
        });
    }
}
