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

import huddinConfig from '../data/huddinContext.json';

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

  // Generate dynamic JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": huddinConfig.master || "Sholahuddin Ahmad",
    "alternateName": "Huddin",
    "url": "https://huddin.dev",
    "image": "https://framerusercontent.com/images/NkL1zDB0ea9KmqIpMf80b6TCw.png",
    "jobTitle": "Full-Stack Developer & UI/UX Designer",
    "description": huddinConfig.aboutHuddin?.summary || "Developer and designer specializing in Brand Systems, UI/UX Design, App Development, and promotional visuals.",
    "knowsAbout": [
      "Brand Systems",
      "UI & UX Design",
      "App Development",
      "Next.js",
      "React",
      "Figma",
      "Tailwind CSS"
    ],
    "memberOf": huddinConfig.communitiesAndCerts?.communities?.map(c => ({
      "@type": "Organization",
      "name": c.name,
      "description": c.description
    })) || [],
    "hasCredential": huddinConfig.communitiesAndCerts?.certifications?.map(c => ({
      "@type": "EducationalOccupationalCredential",
      "name": c.name,
      "credentialCategory": "certification",
      "description": c.description
    })) || []
  };

  return (
    <html lang="en" className={`${inter.variable} ${dmMono.variable} ${sedgwickAve.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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

