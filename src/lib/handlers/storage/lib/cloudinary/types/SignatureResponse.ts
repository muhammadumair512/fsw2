

export interface SignatureResponse {
  apiKey: string;
  timestamp: number;
  signature: string;
  cloudName: string;
  publicId?: string;
  folder?: string; 
}