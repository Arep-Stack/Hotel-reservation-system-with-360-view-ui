import { MantineProvider, createTheme } from '@mantine/core';

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import '@mantine/core/styles.css';
import App from './App';

const themeColors = [
  '#E8F5E9',
  '#C8E6C9',
  '#A5D6A7',
  '#81C784',
  '#66BB6A',
  '#4CAF50',
  '#43A047',
  '#388E3C',
  '#2E7D32',
  '#1B5E20',
];

const theme = createTheme({
  fontFamily: 'Poppins, sans-serif',
  colors: {
    themeColors,
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <App />
    </MantineProvider>
  </React.StrictMode>,
);
