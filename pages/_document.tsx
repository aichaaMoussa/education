import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="description" content="itkane - Plateforme d'apprentissage en ligne" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}


