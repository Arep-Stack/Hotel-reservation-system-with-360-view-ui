import { MantineProvider, createTheme } from '@mantine/core';

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import '@mantine/core/styles.css';
import App from './App';

const themeColors = [
  '#e9fbef',
  '#dcf0e3',
  '#bcdec7',
  '#99c9a9',
  '#7bb990',
  '#68af7f',
  '#5daa76',
  '#4c9465',
  '#408557',
  '#307349',
];

const theme = createTheme({
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
