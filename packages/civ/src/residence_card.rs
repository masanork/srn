use crate::apdu::{ApduCommand, CLA_ISO, INS_SELECT_FILE, INS_READ_BINARY};
use crate::reader::CardReader;
use anyhow::{Result, Context};

/// Residence Card (Zairyu Card) Application Controller
pub struct ResidenceCardController<R: CardReader> {
    reader: R,
}

pub mod file_ids {
    /// Residence Card AID (Mock / To Be Verified)
    /// Using standard JPKI-like or ISO ID for now
    pub const DF_RC: [u8; 11] = [0xA0, 0x00, 0x00, 0x00, 0x79, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00]; 

    /// EF: Card Common Input/Output (Placeholder)
    pub const EF_RC_COMMON: [u8; 2] = [0x00, 0x01];
}

use std::fmt;

/// Parsed Residence Card Information
#[derive(Debug, Default)]
pub struct ResidenceCardInfo {
    pub name: String,
    pub address: String,
    pub birth_date: String,
    pub gender: String,
    pub nationality: String,
    pub card_number: String,
    pub expire_date: String,
}

impl fmt::Display for ResidenceCardInfo {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Residence Card Info:\n Name: {}\n Address: {}\n DOB: {} ({})\n Nationality: {}\n No: {}\n Expires: {}", 
            self.name, self.address, self.birth_date, self.gender, self.nationality, self.card_number, self.expire_date)
    }
}

// ... file_ids ...

impl<R: CardReader> ResidenceCardController<R> {
    pub fn new(reader: R) -> Self {
        Self { reader }
    }

    // ... existing select/verify ...

    pub async fn read_info(&mut self) -> Result<ResidenceCardInfo> {
        let raw = self.read_file(&file_ids::EF_RC_COMMON).await?;
        self.parse_info(&raw)
    }

    fn parse_info(&self, data: &[u8]) -> Result<ResidenceCardInfo> {
        // Tag definitions (Hypothetical/Empirical):
        // 0x11: Card Number
        // 0x12: Name
        // 0x13: Date of Birth
        // 0x14: Gender
        // 0x15: Nationality
        // 0x16: Address
        // 0x17: Expiry Info?
        
        use crate::utils::{parse_tlv_flat, decode_shift_jis};
        // Note: Check if UTF-8 is used instead? Usually text is UTF-8 in RC?
        // Let's try Shift-JIS first as fail-safe, or check encoding.
        // Actually, Residence Card specs often align with ICAO or JPKI.
        // If it's pure ICAO, it's UTF-8. If JPKI-based input support, it's Shift-JIS.
        
        let tlvs = parse_tlv_flat(data);
        let mut info = ResidenceCardInfo::default();

        for tlv in tlvs {
            // Using placeholder tags
            match tlv.tag {
                0x11 => info.card_number = String::from_utf8_lossy(&tlv.value).to_string(), // ASCII
                0x12 => info.name = String::from_utf8_lossy(&tlv.value).to_string(), // UTF-8 likely
                0x13 => info.birth_date = String::from_utf8_lossy(&tlv.value).to_string(),
                0x14 => info.gender = String::from_utf8_lossy(&tlv.value).to_string(),
                0x15 => info.nationality = String::from_utf8_lossy(&tlv.value).to_string(),
                0x16 => info.address = String::from_utf8_lossy(&tlv.value).to_string(), // UTF-8 likely
                _ => {}
            }
        }
        Ok(info)
    }

    async fn read_file(&mut self, file_id: &[u8]) -> Result<Vec<u8>> {
        let select = ApduCommand::new(CLA_ISO, INS_SELECT_FILE, 0x02, 0x0C)
            .with_data(file_id);
        let res_sel = self.reader.transmit(&select.to_bytes()).await?;
        Self::check_sw(&res_sel).context("Failed to select EF")?;

        let read = ApduCommand::new(CLA_ISO, INS_READ_BINARY, 0x00, 0x00)
            .with_le(0x00);
        let res = self.reader.transmit(&read.to_bytes()).await?;
        
        if res.len() >= 2 {
            Ok(res[0..res.len()-2].to_vec())
        } else {
            Err(anyhow::anyhow!("Response too short"))
        }
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
