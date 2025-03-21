/* eslint-disable @typescript-eslint/no-unused-vars */
import { v2 as cloudinary } from 'cloudinary';
import cloudinaryConfig from './config';
import { SignatureResponse } from './types/SignatureResponse';
import { IFileStorageService } from '../../interfaces/IFileStorageService';
export class CloudinaryService implements IFileStorageService {
  constructor() {
    cloudinary.config(cloudinaryConfig);
  }
  async generateUploadUrl(
    fileName: string,
    _fileType: string,
  ): Promise<SignatureResponse> {
    const publicId = `${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        public_id: publicId,
      },
      cloudinaryConfig.api_secret || '',
    );
    return {
      signature,
      timestamp,
      apiKey: cloudinaryConfig.api_key,
      cloudName: cloudinaryConfig.cloud_name,
    };
  }
  getFileUrl(fileId: string): string {
    return cloudinary.url(fileId, {
      secure: true,
      resource_type: 'auto',
    });
  }
}
