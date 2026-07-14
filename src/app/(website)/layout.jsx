import React from 'react';
import Header from '../../components/Utils/Header';
import Footer from '../../components/Utils/Footer';
import ScrollToTop from '../../components/Utils/ScrollToTop';
import Chatbot from '../../components/Utils/Chatbot';
import ProgressBar from '../../components/Utils/ProgressBar';
import SideRays from '../../components/Home/SideRays';

export default async function WebsiteLayout({ children }) {
  const status = 'available';

  return (
    <>
      <React.Suspense fallback={null}>
        <ProgressBar />
      </React.Suspense>
      <ScrollToTop />
      <Header availabilityStatus={status} />
      
      {/* Global Background SideRays Layer - top right of viewport, positioned in back */}
      <div 
        className="absolute top-0 right-0 w-[55vw] max-w-[900px] h-[750px] pointer-events-none overflow-hidden" 
        style={{ zIndex: 0 }}
      >
        <SideRays
          speed={2.5}
          rayColor1="#EAB308"
          rayColor2="#96c8ff"
          intensity={2.0}
          spread={2.0}
          origin="top-right"
          tilt={0}
          saturation={1.5}
          blend={0.75}
          falloff={1.6}
          opacity={1.0}
        />
      </div>

      <main className="relative z-10">{children}</main>
      <Footer />
      <Chatbot />
    </>
  );
}
