use wasm_bindgen::prelude::*;
use subtle::ConstantTimeEq;
use aes_gcm::{
    aead::{Aead, KeyInit, Payload},
    Aes256Gcm, Nonce // Prefix Nonce to avoid confusion if needed
};

#[wasm_bindgen]
pub fn constant_time_equal(a: &[u8], b: &[u8]) -> bool {
    if a.len() != b.len() {
        return false;
    }
    a.ct_eq(b).into()
}

#[wasm_bindgen]
pub fn get_version() -> String {
    "Web/A Crypto WASM v0.1.0".to_string()
}

#[wasm_bindgen]
pub fn aes_gcm_encrypt(key: &[u8], iv: &[u8], plaintext: &[u8], aad: &[u8]) -> Result<Vec<u8>, JsValue> {
    let cipher = Aes256Gcm::new_from_slice(key).map_err(|_| JsValue::from_str("Invalid key length"))?;
    let nonce = Nonce::from_slice(iv);
    let payload = Payload {
        msg: plaintext,
        aad: aad,
    };
    let ciphertext = cipher.encrypt(nonce, payload).map_err(|_| JsValue::from_str("Encryption failed"))?;
    Ok(ciphertext)
}

#[wasm_bindgen]
pub fn aes_gcm_decrypt(key: &[u8], iv: &[u8], ciphertext: &[u8], aad: &[u8]) -> Result<Vec<u8>, JsValue> {
    let cipher = Aes256Gcm::new_from_slice(key).map_err(|_| JsValue::from_str("Invalid key length"))?;
    let nonce = Nonce::from_slice(iv);
    let payload = Payload {
        msg: ciphertext,
        aad: aad,
    };
    let plaintext = cipher.decrypt(nonce, payload).map_err(|_| JsValue::from_str("Decryption failed"))?;
    Ok(plaintext)
}
