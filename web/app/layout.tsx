import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import theme from "@/theme";
import "./globals.css";

const SITE_URL = "https://missouri-transitional-benefits.policyengine.org/";
const TITLE =
  "Missouri Transitional Benefits Program | Benefits Cliff Analysis | PolicyEngine";
const DESCRIPTION =
  "Explore how Missouri's Transitional Benefits Program (SB 82) reshapes SNAP benefit cliffs. Interactive analysis of marginal tax rates, phase-outs, and multi-year eligibility impacts.";
const GA_ID = "G-2YHG89FY0N";
const TOOL_NAME = "missouri-transitional-benefits";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    title: "Missouri Transitional Benefits Program | PolicyEngine",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "PolicyEngine",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@ThePolicyEngine",
    title: "Missouri Transitional Benefits Program | PolicyEngine",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#319795",
  colorScheme: "light",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Missouri Transitional Benefits Program Analysis",
  description:
    "Interactive tool analyzing how Missouri's Transitional Benefits Program (SB 82) reshapes SNAP benefit cliffs, marginal tax rates, and multi-year eligibility.",
  url: SITE_URL,
  applicationCategory: "Government",
  operatingSystem: "Any",
  author: {
    "@type": "Organization",
    name: "PolicyEngine",
    url: "https://policyengine.org",
  },
  about: {
    "@type": "GovernmentService",
    name: "SNAP (Supplemental Nutrition Assistance Program)",
    serviceArea: {
      "@type": "AdministrativeArea",
      name: "Missouri",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <ColorSchemeScript />
        <link
          rel="preconnect"
          href="https://www.googletagmanager.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <Script
          id="ld-json"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { tool_name: '${TOOL_NAME}' });
        `}</Script>
        <Script id="ga-engagement" strategy="afterInteractive">{`
          (function() {
            var TOOL_NAME = '${TOOL_NAME}';
            if (typeof window === 'undefined' || !window.gtag) return;
            var scrollFired = {};
            window.addEventListener('scroll', function() {
              var docHeight = document.documentElement.scrollHeight - window.innerHeight;
              if (docHeight <= 0) return;
              var pct = Math.floor((window.scrollY / docHeight) * 100);
              [25, 50, 75, 100].forEach(function(m) {
                if (pct >= m && !scrollFired[m]) {
                  scrollFired[m] = true;
                  window.gtag('event', 'scroll_depth', { percent: m, tool_name: TOOL_NAME });
                }
              });
            }, { passive: true });
            [30, 60, 120, 300].forEach(function(sec) {
              setTimeout(function() {
                if (document.visibilityState !== 'hidden') {
                  window.gtag('event', 'time_on_tool', { seconds: sec, tool_name: TOOL_NAME });
                }
              }, sec * 1000);
            });
            document.addEventListener('click', function(e) {
              var link = e.target && e.target.closest ? e.target.closest('a') : null;
              if (!link || !link.href) return;
              try {
                var url = new URL(link.href, window.location.origin);
                if (url.hostname && url.hostname !== window.location.hostname) {
                  window.gtag('event', 'outbound_click', {
                    url: link.href,
                    target_hostname: url.hostname,
                    tool_name: TOOL_NAME
                  });
                }
              } catch (err) {}
            });
          })();
        `}</Script>
      </head>
      <body>
        <MantineProvider theme={theme}>{children}</MantineProvider>
        <noscript>
          <h1>Missouri Transitional Benefits Program</h1>
          <p>
            This interactive tool analyzes how Missouri&apos;s Transitional
            Benefits Program (SB 82) reshapes SNAP benefit cliffs. JavaScript is
            required to view the interactive charts and analysis.
          </p>
          <p>
            Learn more at{" "}
            <a href="https://policyengine.org">PolicyEngine</a>.
          </p>
        </noscript>
      </body>
    </html>
  );
}
