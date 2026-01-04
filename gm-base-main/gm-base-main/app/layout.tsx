import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import { getMainPageFrameMetadata, getMiniAppMetadata } from "@/lib/frame-metadata";

const baseUrl = process.env.NEXT_PUBLIC_HOME_URL || "http://localhost:3000";

// Frame image for main app (1.91:1 aspect ratio, 1200x630)
const frameImageUrl = `${baseUrl}/og-image.jpg`;

// Base Mini App preview image (3:2 aspect ratio, 1200x800)
const miniAppImageUrl = `${baseUrl}/base-og-image.jpg`;

// Generate Frame metadata for main app page
const frameMetadata = getMainPageFrameMetadata(frameImageUrl, baseUrl);

// Generate Base Mini App embed metadata
const miniAppMetadata = getMiniAppMetadata(miniAppImageUrl, baseUrl);

// Viewport configuration for mobile browser chrome handling
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "GM Base - Daily GM on Base",
  description: "Say GM every day on Base blockchain. Build your streak and GM your frens!",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon.jpg", sizes: "1024x1024", type: "image/jpeg" }],
    apple: [{ url: "/icon.jpg", sizes: "180x180", type: "image/jpeg" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GM Base",
  },
  openGraph: {
    title: "GM Base - Daily GM on Base",
    description: "Say GM every day on Base blockchain. Build your streak!",
    url: baseUrl,
    siteName: "GM Base",
    images: [{ url: `${baseUrl}/og-image.jpg`, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GM Base - Daily GM on Base",
    description: "Say GM every day on Base blockchain. Build your streak!",
    images: [`${baseUrl}/og-image.jpg`],
  },
  // Farcaster Frame and Mini App embed metadata
  other: {
    ...frameMetadata,
    "fc:frame": miniAppMetadata,
    "fc:miniapp": miniAppMetadata,
    "base:app_id": "paste-your-app_id-here-inside-the-quotes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0891b2',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
