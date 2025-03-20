import { Box, FormLabel, styled } from '@mui/material';

export const UploadContainer = styled(Box)(() => ({
  width: '100%',
  height: '8rem',
}));

export const DropZone = styled(Box)(({ theme }) => ({
  margin: 'auto 0',
  width: '100%',
  height: '8rem',
  border: `2px dashed #ccc`,
  borderRadius: theme.shape.borderRadius,
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'border .24s ease-in-out',

  '&:hover': {
    border: `2px dashed ${theme.palette.primary.main}`,
  },
}));

export const Input = styled('input')({
  display: 'none',
});

export const DropZoneLabel = styled(FormLabel)({
  fontSize: '1.6rem',
  color: '#666',
  fontWeight: 600,
  marginBottom: '0.8rem',
});
