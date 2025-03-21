import { CloudUpload as UploadIcon } from '@mui/icons-material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ErrorIcon from '@mui/icons-material/Error';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

import { useSnackbar } from '@/contexts/SnackbarContext';

import { DropZone, Input, UploadContainer } from './FileUpload.style';
import {
  CloudinaryUploadResponse,
  FileUploadProps,
  UploadStatus,
} from './FileUpload.types';
import { SignatureResponse } from '../../types/SignatureResponse';

const FileUpload: React.FC<FileUploadProps> = ({
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 1, // Default to one file for profile pictures
  hoist = () => { },
  reset,
  acceptTypes = 'image/*', // Default to image files
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const { showSnackbar } = useSnackbar();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (reset) {
      setFiles([]);
      setUploadStatus(null);
      setUploadProgress({});
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      hoist(''); // Clear the hoisted value
    }

    // Cleanup function to revoke object URL
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [reset, hoist, previewUrl]);

  const validateFiles = useCallback(
    (fileList: File[]): { isValid: boolean; error?: string } => {
      // Check if file type matches accepted types
      const hasInvalidType = fileList.some(
        file => !file.type.match(acceptTypes),
      );

      if (hasInvalidType) {
        return { isValid: false, error: `Only ${acceptTypes.replace('*', '')} files are allowed` };
      }

      const hasInvalidSize = fileList.some(file => file.size > maxFileSize);

      if (hasInvalidSize) {
        return {
          isValid: false,
          error: `Files must be smaller than ${maxFileSize / (1024 * 1024)}MB`,
        };
      }

      if (files.length + fileList.length > maxFiles) {
        return {
          isValid: false,
          error: `Maximum ${maxFiles} files allowed`,
        };
      }

      return { isValid: true };
    },
    [acceptTypes, maxFileSize, maxFiles, files.length]
  );

  const getSignature = async (file: File): Promise<SignatureResponse> => {
    try {
      const response = await axios.post('/api/upload-url', {
        fileName: file.name,
        fileType: file.type,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting upload signature:', error);
      throw new Error('Failed to get upload authorization');
    }
  };

  const uploadFile = async (
    file: File,
    signature: SignatureResponse,
  ): Promise<CloudinaryUploadResponse> => {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('api_key', signature.apiKey);
    formData.append('timestamp', signature.timestamp.toString());
    formData.append('signature', signature.signature);
    formData.append('folder', signature.folder || 'profile_pictures');
    if (signature.publicId) {
      formData.append('public_id', signature.publicId);
    }
    formData.append('resource_type', 'image');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Cloudinary upload failed:', errorData);
        throw new Error(`Upload failed: ${errorData.error?.message || response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error during file upload:', error);
      throw error;
    }
  };

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      e.stopPropagation();

      const droppedFiles = Array.from(e.dataTransfer.files);
      const validation = validateFiles(droppedFiles);

      if (!validation.isValid) {
        setUploadStatus({
          type: 'error',
          message: validation.error || 'Validation failed',
        });

        showSnackbar({
          message: validation.error || 'Validation failed',
          severity: 'error',
        });

        return;
      }

      // Create preview for the first image
      if (droppedFiles[0] && droppedFiles[0].type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(droppedFiles[0]);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(objectUrl);
      }

      setFiles(prevFiles => {
        // For profile pics, replace existing file
        if (maxFiles === 1) {
          return droppedFiles;
        }
        // Otherwise add to collection
        return [...prevFiles, ...droppedFiles];
      });
      setUploadStatus(null);
    },
    [validateFiles, previewUrl, showSnackbar, maxFiles],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    const validation = validateFiles(selectedFiles);

    if (!validation.isValid) {
      setUploadStatus({
        type: 'error',
        message: validation.error || 'Validation failed',
      });

      showSnackbar({
        message: validation.error || 'Validation failed',
        severity: 'error',
      });

      return;
    }

    // Create preview for the first image
    if (selectedFiles[0] && selectedFiles[0].type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(selectedFiles[0]);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(objectUrl);
    }

    setFiles(prevFiles => {
      // For profile pics, replace existing file
      if (maxFiles === 1) {
        return selectedFiles;
      }
      // Otherwise add to collection
      return [...prevFiles, ...selectedFiles];
    });
    setUploadStatus(null);
  };

  const uploadToCloudinary = async (): Promise<void> => {
    setUploading(true);
    setUploadStatus(null);

    try {
      if (!files[0]) {
        return;
      }

      const signature = await getSignature(files[0]);
      const uploadedUrls: string[] = [];

      for (const file of files) {
        try {
          // Initialize progress for this file
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: 0,
          }));

          const result = await uploadFile(file, signature);

          uploadedUrls.push(result.secure_url);

          // Set progress to 100 for completed file
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: 100,
          }));
          
          // Success notification
          showSnackbar({
            message: 'Image uploaded successfully',
            severity: 'success',
          });
        } catch (error) {
          console.error(`Upload error for ${file.name}:`, error);
          showSnackbar({
            message: `Failed to upload ${file.name}. Please try again.`,
            severity: 'error',
          });
          setUploadStatus({
            type: 'error',
            message: error instanceof Error ? error.message : 'Failed to upload file',
          });
          return; // Exit the function to prevent hoisting an invalid URL
        }
      }

      setUploadStatus({
        type: 'success',
        message: `Successfully uploaded ${uploadedUrls.length} files`,
        urls: uploadedUrls,
      });

      // hoist upwards into parent
      if (uploadedUrls[0]) {
        hoist(uploadedUrls[0]);
      }
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Failed to upload files',
      });
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (files.length > 0) {
      uploadToCloudinary();
    }
  }, [files]);

  return (
    <UploadContainer>
      {uploading ? (
        <Box
          sx={{
            width: '100%',
            height: '8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px dashed #ccc`,
            borderRadius: '8px',
          }}
        >
          <CircularProgress
            size={24}
            color={'primary'}
            sx={{ mr: 2 }}
          />
          <Typography>Uploading...</Typography>
        </Box>
      ) : (
        <DropZone onDragOver={onDragOver} onDrop={onDrop}>
          <Input
            type='file'
            accept={acceptTypes}
            onChange={handleFileSelect}
            id='file-input'
          />

          <label htmlFor='file-input'>
            <Button
              disableRipple
              component='span'
              sx={{
                padding: 0,
                margin: 0,
                width: '100%',
                height: '8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {uploadStatus?.type === 'error' ? (
                <Stack alignItems="center">
                  <ErrorIcon sx={{ color: 'error.main', mb: 1 }} />
                  <Typography variant='body2' sx={{ textTransform: 'none' }} color='text.secondary'>
                    There was an error uploading your file. Please try again.
                  </Typography>
                </Stack>
              ) : uploadStatus?.type === 'success' ? (
                <Stack alignItems="center">
                  <DoneAllIcon sx={{ color: 'success.main', mb: 1 }} />
                  <Typography variant='body2' sx={{ textTransform: 'none' }} color='text.secondary'>
                    File Uploaded Successfully
                  </Typography>
                </Stack>
              ) : (
                <Stack alignItems="center">
                  <UploadIcon
                    sx={{
                      color: 'primary.main',
                      mb: 1
                    }}
                  />
                  <Typography variant='body2' sx={{ textTransform: 'none' }} color='text.secondary'>
                    Drag & drop or click to upload profile picture
                  </Typography>
                </Stack>
              )}
            </Button>
          </label>
        </DropZone>
      )}

      {/* Image Preview */}
      {previewUrl && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Box 
            component="img"
            src={previewUrl}
            alt="Preview"
            sx={{
              maxWidth: '100%', 
              maxHeight: '200px', 
              borderRadius: '8px',
              objectFit: 'contain'
            }}
          />
        </Box>
      )}
    </UploadContainer>
  );
};

export default FileUpload;