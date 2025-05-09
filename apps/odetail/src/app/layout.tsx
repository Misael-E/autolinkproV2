import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./globals.css";
import StoreProvider from "./StoreProvider";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "O Detail System",
  description: "O Detail inquiries and statistics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={montserrat.className}>
          <StoreProvider>
            {children} <ToastContainer position="bottom-right" theme="dark" />
          </StoreProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
