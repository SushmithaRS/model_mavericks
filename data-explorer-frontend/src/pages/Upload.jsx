import React, { useState } from 'react';
import { Tabs, Tab } from '@mui/material';
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
  const [edaResult, setEdaResult] = useState(null);
  const [featureResult, setFeatureResult] = useState(null);
  const [vizUrl, setVizUrl] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('');
  const [resultTab, setResultTab] = useState(0);
  const hasResults = cleanedData.length > 0 || edaResult || featureResult || vizUrl;

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

  // --- EDA API ---
  const handleEda = async () => {
    if (!downloadUrl) return;
    try {
      const filename = downloadUrl.split('/').pop();
      const response = await axios.post('http://localhost:8000/eda/', { filename });
      setEdaResult(response.data);
    } catch (err) {
      setEdaResult({ error: 'EDA failed.' });
    }
  };

  // --- Feature Selection API ---
  const handleFeatureSelection = async () => {
    if (!downloadUrl) return;
    try {
      const filename = downloadUrl.split('/').pop();
      const response = await axios.post('http://localhost:8000/feature-selection/', { filename, threshold: 0 });
      setFeatureResult(response.data);
    } catch (err) {
      setFeatureResult({ error: 'Feature selection failed.' });
    }
  };

  // --- Visualization API ---
  const handleVisualize = async () => {
    if (!downloadUrl || !selectedColumn) return;
    try {
      const filename = downloadUrl.split('/').pop();
      const response = await axios.get(`http://localhost:8000/visualize/?filename=${filename}&column=${selectedColumn}`);
      setVizUrl(response.data.image_url);
    } catch (err) {
      setVizUrl('');
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
              {/* EDA, Feature Selection, Visualization Buttons */}
              <Box mt={2} display="flex" gap={2} justifyContent="center">
                <Button variant="contained" color="secondary" onClick={() => { handleEda(); setResultTab(0); }}>Run EDA</Button>
                <Button variant="contained" color="success" onClick={() => { handleFeatureSelection(); setResultTab(1); }}>Feature Selection</Button>
                <Button variant="contained" color="info" onClick={() => { handleVisualize(); setResultTab(2); }} disabled={!selectedColumn}>Visualize</Button>
              </Box>
              {/* Column selector for visualization */}
              {columns.length > 0 && (
                <Box mt={2}>
                  <Typography>Select column for visualization:</Typography>
                  <select value={selectedColumn} onChange={e => setSelectedColumn(e.target.value)}>
                    <option value="">--Select--</option>
                    {columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </Box>
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

      {/* Results Tabs: Cleaned Data, EDA, Feature Selection, Visualization */}
      {hasResults && (
        <Box mt={4} sx={{ width: '100%', maxWidth: 1000 }}>
          <Tabs value={resultTab} onChange={(e, v) => setResultTab(v)} centered>
            <Tab label="Cleaned Data" />
            <Tab label="EDA" />
            <Tab label="Feature Selection" />
            <Tab label="Visualization" />
          </Tabs>
          {/* Cleaned Data Tab */}
          {resultTab === 0 && cleanedData.length > 0 && (
            <Box mt={2}>
              <Typography variant="h6" color="primary">Preview Cleaned Data</Typography>
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
          {/* EDA Tab */}
          {resultTab === 1 && edaResult && (
            <Box mt={2}>
              <Typography variant="h6" color="secondary">EDA Summary</Typography>
              {edaResult.error ? (
                <Typography color="error">{edaResult.error}</Typography>
              ) : (
                <Paper sx={{ p: 2, mt: 2 }}>
                  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{edaResult}</pre>
                </Paper>
              )}
            </Box>
          )}
          {/* Feature Selection Tab */}
          {resultTab === 2 && featureResult && (
            <Box mt={2}>
              <Typography variant="h6" color="success.main">Selected Features</Typography>
              {featureResult.error ? (
                <Typography color="error">{featureResult.error}</Typography>
              ) : (
                <Paper sx={{ p: 2, mt: 2 }}>
                  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(featureResult, null, 2)}</pre>
                </Paper>
              )}
            </Box>
          )}
          {/* Visualization Tab */}
          {resultTab === 3 && vizUrl && (
            <Box mt={2}>
              <Typography variant="h6" color="info.main">Visualization</Typography>
              <img src={vizUrl} alt="Visualization" style={{ maxWidth: '100%', borderRadius: 8, marginTop: 8 }} />
            </Box>
          )}
        </Box>
      )}

    </Box>
  );
};

export default Upload;
