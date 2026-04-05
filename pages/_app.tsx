import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";
import ToastProvider from "../components/ui/Toast";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <ToastProvider />
      <Component {...pageProps} />
    </SessionProvider>
  );
}

