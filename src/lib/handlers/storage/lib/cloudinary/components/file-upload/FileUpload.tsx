import { CloudUpload as UploadIcon } from '@mui/icons-material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ErrorIcon from '@mui/icons-material/Error';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

import { useSnackbar } from '@/components/snackbar';

import { DropZone, Input, UploadContainer } from './FileUpload.style';
import {
  CloudinaryUploadResponse,
  FileUploadProps,
  UploadStatus,
} from './FileUpload.types';
import { SignatureResponse } from '../../types/SignatureResponse';

const FileUpload: React.FC<FileUploadProps> = ({
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  hoist = () => { },
  reset,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [, setUploadProgress] = useState<{ [key: string]: number }>({});
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (reset) {
      setFiles([]);
      setUploadStatus(null);
      setUploadProgress({});
      hoist(''); // Clear the hoisted value
    }
  }, [reset, hoist]);

  const validateFiles = (
    fileList: File[],
  ): { isValid: boolean; error?: string } => {
    const hasInvalidType = fileList.some(
      file => file.type !== 'application/pdf',
    );

    if (hasInvalidType) {
      return { isValid: false, error: 'Only PDF files are allowed' };
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
  };

  const getSignature = async (file: File): Promise<SignatureResponse> => {
    const response = await axios.post('/api/upload-url', {
      fileName: file.name,
      fileType: file.type,
    });

    return response.data;
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
    formData.append('resource_type', 'auto');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
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

        return;
      }

      setFiles(prevFiles => [...prevFiles, ...droppedFiles]);
      setUploadStatus(null);
    },
    [files.length],
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

      return;
    }

    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
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
        } catch {
          showSnackbar({
            title: 'Upload Error',
            message: `Failed to upload ${file.name}`,
          });
          throw new Error(`Failed to upload ${file.name}`);
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

      // setFiles([]);
      setUploadProgress({});
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
            size={2}
            color={'primary'}
            sx={{ mr: 2, color: '#ccc' }}
          />
        </Box>
      ) : (
        <DropZone onDragOver={onDragOver} onDrop={onDrop}>
          <Input
            type='file'
            accept='.pdf'
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
                <Stack>
                  <ErrorIcon sx={{ mr: 2, color: 'black' }} />
                  <Typography variant='body2' sx={{ textTransform: 'none' }} color='text.secondary'>
                    There seems to be an error with the file you are trying to upload.
                  </Typography>
                </Stack>
              ) : uploadStatus?.type === 'success' ? (
                <Stack>
                  <DoneAllIcon sx={{ mr: 2, color: 'black' }} />
                  <Typography variant='body2' sx={{ textTransform: 'none' }} color='text.secondary'>
                    File Uploaded Successfully
                  </Typography>
                </Stack>
              ) : (
                <Stack>
                  <UploadIcon
                    sx={{
                      margin: '0 auto',
                      transform: 'translate(-14px, -2px)',
                    }}
                  />
                  <Typography variant='body2' sx={{ textTransform: 'none' }} color='text.secondary'>
                    Browse and choose the files you want to upload from your computer
                  </Typography>
                </Stack>
              )}
            </Button>
          </label>
        </DropZone>
      )}
    </UploadContainer>
  );
};

export default FileUpload;
