export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  original_filename: string;
}

export interface UploadStatus {
  type: 'success' | 'error';
  message: string;
  urls?: string[];
}


export interface FileUploadProps {
  maxFileSize?: number;
  maxFiles?: number;
  hoist?: (url: string) => void;
  reset?: boolean;
  acceptTypes?: string; 
}




