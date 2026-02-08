import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/chat.css';
import App from './app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2E86AB',
      light: '#A7C4D8'
    },
    secondary: {
      main: '#F77F00',
    },
    success: {
      main: '#06A77D',
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
