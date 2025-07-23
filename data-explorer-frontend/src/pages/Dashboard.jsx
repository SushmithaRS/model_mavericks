import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import InsightsIcon from '@mui/icons-material/Insights';
import TimelineIcon from '@mui/icons-material/Timeline';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

export default function Dashboard() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        p: 4,
        background: 'linear-gradient(to right, #e0f7fa, #fce4ec)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          maxWidth: '900px',
          width: '100%',
          p: 6,
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(6px)',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
          border: '2px solid #b2ebf2',
        }}
      >
        <Box textAlign="center" mb={4}>
          <RocketLaunchIcon sx={{ fontSize: 50, color: '#0288d1' }} />
          <Typography variant="h3" fontWeight="bold" color="#0288d1" gutterBottom>
            AI-Driven Data Explorer
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Accelerate insights from raw data using automation and AI
          </Typography>
        </Box>

        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
          This intelligent platform empowers data scientists and analysts to move rapidly from messy raw datasets
          to actionable insights using a seamless, automated workflow.
        </Typography>

        <List>
          <ListItem>
            <ListItemIcon>
              <InsightsIcon sx={{ color: '#4caf50' }} />
            </ListItemIcon>
            <ListItemText primary="Automated Exploratory Data Analysis (EDA)" />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <AutoGraphIcon sx={{ color: '#ff9800' }} />
            </ListItemIcon>
            <ListItemText primary="Smart Feature Selection & Engineering" />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <TimelineIcon sx={{ color: '#3f51b5' }} />
            </ListItemIcon>
            <ListItemText primary="Interactive Visualizations & Insight Extraction" />
          </ListItem>
        </List>

        <Typography variant="body1" mt={3} sx={{ fontStyle: 'italic' }}>
          Build smarter models. Make data-driven decisions. Unlock the power of AI – faster than ever!
        </Typography>
      </Paper>
    </Box>
  );
}
