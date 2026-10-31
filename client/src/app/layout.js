import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "./providers";
import ServiceWorkerRegistrar from "./ServiceWorkerRegistrar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-5NHJF9Q5ZS";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vyapar-sathi.vercel.app";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vyapar Sakha — Smart Business Management for Indian Retailers",
    template: "%s | Vyapar Sakha",
  },
  description:
    "Vyapar Sakha helps Indian shop owners manage inventory, track sales, generate GST invoices, and grow their business — all in one place. Simple, fast, and built for Bharat.",
  keywords: [
    "vyapar sakha",
    "vyapar sathi",
    "business management software",
    "retail billing software",
    "inventory management India",
    "Indian retail ERP",
    "shop management app",
    "GST billing software",
    "point of sale POS system",
    "stock management app",
    "kirana store billing",
    "barcode scanner billing",
    "AI automation retail",
    "AI agent for retail stores",
    "offline billing software",
    "multi store management"
  ],
  authors: [{ name: "Vyapar Sakha Team", url: SITE_URL }],
  creator: "Vyapar Sakha",
  publisher: "Vyapar Sakha",
  category: "Business & Productivity",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/images/logo/vyapar-sakha-version2-logo.svg",
    shortcut: "/images/logo/vyapar-sakha-version2-logo.svg",
    apple: "/images/logo/vyapar-sakha-version2-logo.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Vyapar Sakha — Smart Business Management for Indian Retailers",
    description:
      "Manage your shop, inventory, sales, and GST billing effortlessly with Vyapar Sakha.",
    url: SITE_URL,
    siteName: "Vyapar Sakha",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/logo/vyapar-sakha-version2-logo.svg",
        width: 1200,
        height: 630,
        alt: "Vyapar Sakha — Smart Business Management Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vyapar Sakha — Smart Business Management for Indian Retailers",
    description:
      "All-in-one inventory, GST billing, and retail operations platform built for Indian retailers.",
    images: ["/images/logo/vyapar-sakha-version2-logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Vyapar Sakha",
      description: "Smart Business Management for Indian Retailers",
      inLanguage: "en-IN",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: "Vyapar Sakha",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, Android, iOS, Windows",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
      },
      description:
        "Vyapar Sakha helps Indian shop owners manage inventory, track sales, generate GST bills, and scale retail stores with AI automation.",
      featureList: [
        "Real-time Inventory & Stock Tracking",
        "Fast GST Billing & POS Invoicing",
        "Barcode & SKU Scanning Hub",
        "Multi-Store Isolation & Role-based Access",
        "AI Retail Insights & Automation",
        "Offline Billing Support"
      ],
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Vyapar Sakha",
      url: SITE_URL,
      logo: `${SITE_URL}/images/logo/vyapar-sakha-version2-logo.svg`,
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="/images/logo/vyapar-sakha-version2-logo.svg"
          type="image/svg+xml"
          sizes="any"
        />
        <link
          rel="shortcut icon"
          href="/images/logo/vyapar-sakha-version2-logo.svg"
          type="image/svg+xml"
        />
        <link rel="apple-touch-icon" href="/images/logo/vyapar-sakha-version2-logo.svg" />
        <meta name="theme-color" content="#1e40af" />
        
        {/* Preconnect for Google Analytics & Google Tag Manager to optimize Core Web Vitals */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* JSON-LD Structured Data Schema for Rich Google Search Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google tag (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />

        <Providers>{children}</Providers>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
