export interface UnzippedFile {
    name: string;
    data: Uint8Array;
}
/** Read a ZIP archive into name -> bytes. Throws on a malformed archive. */
export declare function unzip(bytes: Uint8Array): Promise<Map<string, Uint8Array>>;
