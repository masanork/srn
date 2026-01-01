use crate::passport::PassportController;
use crate::reader::CardReader;
use anyhow::Result;

/// European Identity Card Controller
/// Most EU National ID cards (compliant with EU 2019/1157) are ICAO 9303 compliant.
/// They function as MRTDs (Machine Readable Travel Documents).
pub struct EuIdController<R: CardReader> {
    passport: PassportController<R>,
}

impl<R: CardReader> EuIdController<R> {
    pub fn new(reader: R) -> Self {
        Self {
            passport: PassportController::new(reader),
        }
    }

    /// Select the ID Application (Same as ICAO ePassport)
    pub async fn select_eid_ap(&mut self) -> Result<()> {
        self.passport.select_ep_ap().await
    }

    /// Perform BAC/PACE (Using MRZ logic for now)
    pub async fn perform_access_control(&mut self, mrz: &str) -> Result<()> {
        // EU IDs use PACE primarily, but BAC is often supported for backward compatibility
        // or as a fallback.
        self.passport.perform_bac(mrz).await
    }

    /// Read Common Data
    pub async fn read_common_data(&mut self) -> Result<Vec<u8>> {
        self.passport.read_common_data().await
    }

    /// Read MRZ (DG1)
    pub async fn read_mrz(&mut self) -> Result<Vec<u8>> {
        self.passport.read_dg1().await
    }

    /// Read Face Photo (DG2)
    pub async fn read_face(&mut self) -> Result<Vec<u8>> {
        self.passport.read_dg2().await
    }

    /// Read Additional Personal Details (DG11)
    /// Often contains address, place of birth, etc.
    pub async fn read_additional_details(&mut self) -> Result<Vec<u8>> {
        self.passport.read_dg11().await
    }

    /// Read Additional Document Details (DG12)
    pub async fn read_document_details(&mut self) -> Result<Vec<u8>> {
        self.passport.read_dg12().await
    }
}
