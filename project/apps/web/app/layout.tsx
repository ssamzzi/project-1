import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader } from '../components/SiteHeader';
import { LocaleProvider } from '../lib/context/LocaleContext';

export const metadata: Metadata = {
  title: 'Life Science Lab Tools',
  description: 'A practical and free static portal for molecular biology calculations.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LocaleProvider>
          <SiteHeader />
          <main>{children}</main>
        </LocaleProvider>
      </body>
    </html>
  );
}
