use wasm_bindgen::prelude::*;
use subtle::ConstantTimeEq;
use aes_gcm::{
    aead::{Aead, KeyInit, Payload},
    Aes256Gcm, Nonce
};
use x25519_dalek::{StaticSecret, PublicKey as XPublicKey};
use ed25519_dalek::{SigningKey as EdSigningKey, VerifyingKey as EdVerifyingKey, Signature as EdSignature, Signer as EdSigner, Verifier as EdVerifier};
use ml_kem::{MlKem768, MlKem768Params, Encoded, EncodedSizeUser, KemCore, Ciphertext};
use ml_kem::kem::{EncapsulationKey, DecapsulationKey, Encapsulate, Decapsulate};
use rand::prelude::*;
use sha2::{Sha256, Digest};
use hkdf::Hkdf;
use ml_dsa::{MlDsa44, KeyGen, SigningKey as MlSigningKey, VerifyingKey as MlVerifyingKey, Signature as MlSignature};
use ml_dsa::signature::{Signer as MlSigner, Verifier as MlVerifier};

#[wasm_bindgen]
pub fn constant_time_equal(a: &[u8], b: &[u8]) -> bool {
    if a.len() != b.len() {
        return false;
    }
    a.ct_eq(b).into()
}

#[wasm_bindgen]
pub fn get_version() -> String {
    "Web/A Crypto WASM v0.1.5 (AES-GCM + X25519 + Ed25519 + ML-KEM-768 + ML-DSA-44 + SHA256/HKDF)".to_string()
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
    let signing_key = EdSigningKey::generate(&mut rng);
    let verifying_key = EdVerifyingKey::from(&signing_key);
    
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
    let signing_key = EdSigningKey::from_bytes(&bytes);
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
    let verifying_key = EdVerifyingKey::from_bytes(&pub_bytes).map_err(|_| JsValue::from_str("Invalid public key"))?;
    
    let mut sig_bytes = [0u8; 64];
    sig_bytes.copy_from_slice(signature);
    let signature = EdSignature::from_bytes(&sig_bytes);
    
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

// ML-DSA-44
#[wasm_bindgen]
pub fn ml_dsa_44_generate_keypair() -> Result<Vec<u8>, JsValue> {
    let mut rng = thread_rng();
    let kp = MlDsa44::key_gen(&mut rng);
    let sk_bytes = kp.signing_key().encode();
    let vk_bytes = kp.verifying_key().encode();
    
    let mut out = Vec::with_capacity(sk_bytes.len() + vk_bytes.len());
    out.extend_from_slice(sk_bytes.as_slice());
    out.extend_from_slice(vk_bytes.as_slice());
    Ok(out)
}

#[wasm_bindgen]
pub fn ml_dsa_44_sign(private_key: &[u8], message: &[u8]) -> Result<Vec<u8>, JsValue> {
    let sk_array = <&ml_dsa::EncodedSigningKey<MlDsa44>>::try_from(private_key)
        .map_err(|_| JsValue::from_str("Invalid private key length"))?;
    let signing_key = MlSigningKey::<MlDsa44>::decode(sk_array);
    let signature = signing_key.sign(message);
    Ok(signature.encode().to_vec())
}

#[wasm_bindgen]
pub fn ml_dsa_44_verify(public_key: &[u8], message: &[u8], signature_bytes: &[u8]) -> Result<bool, JsValue> {
    let vk_array = <&ml_dsa::EncodedVerifyingKey<MlDsa44>>::try_from(public_key)
        .map_err(|_| JsValue::from_str("Invalid public key length"))?;
    let verifying_key = MlVerifyingKey::<MlDsa44>::decode(vk_array);
    
    let sig_array = <&ml_dsa::EncodedSignature<MlDsa44>>::try_from(signature_bytes)
        .map_err(|_| JsValue::from_str("Invalid signature length"))?;
    let signature = MlSignature::<MlDsa44>::decode(sig_array).ok_or_else(|| JsValue::from_str("Invalid signature data"))?;
    
    Ok(verifying_key.verify(message, &signature).is_ok())
}

// SHA-256 & HKDF
#[wasm_bindgen]
pub fn sha256_hash(data: &[u8]) -> Vec<u8> {
    let mut hasher = Sha256::new();
    hasher.update(data);
    hasher.finalize().to_vec()
}

#[wasm_bindgen]
pub fn hkdf_sha256_derive(ikm: &[u8], salt: Option<Vec<u8>>, info: &[u8], length: usize) -> Result<Vec<u8>, JsValue> {
    let salt_ref = salt.as_deref();
    let hk = Hkdf::<Sha256>::new(salt_ref, ikm);
    let mut okm = vec![0u8; length];
    hk.expand(info, &mut okm).map_err(|_| JsValue::from_str("HKDF expansion failed"))?;
    Ok(okm)
}

// Padding
#[wasm_bindgen]
pub fn get_padding_target_size(current_size: usize) -> usize {
    let buckets = [1024, 4096, 16384, 65536, 262144, 1048576];
    for &b in buckets.iter() {
        if current_size <= b {
            return b;
        }
    }
    current_size
}
