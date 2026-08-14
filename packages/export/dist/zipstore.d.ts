export interface StoredZipEntry {
    name: string;
    data: Uint8Array;
}
/** Build a store-mode ZIP archive from the entries, as one byte array. */
export declare function zipStore(entries: StoredZipEntry[]): Uint8Array;
