import createMuiTheme from '@material-ui/core/styles/createMuiTheme';

const theme = createMuiTheme({
  palette: {
    type: 'light',
  },
  typography: {
    fontSize: 14,
    htmlFontSize: 16,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 600,
    fontFamily: ['"Source Sans Pro"', '"Segoe UI"', '"Helvetica Neue"', '-apple-system', 'Arial', 'sans-serif'].join(
      ','
    ),
    button: {
      textTransform: 'initial',
      fontWeight: 400,
    },
  },
  shape: {
    borderRadius: 2,
  },
});

export default theme;
