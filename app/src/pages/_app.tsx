import App from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from 'styled-components';
import { GeistProvider, CssBaseline } from '@geist-ui/react';

import GlobalStyle from '../themes/globalStyle';
import defaultTheme from '../themes/defaultTheme';

class MyApp extends App {
  render(): JSX.Element {
    const { Component, pageProps } = this.props;
    return (
      <>
        <Head>
          <title>⭐️🏃‍♂️ Just Star Marathon</title>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
        </Head>
        <ThemeProvider theme={defaultTheme}>
          <GlobalStyle />
          <GeistProvider>
            <CssBaseline />
            <Component {...pageProps} />
          </GeistProvider>
        </ThemeProvider>
      </>
    );
  }
}

export default MyApp;
