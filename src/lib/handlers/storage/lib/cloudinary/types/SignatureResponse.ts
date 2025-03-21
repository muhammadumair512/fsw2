
// export interface SignatureResponse {
//   signature: string;
//   timestamp: number;
//   cloudName: string;
//   apiKey: string;
// }
export interface SignatureResponse {
  apiKey: string;
  timestamp: number;
  signature: string;
  cloudName: string;
  publicId?: string;
  folder?: string; // Added folder property
}