import type { Metadata } from 'next';
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
