import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://letzryd.com"),
  title: {
    default: "LetzRyd",
    template: "%s | LetzRyd",
  },
  description: "Local frontend replica of LetzRyd.",
  icons: {
    icon: "/replica-assets/untitled-design-46-dJo4RNjlWeFkMZn5-3f15a17ff9.png",
    apple: "/replica-assets/untitled-design-46-dJo4RNjlWeFkMZn5-a10e369584.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
