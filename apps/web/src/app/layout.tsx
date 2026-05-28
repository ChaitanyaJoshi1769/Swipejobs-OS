import type { Metadata } from 'next';
import { ReactQueryClientProvider } from '@/lib/react-query';
import './globals.css';

export const metadata: Metadata = {
  title: 'Swipejobs OS',
  description: 'AI-native workforce marketplace',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReactQueryClientProvider>
          {children}
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
