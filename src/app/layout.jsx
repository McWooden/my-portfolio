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
    default: 'Huddin | Magelang Full-Stack Developer & UI/UX Designer',
    template: '%s | Huddin - Magelang Developer'
  },
  description: 'Huddin (Sholahuddin Ahmad) — Full-Stack Developer & UI/UX Designer berbasis di Magelang, Jawa Tengah. Spesialisasi Brand Systems, Web & App Development, UI/UX Design. HaloHuddin Home Studio, Magelang.',
  keywords: [
    'Full-Stack Developer Magelang',
    'UI/UX Designer Magelang',
    'Web Developer Magelang',
    'Jasa Pembuatan Website Magelang',
    'Developer Magelang Jawa Tengah',
    'HaloHuddin',
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
  authors: [{ name: 'Sholahuddin Ahmad', url: 'https://huddin.dev' }],
  creator: 'Sholahuddin Ahmad',
  publisher: 'HaloHuddin - Home Studio',
  metadataBase: new URL('https://huddin.dev'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    alternateLocale: 'en_US',
    url: 'https://huddin.dev',
    title: 'Huddin | Magelang Full-Stack Developer & UI/UX Designer',
    description: 'Full-Stack Developer & UI/UX Designer berbasis di Magelang, Jawa Tengah. Spesialisasi Brand Systems, UI/UX Design, dan App Development. HaloHuddin Home Studio.',
    siteName: 'Huddin Portfolio',
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
      '@id': 'https://huddin.dev/#business',
      name: 'HaloHuddin - Home Studio',
      description: 'Studio kreatif untuk jasa Full-Stack Development, UI/UX Design, Brand Systems, dan App Development di Magelang, Jawa Tengah.',
      url: 'https://huddin.dev',
      telephone: '',
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
      image: 'https://huddin.dev/og-image.jpg',
      founder: { '@id': 'https://huddin.dev/#person' },
      sameAs: [],
    },
    {
      '@type': 'Person',
      '@id': 'https://huddin.dev/#person',
      name: 'Sholahuddin Ahmad',
      alternateName: 'Huddin',
      url: 'https://huddin.dev',
      jobTitle: 'Full-Stack Developer & UI/UX Designer',
      description: 'Full-Stack Developer & UI/UX Designer berbasis di Magelang, Jawa Tengah. Founder HaloHuddin Home Studio.',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Magelang',
        addressRegion: 'Jawa Tengah',
        addressCountry: 'ID',
      },
      worksFor: { '@id': 'https://huddin.dev/#business' },
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
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://huddin.dev/#website',
      url: 'https://huddin.dev',
      name: 'Huddin Portfolio',
      description: 'Portfolio & Blog Huddin — Full-Stack Developer & UI/UX Designer di Magelang',
      publisher: { '@id': 'https://huddin.dev/#person' },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${dmMono.variable} ${sedgwickAve.variable}`} data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
