import React from 'react';
import Header from '../../components/Utils/Header';
import Footer from '../../components/Utils/Footer';
import ScrollToTop from '../../components/Utils/ScrollToTop';
import Chatbot from '../../components/Utils/Chatbot';
import ProgressBar from '../../components/Utils/ProgressBar';
import { getHomepageSettings } from '../../utils/homepageSettings';

export default async function WebsiteLayout({ children }) {
  const { partitions } = await getHomepageSettings();

  return (
    <>
      <React.Suspense fallback={null}>
        <ProgressBar />
      </React.Suspense>
      <ScrollToTop />
      <Header partitions={partitions} />
      <main className="relative z-10">{children}</main>
      <Footer />
      <Chatbot />
    </>
  );
}

