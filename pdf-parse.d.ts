// pdf-parse ships no TypeScript types. We only use its default export
// (a function that takes a Buffer and returns { text, ... }). The direct
// lib/pdf-parse.js path avoids the package's index.js, which otherwise
// tries to read a sample test PDF at require time and fails in bundled
// serverless environments.
declare module 'pdf-parse' {
  interface PDFData {
    text: string;
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
  }
  const pdfParse: (buffer: Buffer | Uint8Array, options?: any) => Promise<PDFData>;
  export default pdfParse;
}
declare module 'pdf-parse/lib/pdf-parse.js' {
  import pdfParse from 'pdf-parse';
  export default pdfParse;
}
