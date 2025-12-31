use crate::apdu::{ApduCommand, CLA_ISO, INS_SELECT_FILE, INS_READ_BINARY};
use crate::reader::CardReader;
use anyhow::{Result, Context};

/// Passport (ePassport/ICAO 9303) Application Controller
pub struct PassportController<R: CardReader> {
    reader: R,
}

pub mod file_ids {
    /// ICAO 9303 Applet AID
    /// A0 00 00 02 47 10 01
    pub const DF_ICAO: [u8; 7] = [0xA0, 0x00, 0x00, 0x02, 0x47, 0x10, 0x01];

    /// EF.COM (Common Data)
    pub const EF_COM: [u8; 2] = [0x01, 0x1E];
    /// EF.DG1 (MRZ)
    pub const EF_DG1: [u8; 2] = [0x01, 0x01];
    /// EF.DG2 (Photo)
    pub const EF_DG2: [u8; 2] = [0x01, 0x02];
}

impl<R: CardReader> PassportController<R> {
    pub fn new(reader: R) -> Self {
        Self { reader }
    }

    /// Select the ePassport Application
    pub async fn select_ep_ap(&mut self) -> Result<()> {
        let apdu = ApduCommand::new(CLA_ISO, INS_SELECT_FILE, 0x04, 0x0C)
            .with_data(&file_ids::DF_ICAO);
        
        let res = self.reader.transmit(&apdu.to_bytes()).await?;
        Self::check_sw(&res).context("Failed to select Link ePassport AP")
    }

    /// Perform Basic Access Control (BAC)
    /// This establishes Secure Messaging. For PoC, this is a placeholder 
    /// that derives the K_seed (theoretically) but doesn't implement the full 3DES/AES crypto 
    /// to wrap subsequent APDUs yet.
    /// Perform Basic Access Control (BAC)
    pub async fn perform_bac(&mut self, mrz: &str) -> Result<()> {
        use crate::crypto::bac;

        // 1. Derive Keys from MRZ
        // Note: The caller must provide the correct string concatenation of MRZ fields.
        // For PoC CLI, we assume 'mrz' passed is already cleaned/formatted or we simple-hash it directly.
        // In product, parsing logic is needed.
        let k_seed = bac::derive_key_seed(mrz);
        let (k_enc, k_mac) = bac::derive_session_keys(&k_seed);

        println!("[BAC] Derived K_enc: {}", hex::encode(k_enc));
        println!("[BAC] Derived K_mac: {}", hex::encode(k_mac));
        
        // 2. Request Challenge (GET CHALLENGE)
        use crate::apdu::{CLA_ISO, INS_GET_CHALLENGE};
        let get_challenge = ApduCommand::new(CLA_ISO, INS_GET_CHALLENGE, 0x00, 0x00)
            .with_le(0x08); // 8 bytes random
        
        // Note: Without a real card, this might fail or return mock data.
        match self.reader.transmit(&get_challenge.to_bytes()).await {
             Ok(rnd_ic) => {
                 println!("[BAC] Card Challenge: {}", hex::encode(&rnd_ic));
                 // 3. Mutual Auth & Session Key Establishment would follow here.
                 // This involves generating RND.IFD, K.IFD, concatenating, encrypting, etc.
             }
             Err(e) => {
                 eprintln!("[BAC] GET CHALLENGE failed (Expected on Mock/No-Card): {}", e);
             }
        }
        
        println!("[BAC] Keys derived successfully. Secure Messaging Wrapper is pending.");
        Ok(())
    }

    /// Read EF.COM
    pub async fn read_common_data(&mut self) -> Result<Vec<u8>> {
        self.read_file(&file_ids::EF_COM).await
    }

    /// Read EF.DG1 (MRZ) - Requires BAC/PACE in reality
    pub async fn read_dg1(&mut self) -> Result<Vec<u8>> {
        self.read_file(&file_ids::EF_DG1).await
    }

    // Helper to Select EF and Read Binary (Mock-ish for now without BAC)
    async fn read_file(&mut self, file_id: &[u8]) -> Result<Vec<u8>> {
        let select = ApduCommand::new(CLA_ISO, INS_SELECT_FILE, 0x02, 0x0C)
            .with_data(file_id);
        let res_sel = self.reader.transmit(&select.to_bytes()).await?;
        Self::check_sw(&res_sel).context("Failed to select EF")?;

        // Simplified read (first 256 bytes)
        let read = ApduCommand::new(CLA_ISO, INS_READ_BINARY, 0x00, 0x00)
            .with_le(0x00);
        let res = self.reader.transmit(&read.to_bytes()).await?;
        
        // Remove SW
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
