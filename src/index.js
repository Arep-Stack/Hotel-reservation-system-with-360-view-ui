import { MantineProvider, createTheme } from '@mantine/core';

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import '@mantine/core/styles.css';
import App from './App';

const themeColors = [
  '#f2f8f2',
  '#e3ede3',
  '#c4dac4',
  '#a1c6a1',
  '#84b584',
  '#72ab71',
  '#68a767',
  '#579156',
  '#4c814b',
  '#3e703e',
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
