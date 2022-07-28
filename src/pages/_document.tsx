import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html data-theme="dark">
      <Head />
      <body className="prose max-w-full">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
