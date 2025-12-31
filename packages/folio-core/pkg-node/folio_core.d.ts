/* tslint:disable */
/* eslint-disable */

export class WasmJpkiController {
  free(): void;
  [Symbol.dispose](): void;
  verify_pin(pin_ef: Uint8Array, pin: string): Promise<void>;
  read_auth_cert(): Promise<Uint8Array>;
  select_jpki_ap(): Promise<void>;
  compute_signature(data: Uint8Array): Promise<Uint8Array>;
  constructor(reader: WebUsbReader);
}

export class WebUsbReader {
  free(): void;
  [Symbol.dispose](): void;
  constructor(js_transport: any);
}

export function greet(): string;
