// src/app/layout.tsx
"use client"
import { ReactNode } from 'react';
import { createGlobalStyle, ThemeProvider } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background-color: #1a1a2e;
    color: #ffffff;
    font-family: 'Arial', sans-serif;
  }
`;

const theme = {
  colors: {
    primary: '#5f0f40',
    secondary: '#9a031e',
    accent: '#fb8b24',
    background: '#1a1a2e',
    text: '#ffffff',
  },
};

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => (
  <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Degen Profit Calculator</title>
    </head>
    <body>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </body>
  </html>
);

export default Layout;