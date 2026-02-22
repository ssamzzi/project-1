import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { SiteHeader } from '../components/SiteHeader';
import { LocaleProvider } from '../lib/context/LocaleContext';
import { AdminProvider } from '../lib/context/AdminContext';

export const metadata: Metadata = {
  title: 'BioLT (Bio Lab Tools)',
  description: 'A free static portal for practical bio lab calculations.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6511826255220683"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-65LXZ9XN6V" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-65LXZ9XN6V');
          `}
        </Script>
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "vlflozcyxl");
          `}
        </Script>
        <LocaleProvider>
          <AdminProvider>
            <SiteHeader />
            <main>{children}</main>
          </AdminProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
