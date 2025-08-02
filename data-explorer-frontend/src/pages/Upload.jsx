import React, { useState, useEffect } from 'react';
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
  Select,
  MenuItem,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import axios from 'axios';

const Upload = ({ setSessionId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [cleanedData, setCleanedData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [edaResult, setEdaResult] = useState(null);
  const [featureResult, setFeatureResult] = useState(null);
  const [vizUrl, setVizUrl] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('');
  const [selectedChartType, setSelectedChartType] = useState('bar');

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('');
      setCleanedData([]);
      setColumns([]);
      setDownloadUrl('');
      setEdaResult(null);
      setFeatureResult(null);
      setVizUrl('');
      setSelectedColumn('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:8000/upload/', formData);
      if (response.status === 200) {
        const { session_id, columns, download_url } = response.data;
        localStorage.setItem("session_id", session_id);
        setSessionId(session_id);
        setUploadStatus("success");
        setColumns(columns);
        setSelectedColumn(columns[0]);
        setDownloadUrl(download_url);

        // Fetch cleaned data
        const csvResponse = await axios.get(download_url);
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
        setCleanedData(parsed.slice(0, 20));
      } else {
        setUploadStatus('error');
      }
    } catch (err) {
      console.error(err);
      setUploadStatus('error');
    }
  };

  // EDA
  const fetchEDA = async (filename) => {
    try {
      const response = await axios.post('http://localhost:8000/eda/', { filename });
      setEdaResult(response.data);
    } catch (err) {
      setEdaResult({ error: 'EDA failed.' });
    }
  };

  // Feature Selection
  const fetchFeatures = async (filename) => {
    try {
      const response = await axios.post('http://localhost:8000/feature-selection/', {
        filename,
        threshold: 0,
      });
      setFeatureResult(response.data);
    } catch (err) {
      setFeatureResult({ error: 'Feature selection failed.' });
    }
  };

  // Visualization
  const fetchVisualization = async (filename, column, chartType) => {
    try {
      const query = `filename=${filename}&column=${column}&chart_type=${chartType}`;
      const response = await axios.get(`http://localhost:8000/visualize/?${query}`);
      setVizUrl(response.data.image_url);
    } catch (err) {
      setVizUrl('');
    }
  };

  useEffect(() => {
    if (uploadStatus === 'success' && downloadUrl) {
      const filename = downloadUrl.split('/').pop();
      fetchEDA(filename);
      fetchFeatures(filename);
    }
  }, [uploadStatus, downloadUrl]);

  useEffect(() => {
    if (downloadUrl && selectedColumn) {
      const filename = downloadUrl.split('/').pop();
      fetchVisualization(filename, selectedColumn, selectedChartType);
    }
  }, [selectedColumn, selectedChartType, downloadUrl]);

  return (
    <Box p={3} height="100%" overflow="auto">
      <Paper
        elevation={4}
        sx={{
          p: 4,
          mb: 4,
          maxWidth: 600,
          mx: 'auto',
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
          Upload Your Dataset
        </Typography>

        <Typography variant="body2" mb={2}>
          Supports CSV and Excel formats.
        </Typography>

        <Stack alignItems="center" spacing={2}>
          <CloudUploadIcon fontSize="large" color="primary" />
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
          >
            Choose File
            <input type="file" hidden onChange={handleFileChange} accept=".csv,.xlsx,.xls" />
          </Button>

          {selectedFile && (
            <Typography variant="subtitle1">
              <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />
              {selectedFile.name}
            </Typography>
          )}

          {selectedFile && (
            <Button variant="outlined" color="primary" onClick={handleUpload}>
              Upload to Server
            </Button>
          )}

          {uploadStatus === 'error' && (
            <Typography color="error">❌ Upload failed</Typography>
          )}
        </Stack>
      </Paper>

      {/* Grid Section */}
      {cleanedData.length > 0 && (
        <Box
          display="grid"
          gridTemplateColumns="1fr 1fr"
          gridTemplateRows="1fr 1fr"
          gap={3}
          height="800px"
        >
          {/* Cleaned Data */}
          <Paper sx={{ p: 2, overflow: 'auto', height: '100%' }}>
            <Typography variant="h6" gutterBottom>Cleaned Data</Typography>
            <TableContainer>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {columns.map((col, idx) => (
                      <TableCell key={idx}>{col}</TableCell>
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
          </Paper>

          {/* EDA */}
          <Paper sx={{ p: 2, overflow: 'auto', height: '100%' }}>
            <Typography variant="h6" gutterBottom>EDA</Typography>
            {edaResult?.error ? (
              <Typography color="error">{edaResult.error}</Typography>
            ) : (
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>
                {typeof edaResult === 'string'
                  ? edaResult
                  : JSON.stringify(edaResult, null, 2)}
              </pre>
            )}
          </Paper>

          {/* Feature Selection */}
          <Paper sx={{ p: 2, overflow: 'auto', height: '100%' }}>
            <Typography variant="h6" gutterBottom>Feature Selection</Typography>
            {featureResult?.error ? (
              <Typography color="error">{featureResult.error}</Typography>
            ) : (
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>
                {JSON.stringify(featureResult, null, 2)}
              </pre>
            )}
          </Paper>

          {/* Visualization */}
          <Paper sx={{ p: 2, overflow: 'auto', height: '100%' }}>
            <Typography variant="h6" gutterBottom>Visualization</Typography>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Select
                size="small"
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
              >
                {columns.map((col) => (
                  <MenuItem key={col} value={col}>{col}</MenuItem>
                ))}
              </Select>
              <Select
                size="small"
                value={selectedChartType}
                onChange={(e) => setSelectedChartType(e.target.value)}
              >
                <MenuItem value="bar">Bar</MenuItem>
                <MenuItem value="line">Line</MenuItem>
                <MenuItem value="histogram">Histogram</MenuItem>
                <MenuItem value="box">Box</MenuItem>
                <MenuItem value="scatter">Scatter</MenuItem>
                <MenuItem value="pie">Pie</MenuItem>
              </Select>
            </Stack>
            {vizUrl ? (
              <img
                src={vizUrl}
                alt="Visualization"
                style={{ width: '100%', borderRadius: 8 }}
              />
            ) : (
              <Typography variant="body2">No visualization available</Typography>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default Upload;
