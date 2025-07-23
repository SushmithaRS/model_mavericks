import { Box, Typography, Paper } from '@mui/material';

export default function Explore() {
  return (
    <Box p={4} sx={{ background: '#f3e5f5', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, backgroundColor: '#fce4ec' }}>
        <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
          Data Explorer
        </Typography>
        <Typography variant="body1" mb={2}>
          View column-wise summary, missing values, and distribution of your dataset.
        </Typography>

        {/* You can plug in data table and charts here */}
        <Typography variant="body2" color="textSecondary">
          (Charts and tables go here...)
        </Typography>
      </Paper>
    </Box>
  );
}
