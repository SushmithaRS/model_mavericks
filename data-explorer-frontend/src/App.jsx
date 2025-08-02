// App.js
import React, { useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from './components/Sidebar';
import Upload from './pages/Upload';
import Chatbot from './pages/Chatbot';

const App = () => {
  const [sessionId, setSessionId] = useState(() => {
    return localStorage.getItem("session_id");
  });

  return (
    <Box display="flex" width="100vw" height="100vh" overflow="hidden">
      {/* Left Sidebar */}
      <Box
        width="260px"
        height="100%"
        sx={{ flexShrink: 0, bgcolor: '#1a237e' }}
      >
        <Sidebar />
      </Box>

      {/* Center Content */}
      <Box
        flexGrow={1}
        height="100%"
        overflow="auto"
        p={2}
        sx={{
          background: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Upload setSessionId={setSessionId} />
      </Box>

      {/* Right Chatbot */}
      <Box
        width="320px"
        height="100%"
        p={2}
        sx={{
          flexShrink: 0,
          background: '#e0f7fa',
          borderLeft: '1px solid #ccc',
          overflowY: 'auto',
        }}
      >
        <Chatbot sessionId={sessionId} />
      </Box>
    </Box>
  );
};

export default App;
