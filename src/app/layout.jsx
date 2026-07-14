import React from 'react';
import { Inter, DM_Mono, Sedgwick_Ave } from 'next/font/google';
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
  title: {
    default: 'Huddin | Full-Stack Developer & UI/UX Designer',
    template: '%s | Huddin'
  },
  description: 'Professional portfolio and blog of Huddin, a skilled developer and designer specializing in Brand Systems, UI/UX Design, App Development, and promotional visuals.',
  keywords: ['Full-Stack Developer', 'UI/UX Designer', 'Brand Systems', 'Next.js', 'React', 'Figma', 'Web Design', 'Software Engineer', 'Huddin'],
  authors: [{ name: 'Sholahuddin Ahmad', url: 'https://huddin.dev' }],
  creator: 'Sholahuddin Ahmad',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://huddin.dev',
    title: 'Huddin | Full-Stack Developer & UI/UX Designer',
    description: 'Professional portfolio and blog of Huddin, a skilled developer and designer specializing in Brand Systems, UI/UX Design, and App Development.',
    siteName: 'Huddin Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Huddin | Full-Stack Developer & UI/UX Designer',
    description: 'Professional portfolio and blog of Huddin, a skilled developer and designer specializing in Brand Systems, UI/UX Design, and App Development.',
  },
  verification: {
    google: 'tiI7BdXji1tApq0xUV3dCx8GDygsKi69sobZn1oLOrw',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${dmMono.variable} ${sedgwickAve.variable}`} data-scroll-behavior="smooth">
      <body>
        {children}
      </body>
    </html>
  );
}
