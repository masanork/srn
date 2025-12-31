use sha1::{Sha1, Digest};
use des::TdesEde3;
use cipher::{BlockEncrypt, BlockDecrypt, KeyInit};
// For BAC, we typically use 2-key 3DES (K1=K3), but the crate TdesEde3 supports 3-key. 
// We construct the 24-byte key by repeating the first 8 bytes if necessary or following the 16-byte key Kseed breakdown.
// Actually BAC uses 2-key TDES (16 bytes: K A, K B). 
// TDES operation: E(K_A, D(K_B, E(K_A, data)))

pub struct BacSession {
    k_enc: [u8; 16], // 2-key 3DES keys
    k_mac: [u8; 16],
    ssc: u64, // Send Sequence Counter
}

pub fn derive_key_seed(mrz: &str) -> [u8; 16] {
    // MRZ Information for BAC:
    // Document Number (9 chars) + Check Digit
    // Date of Birth (6 chars) + Check Digit
    // Date of Expiry (6 chars) + Check Digit
    // Total: 9+1 + 6+1 + 6+1 = 24 chars (usually)
    // NOTE: The mrz string passed here MUST be the concatenated string of these fields.
    
    // Hash(MRZ_Info)
    let mut hasher = Sha1::new();
    hasher.update(mrz.as_bytes());
    let hash = hasher.finalize();
    
    // Take first 16 bytes as K_seed
    let mut k_seed = [0u8; 16];
    k_seed.copy_from_slice(&hash[0..16]);
    k_seed
}

pub fn derive_session_keys(k_seed: &[u8; 16]) -> ([u8; 16], [u8; 16]) {
    // Derive K_enc and K_mac from K_seed
    // D = K_seed || c
    // c = 00 00 00 01 for K_enc
    // c = 00 00 00 02 for K_mac
    
    let k_enc = derive_des_key(k_seed, 1);
    let k_mac = derive_des_key(k_seed, 2);
    
    (k_enc, k_mac)
}

fn derive_des_key(k_seed: &[u8; 16], counter: u32) -> [u8; 16] {
    let mut d = Vec::with_capacity(20);
    d.extend_from_slice(k_seed);
    d.extend_from_slice(&counter.to_be_bytes());

    let mut hasher = Sha1::new();
    hasher.update(&d);
    let hash = hasher.finalize();

    // Key Ka = H[0..8], Key Kb = H[8..16]
    // Adjust parity for DES keys?
    // In ICAO 9303, typically we use the raw bytes, parity is ignored by many crypto impls, 
    // but strict implementations force odd parity.
    // We'll define parity adjustment helper.
    
    let mut key = [0u8; 16];
    key.copy_from_slice(&hash[0..16]);
    
    adjust_parity(&mut key);
    key
}

fn adjust_parity(key: &mut [u8]) {
    for byte in key.iter_mut() {
        let mut count = 0;
        for i in 0..7 {
            if (*byte >> i) & 1 == 1 {
                count += 1;
            }
        }
        // If even bits set, last bit (0) should be 1 to make it odd
        // If odd bits set, last bit (0) should be 0 to make it odd
        // Wait, DES parity bit is the LSB.
        // Actually, popcnt of the whole byte usually implies parity.
        // Let's rely on standard practice: set LSB to produce odd parity.
        
        let mask = 0xFE;
        let mut b = *byte & mask; // clear LSB
        let ones = b.count_ones();
        if ones % 2 == 0 {
            b |= 1; // set LSB to 1
        }
        *byte = b;
    }
}

// NOTE: Real implementation needs Full Secure Messaging wrapping (ISO 7816-4).
// This requires:
// 1. Padding (ISO 9797-1 padding method 2)
// 2. Encryption of Data
// 3. MAC calculation over Header + Encrypted Data
// 4. Wrapping into APDU
// For this PoC, we will implement the Key Derivation to prove we can parse MRZ and generate keys.
