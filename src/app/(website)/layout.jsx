import React from 'react';
import Header from '../../components/Utils/Header';
import Footer from '../../components/Utils/Footer';
import ScrollToTop from '../../components/Utils/ScrollToTop';
import Chatbot from '../../components/Utils/Chatbot';
import ProgressBar from '../../components/Utils/ProgressBar';
import huddinConfig from '../../data/huddinContext.json';

export default async function WebsiteLayout({ children }) {
  const status = 'available';

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <React.Suspense fallback={null}>
        <ProgressBar />
      </React.Suspense>
      <ScrollToTop />
      <Header availabilityStatus={status} />
      <main>{children}</main>
      <Footer />
      <Chatbot />
    </>
  );
}
