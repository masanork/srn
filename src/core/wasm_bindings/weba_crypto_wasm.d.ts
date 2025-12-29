/* tslint:disable */
/* eslint-disable */

export function aes_gcm_decrypt(key: Uint8Array, iv: Uint8Array, ciphertext: Uint8Array, aad: Uint8Array): Uint8Array;

export function aes_gcm_encrypt(key: Uint8Array, iv: Uint8Array, plaintext: Uint8Array, aad: Uint8Array): Uint8Array;

export function constant_time_equal(a: Uint8Array, b: Uint8Array): boolean;

export function ed25519_generate_keypair(): Uint8Array;

export function ed25519_sign(private_key: Uint8Array, message: Uint8Array): Uint8Array;

export function ed25519_verify(public_key: Uint8Array, message: Uint8Array, signature: Uint8Array): boolean;

export function get_padding_target_size(current_size: number): number;

export function get_version(): string;

export function hkdf_sha256_derive(ikm: Uint8Array, salt: Uint8Array | null | undefined, info: Uint8Array, length: number): Uint8Array;

export function ml_dsa_44_generate_keypair(): Uint8Array;

export function ml_dsa_44_sign(private_key: Uint8Array, message: Uint8Array): Uint8Array;

export function ml_dsa_44_verify(public_key: Uint8Array, message: Uint8Array, signature_bytes: Uint8Array): boolean;

export function ml_kem_768_decapsulate(private_key: Uint8Array, ciphertext: Uint8Array): Uint8Array;

export function ml_kem_768_encapsulate(public_key: Uint8Array): Uint8Array;

export function ml_kem_768_generate_keypair(): Uint8Array;

export function sha256_hash(data: Uint8Array): Uint8Array;

export function x25519_generate_keypair(): Uint8Array;

export function x25519_get_public_key(private_key: Uint8Array): Uint8Array;

export function x25519_get_shared_secret(private_key: Uint8Array, public_key: Uint8Array): Uint8Array;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly aes_gcm_decrypt: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number, number];
  readonly aes_gcm_encrypt: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number, number];
  readonly constant_time_equal: (a: number, b: number, c: number, d: number) => number;
  readonly ed25519_generate_keypair: () => [number, number, number, number];
  readonly ed25519_sign: (a: number, b: number, c: number, d: number) => [number, number, number, number];
  readonly ed25519_verify: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number];
  readonly get_padding_target_size: (a: number) => number;
  readonly get_version: () => [number, number];
  readonly hkdf_sha256_derive: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number, number];
  readonly ml_dsa_44_generate_keypair: () => [number, number, number, number];
  readonly ml_dsa_44_sign: (a: number, b: number, c: number, d: number) => [number, number, number, number];
  readonly ml_dsa_44_verify: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number];
  readonly ml_kem_768_decapsulate: (a: number, b: number, c: number, d: number) => [number, number, number, number];
  readonly ml_kem_768_encapsulate: (a: number, b: number) => [number, number, number, number];
  readonly ml_kem_768_generate_keypair: () => [number, number, number, number];
  readonly sha256_hash: (a: number, b: number) => [number, number];
  readonly x25519_generate_keypair: () => [number, number, number, number];
  readonly x25519_get_public_key: (a: number, b: number) => [number, number, number, number];
  readonly x25519_get_shared_secret: (a: number, b: number, c: number, d: number) => [number, number, number, number];
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
