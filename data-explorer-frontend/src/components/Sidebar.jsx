import React from 'react';
import {
  Drawer,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import InsightsIcon from '@mui/icons-material/Insights';
import TimelineIcon from '@mui/icons-material/Timeline';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

const Sidebar = () => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 260,
        '& .MuiDrawer-paper': {
          width: 260,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #1a237e 0%, #0d47a1 100%)',
          color: '#fff',
          borderRight: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 2,
        },
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{
            color: '#fff',
            fontFamily: 'Montserrat, sans-serif',
            letterSpacing: 1.2,
            mt: 1,
          }}
        >
          AI Data Explorer
        </Typography>
      </Box>

      {/* Project Description */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1 }}>
        <Typography variant="body2" mb={2} sx={{ color: '#cfd8dc' }}>
          Accelerate insights from raw data using automation and AI. This intelligent platform empowers data scientists and analysts to move rapidly from messy raw datasets to actionable insights.
        </Typography>

        <Typography variant="subtitle2" sx={{ color: '#fff', mb: 1, fontWeight: 600 }}>
          Features:
        </Typography>

        <List dense>
          <ListItem>
            <ListItemIcon>
              <InsightsIcon sx={{ color: '#81c784' }} />
            </ListItemIcon>
            <ListItemText primary="Automated EDA" primaryTypographyProps={{ fontSize: '0.9rem' }} />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <AutoGraphIcon sx={{ color: '#ffb74d' }} />
            </ListItemIcon>
            <ListItemText primary="Smart Feature Selection" primaryTypographyProps={{ fontSize: '0.9rem' }} />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <TimelineIcon sx={{ color: '#64b5f6' }} />
            </ListItemIcon>
            <ListItemText primary="Interactive Visualizations" primaryTypographyProps={{ fontSize: '0.9rem' }} />
          </ListItem>
        </List>

        <Typography variant="caption" sx={{ mt: 2, display: 'block', fontStyle: 'italic', color: '#b2dfdb' }}>
          Build smarter models. Make data-driven decisions. Unlock the power of AI – faster than ever!
        </Typography>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 2, pt: 2 }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.3)', mb: 1 }} />
        <Typography variant="caption" sx={{ color: '#bbb', textAlign: 'center', display: 'block' }}>
          © 2025 AI Explorer
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
