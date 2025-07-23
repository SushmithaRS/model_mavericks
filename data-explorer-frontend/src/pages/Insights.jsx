import { Box, Typography, Paper } from '@mui/material';

export default function Insights() {
  return (
    <Box p={4} sx={{ background: '#e3f2fd', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, backgroundColor: '#bbdefb' }}>
        <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
          Insights & Visualization
        </Typography>
        <Typography variant="body1">
          Explore trends, correlations, and other hidden patterns from your dataset.
        </Typography>
        {/* Charts like bar, line, pie can be added here */}
        <Typography mt={3} variant="body2" color="textSecondary">
          (Insightful charts and graphs go here...)
        </Typography>
      </Paper>
    </Box>
  );
}
