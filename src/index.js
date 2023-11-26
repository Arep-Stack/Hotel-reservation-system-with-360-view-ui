import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import axios from 'axios';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './index.css';

axios.defaults.baseURL = process.env.REACT_APP_BE_BASE_URL;

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
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MantineProvider>
  </React.StrictMode>,
);
