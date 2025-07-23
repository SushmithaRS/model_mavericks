import React from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  ListItemIcon,
  Box
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SearchIcon from '@mui/icons-material/Search';
import InsightsIcon from '@mui/icons-material/Insights';
import BarChartIcon from '@mui/icons-material/BarChart';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { text: 'Upload Data', path: '/upload', icon: <CloudUploadIcon /> },
    { text: 'Explore Data', path: '/explore', icon: <SearchIcon /> },
    { text: 'Insights', path: '/insights', icon: <InsightsIcon /> },
    { text: 'Visualizations', path: '/visualizations', icon: <BarChartIcon /> },
  ];

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
        },
      }}
    >
      <Box sx={{ py: 3, textAlign: 'center', background: '#0d47a1', boxShadow: 2 }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{
            color: '#fff',
            fontFamily: 'Montserrat, sans-serif',
            letterSpacing: 1.5
          }}
        >
          AI Explorer
        </Typography>
      </Box>

      <List sx={{ mt: 2 }}>
        {navItems.map(({ text, path, icon }) => (
          <ListItemButton
            key={text}
            component={Link}
            to={path}
            selected={location.pathname === path}
            sx={{
              mx: 2,
              mb: 1,
              borderRadius: 2,
              transition: 'all 0.3s ease-in-out',
              backgroundColor: location.pathname === path ? 'rgba(255,255,255,0.15)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.25)',
                transform: 'scale(1.02)',
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(255,255,255,0.2)',
                boxShadow: '0 0 10px rgba(255,255,255,0.3)',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#fff' }}>{icon}</ListItemIcon>
            <ListItemText
              primary={text}
              primaryTypographyProps={{
                fontSize: '1rem',
                fontWeight: 500,
                fontFamily: 'Roboto, sans-serif',
              }}
            />
          </ListItemButton>
        ))}
      </List>

      <Box flexGrow={1} />

      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="caption" sx={{ color: '#bbb' }}>
          © 2025 AI Explorer
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
