/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import FileUpload from '@/lib/handlers/storage/lib/cloudinary/components/file-upload/FileUpload';

interface ProfileImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({ onImageUpload }) => {
  const handleImageUpload = (url: string) => {
    onImageUpload(url);
  };

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Profile Picture
      </Typography>
      <FileUpload 
        hoist={handleImageUpload}
        maxFiles={1}
        acceptTypes="image/*"
      />
    </Box>
  );
};

export default ProfileImageUpload;