use crate::apdu::{ApduCommand, file_ids, CLA_ISO, INS_SELECT_FILE, INS_READ_BINARY, INS_VERIFY, INS_COMPUTE_DIGITAL_SIGNATURE};
use crate::reader::CardReader;
use anyhow::{Result, Context};

/// High-level JPKI Controller
pub struct JpkiController<R: CardReader> {
    reader: R,
}

impl<R: CardReader> JpkiController<R> {
    pub fn new(reader: R) -> Self {
        Self { reader }
    }

    /// Select the JPKI Application (DF)
    pub async fn select_jpki_ap(&mut self) -> Result<()> {
        let apdu = ApduCommand::new(CLA_ISO, INS_SELECT_FILE, 0x04, 0x0C)
            .with_data(&file_ids::DF_JPKI);
        
        let res = self.reader.transmit(&apdu.to_bytes()).await?;
        Self::check_sw(&res).context("Failed to select JPKI AP")
    }

    /// Verify PIN
    /// pin_type: Usually 0x0018 (Auth) or 0x001B (Sign)
    /// pin: The pin string (e.g. "1234")
    pub async fn verify_pin(&mut self, pin_ef: &[u8], pin: &str) -> Result<()> {
        // 1. Select PIN EF (Not strictly required by ISO if implicit, but JPKI usually requires VERIFY command direct or after select)
        // JPKI often uses VERIFY command directly. 
        // For strictness: Select EF -> Verify.
        // Or Verify with P2 referencing the PIN reference.
        // Assuming standard JPKI flow: Select EF of PIN first.
        let select_pin = ApduCommand::new(CLA_ISO, INS_SELECT_FILE, 0x02, 0x0C)
            .with_data(pin_ef);
        let res_sel = self.reader.transmit(&select_pin.to_bytes()).await?;
        Self::check_sw(&res_sel).context("Failed to select PIN EF")?;

        // 2. VERIFY
        // P2=0x80 (Specific reference) or 0x00 (Implicit known)
        // JPKI: CLA=00, INS=20, P1=00, P2=80, Data=PIN
        let pin_bytes = pin.as_bytes();
        let verify = ApduCommand::new(CLA_ISO, INS_VERIFY, 0x00, 0x80)
            .with_data(pin_bytes);
        
        let res = self.reader.transmit(&verify.to_bytes()).await?;
        Self::check_sw(&res).context("PIN Verification Failed")
    }

    /// Compute Digital Signature
    /// data: The digest/data to sign.
    pub async fn compute_signature(&mut self, data: &[u8]) -> Result<Vec<u8>> {
        // JPKI Compute Signature:
        // CLA=80 (Secure Messaging) or 00, INS=2A 
        // Mode: P1=00, P2=80 usually indicates inputs.
        // Simple implementation: CLA=0x80 might be needed for some cards, but trying ISO 0x00 first or 0x80 based on specs.
        // JPKI often requires CLA=0x80 for command chaining or specific mode. 
        // Using 0x80 for Compute Signature as per common JPKI implementations.
        let cla = 0x80; 
        let cmd = ApduCommand::new(cla, INS_COMPUTE_DIGITAL_SIGNATURE, 0x00, 0x80)
            .with_data(data)
            .with_le(0x00); // Expecting max length return
        
        let res = self.reader.transmit(&cmd.to_bytes()).await?;
        Self::check_sw(&res)?;
        // Return data minus SW
        Ok(res[0..res.len()-2].to_vec())
    }

    /// Read the Authentication Certificate (User Auth CA)
    /// Note: Needs SELECT EF first.
    pub async fn read_auth_cert(&mut self) -> Result<Vec<u8>> {
        // 1. Select EF (00 18 is Auth PIN, Cert is usually under Token Info or specific EF - needs detailed spec, usually 000A for Cert)
        // Correct JPKI spec: Auth Cert is usually EF000A under Auth AP.
        let ef_cert = [0x00, 0x0A];
        let select = ApduCommand::new(CLA_ISO, INS_SELECT_FILE, 0x02, 0x0C)
            .with_data(&ef_cert);
        self.reader.transmit(&select.to_bytes()).await?;
        
        // 2. Read Binary (Looping required for full content)
        // Simplified: Read first 32 bytes just to check
        let read = ApduCommand::new(CLA_ISO, INS_READ_BINARY, 0x00, 0x00)
            .with_le(0x20); // 32 bytes
        
        let data = self.reader.transmit(&read.to_bytes()).await?;
        Self::check_sw(&data)?;
        // Strip SW
        Ok(data[0..data.len()-2].to_vec())
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
    async fn test_select_jpki_ap() {
        let mock = MockReader::new(vec![0x90, 0x00]); // Success SW
        let mut controller = JpkiController::new(mock.clone());

        let res = controller.select_jpki_ap().await;
        assert!(res.is_ok());

        let apdus = mock.sent_apdus.lock().unwrap();
        assert_eq!(apdus.len(), 1);
        // CLA=00, INS=A4, P1=04, P2=0C, Lc=07, Data=DF_JPKI(7)
        let expected_head = vec![0x00, 0xA4, 0x04, 0x0C, 0x07];
        assert_eq!(apdus[0][0..5], expected_head[..]);
        assert_eq!(apdus[0][5..], file_ids::DF_JPKI[..]);
    }

    #[tokio::test]
    async fn test_verify_pin() {
        let mock = MockReader::new(vec![0x90, 0x00]);
        let mut controller = JpkiController::new(mock.clone());

        // Select PIN EF is called first internally in our impl
        // So we expect 2 commands: SELECT EF, then VERIFY
        let res = controller.verify_pin(&file_ids::EF_AUTH_PIN, "1234").await;
        assert!(res.is_ok());

        let apdus = mock.sent_apdus.lock().unwrap();
        assert_eq!(apdus.len(), 2);

        // 1. SELECT
        assert_eq!(apdus[0][1], INS_SELECT_FILE);
        // 2. VERIFY
        assert_eq!(apdus[1][1], INS_VERIFY);
        // Check PIN "1234" -> 31 32 33 34
        assert_eq!(&apdus[1][5..], b"1234");
    }
}
