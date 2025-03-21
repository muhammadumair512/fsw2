import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// This endpoint needs to be accessible during registration (when users aren't authenticated yet)
export async function POST(request: Request) {
  try {
    const { fileName, fileType } = await request.json();
    
    if (!fileName || !fileType) {
      return NextResponse.json(
        { message: 'fileName and fileType are required' },
        { status: 400 }
      );
    }
    
    // Verify it's an image file
    if (!fileType.startsWith('image/')) {
      return NextResponse.json(
        { message: 'Only image files are allowed' },
        { status: 400 }
      );
    }
    
    // Configure Cloudinary with error handling
    try {
      cloudinary.config({
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
        api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '',
        api_secret: process.env.CLOUDINARY_API_SECRET || '',
      });
    } catch (configError) {
      console.error('Cloudinary configuration error:', configError);
      return NextResponse.json(
        { message: 'Error configuring storage service' },
        { status: 500 }
      );
    }
    
    // Generate upload signature
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'profile_pictures'; // Store in a specific folder
    const publicId = `${folder}/${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
    
    const signatureParams = {
      timestamp,
      folder,
      public_id: publicId,
    };
    
    try {
      const signature = cloudinary.utils.api_sign_request(
        signatureParams,
        process.env.CLOUDINARY_API_SECRET || ''
      );
      
      return NextResponse.json({
        signature,
        timestamp,
        apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        folder,
        publicId,
      });
    } catch (signError) {
      console.error('Signature generation error:', signError);
      return NextResponse.json(
        { message: 'Failed to generate upload signature' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Upload URL generation error:', error);
    return NextResponse.json(
      { message: 'Failed to process upload request' },
      { status: 500 }
    );
  }
}