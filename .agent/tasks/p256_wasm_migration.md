# P-256 (ECDSA) Implementation Plan for WASM

## Objective
Add P-256 (NIST P-256 / secp256r1) ECDSA support to the WASM crypto module to eliminate the `@noble/curves` dependency for Passkey signature verification.

## Implementation Steps

### 1. Add Dependency to Cargo.toml
```toml
p256 = { version = "0.13", features = ["ecdsa", "sha256"] }
ecdsa = "0.16"
```

### 2. Implement P-256 Functions in lib.rs

Add the following functions:

```rust
// P-256 (ECDSA)
#[wasm_bindgen]
pub fn p256_generate_keypair() -> Result<Vec<u8>, JsValue> {
    use p256::SecretKey;
    use rand::thread_rng;
    
    let mut rng = thread_rng();
    let secret_key = SecretKey::random(&mut rng);
    let public_key = secret_key.public_key();
    
    let mut out = Vec::with_capacity(32 + 65);
    out.extend_from_slice(&secret_key.to_bytes());
    out.extend_from_slice(&public_key.to_sec1_bytes());
    Ok(out)
}

#[wasm_bindgen]
pub fn p256_sign(private_key: &[u8], message: &[u8]) -> Result<Vec<u8>, JsValue> {
    use p256::{SecretKey, ecdsa::{SigningKey, signature::Signer}};
    
    let secret = SecretKey::from_bytes(private_key.into())
        .map_err(|_| JsValue::from_str("Invalid private key"))?;
    let signing_key = SigningKey::from(&secret);
    
    let signature: p256::ecdsa::Signature = signing_key.sign(message);
    Ok(signature.to_bytes().to_vec())
}

#[wasm_bindgen]
pub fn p256_verify(public_key: &[u8], message: &[u8], signature: &[u8]) -> Result<bool, JsValue> {
    use p256::{PublicKey, ecdsa::{VerifyingKey, Signature, signature::Verifier}};
    
    let public = PublicKey::from_sec1_bytes(public_key)
        .map_err(|_| JsValue::from_str("Invalid public key"))?;
    let verifying_key = VerifyingKey::from(&public);
    
    let sig = Signature::from_bytes(signature.into())
        .map_err(|_| JsValue::from_str("Invalid signature"))?;
    
    Ok(verifying_key.verify(message, &sig).is_ok())
}
```

### 3. Export from wasm_core.ts

```typescript
import {
    p256_generate_keypair as wasm_p256_gen,
    p256_sign as wasm_p256_sign,
    p256_verify as wasm_p256_verify,
} from "./wasm_bindings/weba_crypto_wasm.js";

export function p256GenerateKeyPair(): { privateKey: Uint8Array; publicKey: Uint8Array } {
    const combined = wasm_p256_gen();
    return {
        privateKey: combined.slice(0, 32),
        publicKey: combined.slice(32)
    };
}

export function p256Sign(privateKey: Uint8Array, message: Uint8Array): Uint8Array {
    return wasm_p256_sign(privateKey, message);
}

export function p256Verify(publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array): boolean {
    return wasm_p256_verify(publicKey, message, signature);
}
```

### 4. Update vc.ts

Replace:
```typescript
import { p256 } from '@noble/curves/nist.js';
```

With:
```typescript
import { p256Sign, p256Verify } from './wasm_core';
```

### 5. Update form/client files

Similar replacements in:
- `src/form/client/signer.ts`
- `src/form/client/l2viewer.test.ts`

### 6. Remove @noble/curves

After all replacements:
```bash
bun remove @noble/curves
```

## Benefits

1. **Zero External Dependencies**: All crypto in WASM
2. **Consistent API**: Same pattern as Ed25519/X25519
3. **Performance**: Native Rust performance
4. **Security**: RustCrypto is well-audited
5. **Bundle Size**: Smaller than @noble/curves

## Testing

Add tests in `src/crypto-wasm/src/lib.rs`:

```rust
#[test]
fn test_p256_roundtrip() {
    let kp = p256_generate_keypair().unwrap();
    let sk = &kp[0..32];
    let pk = &kp[32..];
    let msg = b"test message";
    
    let sig = p256_sign(sk, msg).unwrap();
    let valid = p256_verify(pk, msg, &sig).unwrap();
    assert!(valid);
}
```

## Timeline

- Add dependency: 1 min
- Implement Rust functions: 10 min
- Update TypeScript bindings: 5 min
- Replace usage in vc.ts: 5 min
- Test and verify: 10 min

**Total: ~30 minutes**
