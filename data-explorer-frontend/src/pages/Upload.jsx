import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import axios from 'axios';

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [cleanedData, setCleanedData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('');
      setCleanedData([]);
      setColumns([]);
      setDownloadUrl('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:8000/upload/', formData);
      if (response.status === 200) {
        setUploadStatus('success');
        setColumns(response.data.columns);
        setDownloadUrl(response.data.download_url);

        // Fetch cleaned CSV data
        const csvResponse = await axios.get(response.data.download_url);
        const csvText = csvResponse.data;

        const rows = csvText.split('\n').filter(row => row.trim() !== '');
        const header = rows[0].split(',');
        const parsed = rows.slice(1).map(row => {
          const values = row.split(',');
          const obj = {};
          header.forEach((h, i) => {
            obj[h] = values[i];
          });
          return obj;
        });

        setCleanedData(parsed.slice(0, 20)); // show only 20 rows
      } else {
        setUploadStatus('error');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
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
          mb: 4,
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
            {selectedFile && (
              <Button
                variant="outlined"
                color="primary"
                onClick={handleUpload}
                sx={{ mt: 2 }}
              >
                Upload to Server
              </Button>
            )}
          </Stack>

          {selectedFile && (
            <Box mt={3} display="flex" alignItems="center" justifyContent="center">
              <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" color="green">
                File Selected: <strong>{selectedFile.name}</strong>
              </Typography>
            </Box>
          )}

          {uploadStatus === 'success' && (
            <>
              <Typography color="success.main" mt={2}>
                ✅ Upload successful!
              </Typography>
              {downloadUrl && (
                <Typography mt={1}>
                  👉 <a href={downloadUrl} target="_blank" rel="noopener noreferrer">Download cleaned file</a>
                </Typography>
              )}
            </>
          )}
          {uploadStatus === 'error' && (
            <Typography color="error.main" mt={2}>
              ❌ Upload failed. Try again.
            </Typography>
          )}
        </Box>
      </Paper>

      {cleanedData.length > 0 && (
        <Box sx={{ width: '100%', maxWidth: 1000 }}>
          <Typography variant="h5" gutterBottom color="primary">
            Preview Cleaned Data
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 3, maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {columns.map((col, idx) => (
                    <TableCell key={idx} sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {cleanedData.map((row, idx) => (
                  <TableRow key={idx}>
                    {columns.map((col, i) => (
                      <TableCell key={i}>{row[col]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default Upload;
