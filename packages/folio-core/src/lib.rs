pub mod model;

use wasm_bindgen::prelude::*;
use civ::{JpkiController, WebUsbReader};

#[wasm_bindgen]
pub fn greet() -> String {
    "Hello from folio-core Rust WASM!".to_string()
}

// Re-export specific WASM wrappers for the application
// We wrap JpkiController<WebUsbReader> specifically for the WASM target

#[wasm_bindgen]
pub struct WasmJpkiController {
    inner: JpkiController<WebUsbReader>,
}

#[wasm_bindgen]
impl WasmJpkiController {
    #[wasm_bindgen(constructor)]
    pub fn new(reader: WebUsbReader) -> Self {
        Self {
            inner: JpkiController::new(reader),
        }
    }

    pub async fn select_jpki_ap(&mut self) -> Result<(), JsValue> {
        self.inner.select_jpki_ap().await
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    pub async fn verify_pin(&mut self, pin_ef: &[u8], pin: &str) -> Result<(), JsValue> {
        self.inner.verify_pin(pin_ef, pin).await
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    pub async fn compute_signature(&mut self, data: &[u8]) -> Result<Vec<u8>, JsValue> {
        self.inner.compute_signature(data).await
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    pub async fn read_auth_cert(&mut self) -> Result<Vec<u8>, JsValue> {
        self.inner.read_auth_cert().await
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }
}