/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export const aes_gcm_decrypt: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number, number];
export const aes_gcm_encrypt: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number, number];
export const constant_time_equal: (a: number, b: number, c: number, d: number) => number;
export const ed25519_generate_keypair: () => [number, number, number, number];
export const ed25519_sign: (a: number, b: number, c: number, d: number) => [number, number, number, number];
export const ed25519_verify: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number];
export const get_padding_target_size: (a: number) => number;
export const get_version: () => [number, number];
export const hkdf_sha256_derive: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number, number];
export const ml_dsa_44_generate_keypair: () => [number, number, number, number];
export const ml_dsa_44_sign: (a: number, b: number, c: number, d: number) => [number, number, number, number];
export const ml_dsa_44_verify: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number];
export const ml_kem_768_decapsulate: (a: number, b: number, c: number, d: number) => [number, number, number, number];
export const ml_kem_768_encapsulate: (a: number, b: number) => [number, number, number, number];
export const ml_kem_768_generate_keypair: () => [number, number, number, number];
export const sha256_hash: (a: number, b: number) => [number, number];
export const x25519_generate_keypair: () => [number, number, number, number];
export const x25519_get_public_key: (a: number, b: number) => [number, number, number, number];
export const x25519_get_shared_secret: (a: number, b: number, c: number, d: number) => [number, number, number, number];
export const __wbindgen_exn_store: (a: number) => void;
export const __externref_table_alloc: () => number;
export const __wbindgen_externrefs: WebAssembly.Table;
export const __wbindgen_malloc: (a: number, b: number) => number;
export const __externref_table_dealloc: (a: number) => void;
export const __wbindgen_free: (a: number, b: number, c: number) => void;
export const __wbindgen_start: () => void;
