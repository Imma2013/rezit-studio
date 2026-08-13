import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from './providers';

export const metadata: Metadata = {
  title: 'Rezit Studio 2.0 - Open-Source AI Creative Suite',
  description:
    'The modern open-source AI alternative to Canva. Graphic design, multi-track video editing, and social calendar publishing powered by Google Gemini 3 Flash and Veo.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
