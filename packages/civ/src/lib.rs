pub mod apdu;
pub mod crypto;
pub mod jpki;
pub mod drivers_license;
pub mod passport;
pub mod residence_card;
pub mod reader;
pub mod transport;
pub mod utils;

#[cfg(not(target_arch = "wasm32"))]
pub mod native_reader;

pub use apdu::ApduCommand;
pub use reader::CardReader;
pub use jpki::JpkiController;
pub use drivers_license::DriversLicenseController;
pub use passport::PassportController;
pub use residence_card::ResidenceCardController;
pub use transport::WebUsbReader;

#[cfg(not(target_arch = "wasm32"))]
pub use native_reader::PcscReader;
