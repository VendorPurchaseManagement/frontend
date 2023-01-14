import {StyleProvider} from "@ant-design/cssinjs";
import {NextPage} from "next";
import type {AppProps} from "next/app";
import {ReactElement, ReactNode} from "react";
import {Toaster} from "react-hot-toast";
import {MainLayout} from "../common/layout";
import "../styles/globals.css";
export type NextPageWithLayout = NextPage & {
  // eslint-disable-next-line no-unused-vars
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({Component, pageProps}: AppPropsWithLayout) {
  const getLayout =
    Component.getLayout ?? ((page) => <MainLayout>{page}</MainLayout>);
  return (
    <StyleProvider hashPriority="high">
      {getLayout(<Component {...pageProps} />)}
      <Toaster />
    </StyleProvider>
  );
}
