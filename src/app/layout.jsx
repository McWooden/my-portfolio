import React from 'react';
import Header from '../components/Utils/Header';
import Footer from '../components/Utils/Footer';
import ScrollToTop from '../components/Utils/ScrollToTop';
import Chatbot from '../components/Utils/Chatbot';
import { Inter, DM_Mono, Sedgwick_Ave } from 'next/font/google';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const dmMono = DM_Mono({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-dm-mono',
  display: 'swap',
});

const sedgwickAve = Sedgwick_Ave({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-sedgwick-ave',
  display: 'swap',
});

export const metadata = {
  title: 'Portfolio & Blog',
  description: 'My custom developer portfolio and blog created with Next.js and Keystatic CMS.',
};

export default async function RootLayout({ children }) {
  const reader = createReader(process.cwd(), keystaticConfig);
  let status = 'available';
  try {
    const homepageData = await reader.singletons.homepage.read();
    status = homepageData?.status || 'available';
  } catch (e) {
    console.error('Failed to read homepage status in layout:', e);
  }

  return (
    <html lang="en" className={`${inter.variable} ${dmMono.variable} ${sedgwickAve.variable}`}>
      <body>
        <ScrollToTop />
        <Header availabilityStatus={status} />
        <main>{children}</main>
        <Footer />
        <Chatbot />
      </body>
    </html>
  );
}

