use crate::apdu::{ApduCommand, CLA_ISO, INS_SELECT_FILE, INS_READ_BINARY, INS_VERIFY};
use crate::reader::CardReader;
use anyhow::{Result, Context};
use std::fmt;

/// Driver's License Application Controller
pub struct DriversLicenseController<R: CardReader> {
    reader: R,
}

#[derive(Debug, Default)]
pub struct LicenseInfo {
    pub name: String,
    pub name_kana: String,
    pub address: String,
    pub birth_date: String, // Gengou format
    pub license_number: String,
    pub issue_date: String,
    pub expire_date: String,
}

impl fmt::Display for LicenseInfo {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "License Info:\n Name: {} ({})\n Address: {}\n DOB: {}\n No: {}\n Expires: {}", 
            self.name, self.name_kana, self.address, self.birth_date, self.license_number, self.expire_date)
    }
}

pub mod file_ids {
    pub const DF_DL: [u8; 16] = [
        0xA0, 0x00, 0x00, 0x02, 0x31, 0x01, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ];
    pub const EF_COMMON_DATA: [u8; 2] = [0x00, 0x01]; // EF01
    pub const EF_SENSITIVE_DATA: [u8; 2] = [0x00, 0x02]; // EF02
}

impl<R: CardReader> DriversLicenseController<R> {
    pub fn new(reader: R) -> Self {
        Self { reader }
    }

    /// Select Driver's License Application
    pub async fn select_dl_ap(&mut self) -> Result<()> {
        let apdu = ApduCommand::new(CLA_ISO, INS_SELECT_FILE, 0x04, 0x0C)
            .with_data(&file_ids::DF_DL);
        
        let res = self.reader.transmit(&apdu.to_bytes()).await?;
        Self::check_sw(&res).context("Failed to select DL AP")
    }

    /// Verify PIN (PIN1 or PIN2)
    /// Usually PIN1 for Common Data, PIN2 for Sensitive Data.
    /// Implementation detail: The exact command depends on the card profile (often 00 20 00 80).
    pub async fn verify_pin(&mut self, pin: &str) -> Result<()> {
        let pin_bytes = pin.as_bytes();
        let apdu = ApduCommand::new(CLA_ISO, INS_VERIFY, 0x00, 0x80)
            .with_data(pin_bytes);
        
        let res = self.reader.transmit(&apdu.to_bytes()).await?;
        Self::check_sw(&res).context("PIN Verification Failed")
    }

    /// Alias for PIN1 Verification
    pub async fn verify_pin1(&mut self, pin: &str) -> Result<()> {
        self.verify_pin(pin).await
    }

    /// Read Common Data (EF01) and Parse
    /// Requires PIN 1 verification beforehand.
    pub async fn read_common_data(&mut self) -> Result<LicenseInfo> {
        let raw = self.read_file(&file_ids::EF_COMMON_DATA).await?;
        self.parse_common_data(&raw)
    }
    
    // Internal parser
    fn parse_common_data(&self, data: &[u8]) -> Result<LicenseInfo> {
        // Tag definitions from NPA format (approx):
        // 0x11: Name
        // 0x12: Kana
        // 0x13: Birth Date
        // 0x14: Address
        // 0x15: Issue Date
        // 0x16: Inquiry Number
        // 0x17: License Number
        // 0x18: Expiry Date
        // ... conditions ...

        use crate::utils::{parse_tlv_flat, decode_shift_jis_lossy_gaiji};
        let tlvs = parse_tlv_flat(data);
        let mut info = LicenseInfo::default();

        for tlv in tlvs {
            match tlv.tag {
                0x11 => info.name = decode_shift_jis_lossy_gaiji(&tlv.value),
                0x12 => info.name_kana = decode_shift_jis_lossy_gaiji(&tlv.value),
                0x13 => info.birth_date = decode_shift_jis_lossy_gaiji(&tlv.value),
                0x14 => info.address = decode_shift_jis_lossy_gaiji(&tlv.value),
                0x15 => info.issue_date = decode_shift_jis_lossy_gaiji(&tlv.value),
                0x17 => info.license_number = decode_shift_jis_lossy_gaiji(&tlv.value),
                0x18 => info.expire_date = decode_shift_jis_lossy_gaiji(&tlv.value),
                _ => {} // Ignore others for now
            }
        }
        Ok(info)
    }

    /// Read Sensitive Data (EF02) - Domicile, Photo
    /// Requires PIN 2 verification beforehand.
    pub async fn read_sensitive_data(&mut self) -> Result<Vec<u8>> {
        self.read_file(&file_ids::EF_SENSITIVE_DATA).await
    }

    /// Helper to Select EF and Read Binary
    async fn read_file(&mut self, file_id: &[u8]) -> Result<Vec<u8>> {
        // 1. Select File
        let select = ApduCommand::new(CLA_ISO, INS_SELECT_FILE, 0x02, 0x0C)
            .with_data(file_id);
        let res_sel = self.reader.transmit(&select.to_bytes()).await?;
        Self::check_sw(&res_sel).context("Failed to select EF")?;

        // 2. Read Binary Loop
        let mut data = Vec::new();
        let mut offset: u16 = 0;
        
        loop {
            let p1 = (offset >> 8) as u8;
            let p2 = (offset & 0xFF) as u8;
            
            // Le=00 means 256 bytes
            let read = ApduCommand::new(CLA_ISO, INS_READ_BINARY, p1, p2)
                .with_le(0x00);
            
            let res = self.reader.transmit(&read.to_bytes()).await?;
            
            if res.len() < 2 {
                return Err(anyhow::anyhow!("Response too short"));
            }
            
            let sw1 = res[res.len() - 2];
            let sw2 = res[res.len() - 1];
            let chunk = &res[0..res.len()-2];
            
            if !chunk.is_empty() {
                data.extend_from_slice(chunk);
                offset += chunk.len() as u16;
            }

            if sw1 == 0x90 && sw2 == 0x00 {
                // If we got less than requested max (256), we are likely done, 
                // but strictly we should check if we hit EOF. 
                // Simple logic: if chunk < 256, EOF.
                if chunk.len() < 256 {
                    break;
                }
            } else if sw1 == 0x6B {
                 break; // Offset outside limits
            } else if sw1 == 0x62 && sw2 == 0x82 {
                 break; // EOF
            } else {
                 return Err(anyhow::anyhow!("Read Binary Error: {:02X}{:02X}", sw1, sw2));
            }
        }
        
        Ok(data)
    }

    fn check_sw(res: &[u8]) -> Result<()> {
        if res.len() < 2 {
            return Err(anyhow::anyhow!("Response too short"));
        }
        let sw1 = res[res.len() - 2];
        let sw2 = res[res.len() - 1];
        if sw1 == 0x90 && sw2 == 0x00 {
            Ok(())
        } else {
            Err(anyhow::anyhow!("Card Error: SW={:02X}{:02X}", sw1, sw2))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::{Arc, Mutex};
    use async_trait::async_trait;

    #[derive(Clone)]
    struct MockReader {
        pub sent_apdus: Arc<Mutex<Vec<Vec<u8>>>>,
        pub response: Vec<u8>,
    }

    impl MockReader {
        fn new(response: Vec<u8>) -> Self {
            Self {
                sent_apdus: Arc::new(Mutex::new(Vec::new())),
                response,
            }
        }
    }

    #[async_trait(?Send)]
    impl CardReader for MockReader {
        async fn transmit(&mut self, apdu: &[u8]) -> Result<Vec<u8>> {
            self.sent_apdus.lock().unwrap().push(apdu.to_vec());
            Ok(self.response.clone())
        }
    }

    #[tokio::test]
    async fn test_select_dl_ap() {
        let mock = MockReader::new(vec![0x90, 0x00]);
        let mut controller = DriversLicenseController::new(mock.clone());

        let res = controller.select_dl_ap().await;
        assert!(res.is_ok());

        let apdus = mock.sent_apdus.lock().unwrap();
        assert_eq!(apdus.len(), 1);
        // Check AID
        assert_eq!(&apdus[0][5..], &file_ids::DF_DL[..]);
    }
}
