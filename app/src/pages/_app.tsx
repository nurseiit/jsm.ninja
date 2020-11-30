import App from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from 'styled-components';

import GlobalStyle from '../themes/globalStyle';
import defaultTheme from '../themes/defaultTheme';

class MyApp extends App {
  render(): JSX.Element {
    const { Component, pageProps } = this.props;
    return (
      <>
        <Head>
          <title>🌕🌗🌑 Moon</title>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
        </Head>
        <ThemeProvider theme={defaultTheme}>
          <GlobalStyle />
          <Component {...pageProps} />
        </ThemeProvider>
      </>
    );
  }
}

export default MyApp;
