
// Stub for L2 Crypto and Guest DID to keep form-core bundle small
// This file is used by src/ssg/index.ts build script to replace heavy modules

// --- Types ---
export type L2Config = {
  enabled: boolean;
  recipient_kid: string;
  recipient_x25519: string;
  recipient_pqc?: string;
  layer1_ref: string;
  weba_version?: string;
  default_enabled?: boolean;
  user_kid?: string;
  campaign_id?: string;
  key_policy?: any;
  epoch_registry_url?: string;
  prekey_url?: string;
};

export type Layer2Encrypted = any;
export type L2Keywrap = any;
export type Layer2Payload = any;
export type OrgKeyPolicy = any;
export type PqcKemProvider = any;

// --- L2 Crypto Functions ---
export async function getPaddingTargetSize(currentSize: number): Promise<number> {
    return currentSize;
}

export function b64urlEncode(bytes: Uint8Array): string {
    return "";
}

export function b64urlDecode(value: string): Uint8Array {
    return new Uint8Array(0);
}

export async function deriveOrgX25519KeyPair(params: any) {
    throw new Error("L2 Stub: Not implemented");
}

export async function deriveKeyPairFromPrf(prfKey: Uint8Array) {
    throw new Error("L2 Stub: Not implemented");
}

export async function wrapRecipientPrivateKey(params: any): Promise<Uint8Array> {
    throw new Error("L2 Stub: Not implemented");
}

export async function buildLayer2Envelope(params: any): Promise<Layer2Encrypted> {
    throw new Error("L2 Stub: Not implemented");
}

export function loadL2Config(): L2Config | null {
    return null;
}

export class ReplayGuard {
  constructor(store?: any) {}
  async checkAndMark(nonce: string): Promise<boolean> { return true; }
  async reset(): Promise<void> {}
}

export async function decryptLayer2Envelope(envelope: any, recipientSk: any, options?: any): Promise<any> {
    throw new Error("L2 Stub: Not implemented");
}

export async function fetchPreKey(url: string): Promise<any> {
    return null;
}

export async function fetchEpochRegistry(url: string): Promise<any> {
    return null;
}

export function selectEpochKey(registry: any): any {
    return null;
}

export async function unwrapRecipientPrivateKey(params: any): Promise<Uint8Array> {
    throw new Error("L2 Stub: Not implemented");
}

// --- Guest DID Functions ---
export interface GuestDidResult {
    did: string;
    isReused: boolean;
}

export async function getOrCreateGuestDid(forceNew = false): Promise<GuestDidResult> {
    throw new Error("Guest DID Stub: Not implemented");
}

export async function sendGuestMessage(did: string, recipientDid: string, messageText: string): Promise<any> {
    throw new Error("Guest DID Stub: Not implemented");
}

export async function fetchGuestInbox(did: string): Promise<any[]> {
    throw new Error("Guest DID Stub: Not implemented");
}
