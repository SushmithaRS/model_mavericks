import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Stack } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(to right, #e3f2fd, #fce4ec)',
        padding: 4,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: '100%',
          maxWidth: 600,
          padding: 4,
          borderRadius: 4,
          textAlign: 'center',
          backgroundColor: '#ffffffd9',
          backdropFilter: 'blur(5px)',
        }}
      >
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          Upload Your Dataset
        </Typography>

        <Typography variant="body1" color="textSecondary" mb={3}>
          Supports CSV and Excel formats. Analyze your data in seconds!
        </Typography>

        <Box
          sx={{
            border: '2px dashed #1976d2',
            padding: 4,
            borderRadius: 3,
            backgroundColor: '#f1f8ff',
            transition: '0.3s',
            '&:hover': {
              backgroundColor: '#e3f2fd',
              cursor: 'pointer',
            },
          }}
        >
          <Stack direction="column" alignItems="center" spacing={2}>
            <CloudUploadIcon fontSize="large" color="primary" />
            <Button
              variant="contained"
              component="label"
              size="large"
              sx={{ fontWeight: 'bold' }}
            >
              Select File
              <input
                type="file"
                hidden
                onChange={handleFileChange}
                accept=".csv,.xlsx,.xls"
              />
            </Button>
          </Stack>

          {selectedFile && (
            <Box mt={3} display="flex" alignItems="center" justifyContent="center">
              <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" color="green">
                File Uploaded: <strong>{selectedFile.name}</strong>
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Upload;
