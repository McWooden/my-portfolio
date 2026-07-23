import React from 'react';
import { Inter, DM_Mono, Sedgwick_Ave, Bebas_Neue, Outfit } from 'next/font/google';
import dynamic from 'next/dynamic';
import './globals.css';

const InAppBrowserOverlay = dynamic(() => import('../components/Utils/InAppBrowserOverlay'));

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

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas-neue',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'HaloHuddin | Magelang Full-Stack Developer & UI/UX Designer',
    template: '%s | HaloHuddin - Magelang Developer'
  },
  description: 'Huddin (Sholahuddin Ahmad) — Full-Stack Developer & UI/UX Designer di Magelang. Spesialisasi Brand Systems, Web & App Development, dan UI/UX Design.',
  keywords: [
    'Full-Stack Developer Magelang',
    'UI/UX Designer Magelang',
    'Web Developer Magelang',
    'Jasa Pembuatan Website Magelang',
    'Developer Magelang Jawa Tengah',
    'Programmer Magelang',
    'Jasa Website Magelang',
    'Developer Website Magelang',
    'Designer Website Magelang',
    'Pembuatan Aplikasi Magelang',
    'Magelang Web Developer',
    'Magelang UI/UX Designer',
    'Jasa IT Magelang',
    'Software Developer Magelang',
    'Studio Kreatif Magelang',
    'Magelang Creative Studio',
    'Freelance Programmer Magelang',
    'Jasa Pembuatan Landing Page Magelang',
    'HaloHuddin',
    'Halo Huddin Magelang',
    'Huddin Magelang',
    'Sholahuddin Ahmad Magelang',
    'Huddin',
    'Sholahuddin Ahmad',
    'Brand Systems',
    'Next.js',
    'React',
    'Figma',
    'Web Design Magelang',
    'Software Engineer Magelang',
    'Freelance Developer Magelang',
    'App Development Magelang',
  ],
  authors: [{ name: 'Sholahuddin Ahmad', url: 'https://halohuddin.vercel.app' }],
  creator: 'Sholahuddin Ahmad',
  publisher: 'HaloHuddin - Home Studio',
  metadataBase: new URL('https://halohuddin.vercel.app'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/ico/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/ico/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/ico/favicon.ico',
    apple: '/ico/apple-touch-icon.png',
  },
  manifest: '/ico/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    alternateLocale: 'en_US',
    url: 'https://halohuddin.vercel.app',
    title: 'Huddin | Magelang Full-Stack Developer & UI/UX Designer',
    description: 'Full-Stack Developer & UI/UX Designer di Magelang. Spesialisasi Brand Systems, UI/UX Design, dan App Development.',
    siteName: 'Huddin Portfolio',
    videos: [
      {
        url: 'https://halohuddin.vercel.app/hero-bg.webm',
        secureUrl: 'https://halohuddin.vercel.app/hero-bg.webm',
        type: 'video/webm',
        width: 1200,
        height: 630,
      }
    ],
    images: [
      {
        url: 'https://halohuddin.vercel.app/hero-bg.webp',
        width: 1200,
        height: 630,
        alt: 'Huddin - Magelang Full-Stack Developer & UI/UX Designer Portfolio Hero',
      },
      {
        url: '/ico/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'Huddin Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Huddin | Magelang Full-Stack Developer & UI/UX Designer',
    description: 'Full-Stack Developer & UI/UX Designer berbasis di Magelang, Jawa Tengah. Spesialisasi Brand Systems, UI/UX Design, dan App Development.',
  },
  verification: {
    google: 'tiI7BdXji1tApq0xUV3dCx8GDygsKi69sobZn1oLOrw',
  },
  other: {
    'geo.region': 'ID-JT',
    'geo.placename': 'Magelang',
  },
};

// JSON-LD Structured Data for Local SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'LocalBusiness',
      '@id': 'https://halohuddin.vercel.app/#business',
      name: 'HaloHuddin - Home Studio',
      description: 'Studio kreatif untuk jasa Full-Stack Development, UI/UX Design, Brand Systems, dan App Development di Magelang, Jawa Tengah.',
      url: 'https://halohuddin.vercel.app',
      telephone: '+6287745457767',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Magelang',
        addressRegion: 'Jawa Tengah',
        addressCountry: 'ID',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: -7.4797,
        longitude: 110.2177,
      },
      hasMap: 'https://maps.google.com/?q=HaloHuddin+-+Home+Studio',
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '17:00',
      },
      priceRange: '$$',
      image: 'https://halohuddin.vercel.app/hero-bg.webp',
      founder: { '@id': 'https://halohuddin.vercel.app/#person' },
      sameAs: [
        'https://www.linkedin.com/in/sholahuddin-ahmad/',
        'https://github.com/McWooden',
        'https://medium.com/@halohuddin',
        'https://www.instagram.com/halohuddin',
        'https://x.com/halohuddin',
        'https://www.tiktok.com/@halohuddin',
        'https://wa.me/6287745457767',
      ],
    },
    {
      '@type': 'Person',
      '@id': 'https://halohuddin.vercel.app/#person',
      name: 'Sholahuddin Ahmad',
      alternateName: 'Huddin',
      url: 'https://halohuddin.vercel.app',
      image: 'https://halohuddin.vercel.app/hero-bg.webp',
      jobTitle: 'Full-Stack Developer & UI/UX Designer',
      description: 'Full-Stack Developer & UI/UX Designer berbasis di Magelang, Jawa Tengah. Founder HaloHuddin Home Studio.',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Magelang',
        addressRegion: 'Jawa Tengah',
        addressCountry: 'ID',
      },
      worksFor: { '@id': 'https://halohuddin.vercel.app/#business' },
      knowsAbout: [
        'Full-Stack Development',
        'UI/UX Design',
        'Brand Systems',
        'Next.js',
        'React',
        'Figma',
        'Web Design',
        'App Development',
      ],
      memberOf: [
        {
          '@type': 'Organization',
          name: 'Titik Koma',
          description: 'Programming learning space led by Sandhika Galih (Web Programming UNPAS)',
        },
        {
          '@type': 'Organization',
          name: 'Cuy Universe',
          description: 'Software engineering and technology discussion community founded by Dea Afrizal',
        },
      ],
      hasCredential: [
        {
          '@type': 'EducationalOccupationalCredential',
          name: 'freeCodeCamp',
          credentialCategory: 'certification',
        },
        {
          '@type': 'EducationalOccupationalCredential',
          name: 'Sololearn',
          credentialCategory: 'certification',
        },
        {
          '@type': 'EducationalOccupationalCredential',
          name: 'Codepolitan',
          credentialCategory: 'certification',
        },
      ],
      sameAs: [
        'https://www.linkedin.com/in/sholahuddin-ahmad/',
        'https://github.com/McWooden',
        'https://medium.com/@halohuddin',
        'https://www.instagram.com/halohuddin',
        'https://x.com/halohuddin',
        'https://www.tiktok.com/@halohuddin',
        'https://wa.me/6287745457767',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://halohuddin.vercel.app/#website',
      url: 'https://halohuddin.vercel.app',
      name: 'Huddin Portfolio',
      description: 'Portfolio & Blog Huddin — Full-Stack Developer & UI/UX Designer di Magelang',
      publisher: { '@id': 'https://halohuddin.vercel.app/#person' },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${dmMono.variable} ${sedgwickAve.variable} ${bebasNeue.variable} ${outfit.variable}`} data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <InAppBrowserOverlay />
        {children}
      </body>
    </html>
  );
}
