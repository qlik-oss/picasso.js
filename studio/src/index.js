import 'regenerator-runtime/runtime'; // Polyfill for using async/await
import React from 'react';
import ReactDOM from 'react-dom';
import CssBaseLine from '@material-ui/core/CssBaseline';
import { BrowserRouter as Router, withRouter } from 'react-router-dom';
import { ThemeProvider, createMuiTheme } from '@material-ui/core';
import green from '@material-ui/core/colors/green';
import App from './App';
import './index.css';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: green,
  },
  typography: {
    fontFamily: ['"Source Sans Pro"', '"Segoe UI"', '"Helvetica Neue"', '-apple-system', 'Arial', 'sans-serif'].join(
      ','
    ),
  },
});

const HistoryApp = withRouter(App);

/* eslint-disable react/jsx-filename-extension */
ReactDOM.render(
  <Router>
    <CssBaseLine />
    <ThemeProvider theme={theme}>
      <HistoryApp />
    </ThemeProvider>
  </Router>,
  document.getElementById('app')
);
/* eslint-enable react/jsx-filename-extension */
