use crate::apdu::{ApduCommand, CLA_ISO, INS_SELECT_FILE, INS_READ_BINARY};
use crate::reader::CardReader;
use anyhow::{Result, Context};

/// US PIV (Personal Identity Verification) Controller
/// Based on NIST SP 800-73-5
pub struct PivController<R: CardReader> {
    reader: R,
}

pub mod file_ids {
    /// PIV Card Application AID
    /// A0 00 00 03 08 00 00 10 00 01 00
    pub const DF_PIV: [u8; 11] = [
        0xA0, 0x00, 0x00, 0x03, 0x08, 0x00, 0x00, 0x10, 0x00, 0x01, 0x00
    ];

    /// Card Capability Container (CCC)
    /// Tag: 0xDB00
    pub const EF_CCC: [u8; 3] = [0xDB, 0x00, 0x00]; // Often accessed via GET DATA

    /// Card Holder Unique Identifier (CHUID)
    /// Tag: 0x3000
    /// Object ID: 5FC102
    pub const EF_CHUID: [u8; 3] = [0x30, 0x00, 0x00]; 
}

impl<R: CardReader> PivController<R> {
    pub fn new(reader: R) -> Self {
        Self { reader }
    }

    /// Select PIV Application
    pub async fn select_piv_ap(&mut self) -> Result<()> {
        let apdu = ApduCommand::new(CLA_ISO, INS_SELECT_FILE, 0x04, 0x0C)
            .with_data(&file_ids::DF_PIV);
        
        let res = self.reader.transmit(&apdu.to_bytes()).await?;
        Self::check_sw(&res).context("Failed to select PIV AP")
    }

    /// Read CHUID (Card Holder Unique Identifier)
    /// PIV uses "GET DATA" (INS=CB) for retrieving data objects (BER-TLV encoded).
    pub async fn read_chuid(&mut self) -> Result<Vec<u8>> {
        // Tag for CHUID in PIV GET DATA is 5FC102
        let tag_data = [0x5C, 0x03, 0x5F, 0xC1, 0x02];
        self.get_data(&tag_data).await
    }

    /// Read PIV Authentication Certificate (X.509)
    /// Tag: 5FC105 (Key 9A)
    pub async fn read_auth_cert(&mut self) -> Result<Vec<u8>> {
         let tag_data = [0x5C, 0x03, 0x5F, 0xC1, 0x05];
         let data = self.get_data(&tag_data).await?;
         
         // The data returned is a CERT object (Container). 
         // Most PIV contents are wrapped in a tag 0x53 (Discretionary Data) if read via file system,
         // but via GET DATA it returns the object directly usually wrapped in BER-TLV tag of the object (70 for cert?).
         // Standard PIV object: Tag 5FC105 returns data starting with Tag 70 (or 53 then 70).
         // Let's assume raw X.509 is inside a value field. 
         // Simplification: Return raw container for now.
         Ok(data)
    }

    /// Generic PIV GET DATA
    async fn get_data(&mut self, tag_data: &[u8]) -> Result<Vec<u8>> {
        let apdu = ApduCommand::new(CLA_ISO, 0xCB, 0x3F, 0xFF)
            .with_data(tag_data);

        let res = self.reader.transmit(&apdu.to_bytes()).await?;
        Self::check_sw(&res).context("GET DATA Failed")?;
        
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

pub struct ParsingUtils;
impl ParsingUtils {
    /// extract expiration date from CHUID raw data
    /// CHUID structure: 53 Length ( 30 (FASC-N...) 34 (GUID...) 35 (Expiration Date YYYYMMDD) ... )
    /// Very rough scanner for tag 0x35
    pub fn extract_expiry_date(chuid: &[u8]) -> Option<String> {
        // Simple linear scan for tag 0x35
        let mut i = 0;
        while i < chuid.len() - 5 {
             if chuid[i] == 0x35 && chuid[i+1] == 0x08 {
                  let date_bytes = &chuid[i+2..i+10];
                  return Some(String::from_utf8_lossy(date_bytes).to_string());
             }
             i += 1;
        }
        None
    }
}
