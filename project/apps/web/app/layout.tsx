import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { SiteHeader } from '../components/SiteHeader';
import { LocaleProvider } from '../lib/context/LocaleContext';
import { AdminProvider } from '../lib/context/AdminContext';

export const metadata: Metadata = {
  title: 'BioLT (Bio Lab Tools)',
  description: 'A free static portal for practical life science lab calculations.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-65LXZ9XN6V" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-65LXZ9XN6V');
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
