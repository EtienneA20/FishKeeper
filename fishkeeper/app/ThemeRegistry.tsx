"use client";

import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import React from 'react';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0288d1',
    },
  },
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}