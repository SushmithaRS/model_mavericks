// src/pages/VisualizationPage.tsx
import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const data = {
  labels: ['Item A', 'Item B', 'Item C'],
  datasets: [
    {
      label: 'Value',
      data: [123, 456, 789],
      backgroundColor: ['#2196f3', '#4caf50', '#f44336'],
    },
  ],
};

const Visualizations = () => {
  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Data Visualizations
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Bar Chart
            </Typography>
            <Bar data={data} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Pie Chart
            </Typography>
            <Pie data={data} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Line Chart
            </Typography>
            <Line data={data} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Visualizations;
