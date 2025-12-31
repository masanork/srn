pub mod apdu;
pub mod crypto;
pub mod jpki;
pub mod drivers_license;
pub mod reader;
pub mod transport;

#[cfg(not(target_arch = "wasm32"))]
pub mod native_reader;

pub use apdu::ApduCommand;
pub use reader::CardReader;
pub use jpki::JpkiController;
pub use transport::WebUsbReader;

#[cfg(not(target_arch = "wasm32"))]
pub use native_reader::PcscReader;
