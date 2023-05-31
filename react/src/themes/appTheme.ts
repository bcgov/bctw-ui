import { createTheme, adaptV4Theme } from '@mui/material';
const appTheme = createTheme(
  adaptV4Theme({
    palette: {
      // https://material-ui.com/customization/palette/
      primary: {
        light: '#5469a4',
        main: '#003366', // BC ID: corporate blue
        dark: '#001949',
        contrastText: '#ffffff'
      },
      secondary: {
        light: '#ffd95e',
        main: '#e3a82b', // BC ID: corporate gold
        dark: '#ad7900',
        contrastText: '#000000'
      },
      info: {
        main: '#1A5A96'
      },
      success: {
        main: '#40AE40',
        contrastText: '#ffffff'
      }
    },

    typography: {
      fontFamily: ['BCSans', 'Verdana', 'Arial', 'sans-serif'].join(',')
    },
    overrides: {
      MuiTypography: {
        // https://material-ui.com/api/typography/
        h1: { fontSize: '3rem' },
        h2: { fontSize: '2.5rem' },
        h3: { fontSize: '2rem' },
        h4: { fontSize: '1.5rem' },
        h5: { fontSize: '1.20rem' },
        h6: { fontSize: '1rem' }
      },

      MuiCircularProgress: {
        // https://material-ui.com/api/circular-progress/
        root: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          height: '60px !important',
          width: '60px !important',
          marginLeft: '-30px',
          marginTop: '-30px'
        }
      },
      MuiPaper: {
        root: {
          borderRadius: 8
        }
      },
      MuiButton: {
        root: {
          textTransform: 'none',
          letterSpacing: 0
        }
      },

      MuiContainer: {
        // https://material-ui.com/api/container/
        root: {
          maxWidth: 'xl'
        }
      },

      MuiInputBase: {
        root: {
          background: '#ffffff'
        }
      },

      MuiInputLabel: {
        outlined: {
          background: '#ffffff'
        },
        shrink: {
          background: '#ffffff'
        }
      },

      MuiTouchRipple: {
        root: {
          display: 'none'
        }
      },

      MuiTab: {
        root: {
          minWidth: '100px !important',
          textTransform: 'none',
          letterSpacing: 0,
          fontWeight: 700
        }
      },

      MuiTableCell: {
        root: {
          fontFamily: ['BCSans', 'Noto Sans', 'Verdana', 'Arial', 'sans-serif'].join(',')
        }
      },

      MuiTableRow: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#daedff',
            color: '#ffffff'
          },
          '&.Mui-selected:hover': {
            backgroundColor: '#daedff'
          }
        }
      }
    }
  })
);
export default appTheme;
