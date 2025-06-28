
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme ? savedTheme === 'dark' : false;
    } catch (error) {
      console.error('Error reading theme from localStorage:', error);
      return false;
    }
  });

  const toggleTheme = () => setDarkMode((prev) => !prev);

  useEffect(() => {
    try {
      const themeMode = darkMode ? 'dark' : 'light';
      localStorage.setItem('theme', themeMode);
      document.documentElement.setAttribute('data-theme', themeMode);
      document.body.classList.toggle('dark-mode', darkMode);
      document.body.classList.toggle('light-mode', !darkMode);
    } catch (error) {
      console.error('Error setting theme:', error);
    }
  }, [darkMode]);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#4A90E2' : '#2196F3', // Blue
        light: darkMode ? '#66A3F8' : '#64B5F6',
        dark: darkMode ? '#3373CC' : '#1976D2',
        contrastText: darkMode ? '#FFFFFF' : '#000000',
      },
      secondary: {
        main: darkMode ? '#FF6B6B' : '#FF4081', // Coral
        light: darkMode ? '#FF8E8E' : '#FF6E96',
        dark: darkMode ? '#E54D4D' : '#E91E63',
        contrastText: darkMode ? '#000000' : '#FFFFFF',
      },
      error: {
        main: darkMode ? '#CF6679' : '#B00020',
        contrastText: '#FFFFFF',
      },
      warning: {
        main: '#FFAB00',
        contrastText: '#000000',
      },
      info: {
        main: darkMode ? '#82B1FF' : '#2962FF',
        contrastText: '#FFFFFF',
      },
      success: {
        main: darkMode ? '#69F0AE' : '#00C853',
        contrastText: '#000000',
      },
      background: {
        default: darkMode ? '#1A1A1A' : '#F5F7FA',
        paper: darkMode ? '#2D2D2D' : '#FFFFFF',
      },
      text: {
        primary: darkMode ? '#FFFFFF' : '#212121',
        secondary: darkMode ? '#CCCCCC' : '#666666',
        disabled: darkMode ? '#666666' : '#999999',
      },
      divider: darkMode ? '#383838' : '#E0E0E0',
      action: {
        active: darkMode ? '#FFFFFF' : '#000000',
        hover: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        hoverOpacity: 0.08,
        selected: darkMode ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
        selectedOpacity: 0.16,
        disabled: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',
        disabledBackground: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
        disabledOpacity: 0.38,
      },
    },
    typography: {
      fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 800, fontSize: '3rem', letterSpacing: '-0.5px' },
      h2: { fontWeight: 700, fontSize: '2.5rem', letterSpacing: '-0.5px' },
      h3: { fontWeight: 700, fontSize: '2rem' },
      h4: { fontWeight: 700, fontSize: '1.75rem' },
      h5: { fontWeight: 600, fontSize: '1.5rem' },
      h6: { fontWeight: 600, fontSize: '1.25rem' },
      subtitle1: { fontWeight: 500, fontSize: '1rem' },
      body1: { fontWeight: 400, fontSize: '1rem', lineHeight: 1.6 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            letterSpacing: '0.5px',
            padding: '8px 22px',
            borderRadius: '10px',
            transition: 'all 0.3s ease',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: darkMode 
                ? '0 4px 12px rgba(187, 134, 252, 0.3)' 
                : '0 4px 12px rgba(98, 0, 238, 0.3)',
              transform: 'translateY(-1px)',
            },
          },
          outlined: {
            borderWidth: '2px',
            '&:hover': {
              borderWidth: '2px',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: darkMode 
              ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
              : '0 4px 20px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            border: darkMode ? '1px solid #2A2A2A' : '1px solid #E0E0E0',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: darkMode 
                ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
                : '0 8px 32px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#1E1E1E' : '#6200EE',
            color: '#FFFFFF',
            boxShadow: 'none',
            borderBottom: darkMode ? '1px solid #383838' : 'none',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: darkMode ? '#383838' : '#E0E0E0',
              },
              '&:hover fieldset': {
                borderColor: darkMode ? '#BB86FC' : '#6200EE',
              },
              '&.Mui-focused fieldset': {
                borderColor: darkMode ? '#BB86FC' : '#6200EE',
                borderWidth: '2px',
              },
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: darkMode ? '#383838' : '#E0E0E0',
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              backgroundColor: darkMode 
                ? 'rgba(187, 134, 252, 0.16)' 
                : 'rgba(98, 0, 238, 0.08)',
            },
            '&.Mui-selected:hover': {
              backgroundColor: darkMode 
                ? 'rgba(187, 134, 252, 0.24)' 
                : 'rgba(98, 0, 238, 0.12)',
            },
          },
        },
      },
    },
    transitions: {
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
    },
  }), [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
