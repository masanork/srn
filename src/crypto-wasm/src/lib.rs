use wasm_bindgen::prelude::*;
use subtle::ConstantTimeEq;
use aes_gcm::{
    aead::{Aead, KeyInit, Payload},
    Aes256Gcm, Nonce
};
use x25519_dalek::{StaticSecret, PublicKey as XPublicKey};
use ed25519_dalek::{SigningKey, VerifyingKey, Signature, Signer, Verifier};
use ml_kem::{MlKem768, MlKem768Params, Encoded, EncodedSizeUser, KemCore, Ciphertext};
use ml_kem::kem::{EncapsulationKey, DecapsulationKey, Encapsulate, Decapsulate};
use rand::prelude::*;

#[wasm_bindgen]
pub fn constant_time_equal(a: &[u8], b: &[u8]) -> bool {
    if a.len() != b.len() {
        return false;
    }
    a.ct_eq(b).into()
}

#[wasm_bindgen]
pub fn get_version() -> String {
    "Web/A Crypto WASM v0.1.3 (AES-GCM + X25519 + Ed25519 + ML-KEM-768)".to_string()
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

// X25519
#[wasm_bindgen]
pub fn x25519_generate_keypair() -> Result<Vec<u8>, JsValue> {
    let mut rng = thread_rng();
    let secret = StaticSecret::random_from_rng(&mut rng);
    let public = XPublicKey::from(&secret);
    
    let mut out = Vec::with_capacity(64);
    out.extend_from_slice(secret.to_bytes().as_slice());
    out.extend_from_slice(public.as_bytes());
    Ok(out)
}

#[wasm_bindgen]
pub fn x25519_get_public_key(private_key: &[u8]) -> Result<Vec<u8>, JsValue> {
    if private_key.len() != 32 {
        return Err(JsValue::from_str("Invalid private key length"));
    }
    let mut bytes = [0u8; 32];
    bytes.copy_from_slice(private_key);
    let secret = StaticSecret::from(bytes);
    let public = XPublicKey::from(&secret);
    Ok(public.as_bytes().to_vec())
}

#[wasm_bindgen]
pub fn x25519_get_shared_secret(private_key: &[u8], public_key: &[u8]) -> Result<Vec<u8>, JsValue> {
    if private_key.len() != 32 || public_key.len() != 32 {
        return Err(JsValue::from_str("Invalid key length"));
    }
    let mut priv_bytes = [0u8; 32];
    priv_bytes.copy_from_slice(private_key);
    let secret = StaticSecret::from(priv_bytes);
    
    let mut pub_bytes = [0u8; 32];
    pub_bytes.copy_from_slice(public_key);
    let public = XPublicKey::from(pub_bytes);
    
    let ss = secret.diffie_hellman(&public);
    Ok(ss.as_bytes().to_vec())
}

// Ed25519
#[wasm_bindgen]
pub fn ed25519_generate_keypair() -> Result<Vec<u8>, JsValue> {
    let mut rng = thread_rng();
    let signing_key = SigningKey::generate(&mut rng);
    let verifying_key = VerifyingKey::from(&signing_key);
    
    let mut out = Vec::with_capacity(64);
    out.extend_from_slice(&signing_key.to_bytes());
    out.extend_from_slice(verifying_key.as_bytes());
    Ok(out)
}

#[wasm_bindgen]
pub fn ed25519_sign(private_key: &[u8], message: &[u8]) -> Result<Vec<u8>, JsValue> {
    if private_key.len() != 32 {
        return Err(JsValue::from_str("Invalid private key length"));
    }
    let mut bytes = [0u8; 32];
    bytes.copy_from_slice(private_key);
    let signing_key = SigningKey::from_bytes(&bytes);
    let signature = signing_key.sign(message);
    Ok(signature.to_bytes().to_vec())
}

#[wasm_bindgen]
pub fn ed25519_verify(public_key: &[u8], message: &[u8], signature: &[u8]) -> Result<bool, JsValue> {
    if public_key.len() != 32 || signature.len() != 64 {
        return Ok(false);
    }
    let mut pub_bytes = [0u8; 32];
    pub_bytes.copy_from_slice(public_key);
    let verifying_key = VerifyingKey::from_bytes(&pub_bytes).map_err(|_| JsValue::from_str("Invalid public key"))?;
    
    let mut sig_bytes = [0u8; 64];
    sig_bytes.copy_from_slice(signature);
    let signature = Signature::from_bytes(&sig_bytes);
    
    Ok(verifying_key.verify(message, &signature).is_ok())
}

// ML-KEM-768
#[wasm_bindgen]
pub fn ml_kem_768_generate_keypair() -> Result<Vec<u8>, JsValue> {
    let mut rng = thread_rng();
    let (dk, ek) = MlKem768::generate(&mut rng);
    
    let ek_bytes = ek.as_bytes();
    let dk_bytes = dk.as_bytes();
    
    let mut out = Vec::with_capacity(ek_bytes.len() + dk_bytes.len());
    out.extend_from_slice(dk_bytes.as_slice()); 
    out.extend_from_slice(ek_bytes.as_slice());
    Ok(out)
}

#[wasm_bindgen]
pub fn ml_kem_768_encapsulate(public_key: &[u8]) -> Result<Vec<u8>, JsValue> {
    let mut rng = thread_rng();
    
    let ek_encoded = Encoded::<EncapsulationKey<MlKem768Params>>::try_from(public_key)
        .map_err(|_| JsValue::from_str("Invalid public key length"))?;
    let ek = EncapsulationKey::<MlKem768Params>::from_bytes(&ek_encoded);
    
    let (ct, ss) = ek.encapsulate(&mut rng).map_err(|_| JsValue::from_str("Encapsulation failed"))?;
    
    let mut out = Vec::with_capacity(ct.len() + ss.len());
    out.extend_from_slice(ss.as_slice()); 
    out.extend_from_slice(ct.as_slice());
    Ok(out)
}

#[wasm_bindgen]
pub fn ml_kem_768_decapsulate(private_key: &[u8], ciphertext: &[u8]) -> Result<Vec<u8>, JsValue> {
    let dk_encoded = Encoded::<DecapsulationKey<MlKem768Params>>::try_from(private_key)
        .map_err(|_| JsValue::from_str("Invalid private key length"))?;
    let dk = DecapsulationKey::<MlKem768Params>::from_bytes(&dk_encoded);
    
    let ct = Ciphertext::<MlKem768>::try_from(ciphertext)
        .map_err(|_| JsValue::from_str("Invalid ciphertext length"))?;
    
    let ss = dk.decapsulate(&ct).map_err(|_| JsValue::from_str("Decapsulation failed"))?;
    
    Ok(ss.to_vec())
}
