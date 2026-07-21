import React from 'react';
import Header from '../../components/Utils/Header';
import Footer from '../../components/Utils/Footer';
import ScrollToTop from '../../components/Utils/ScrollToTop';
import Chatbot from '../../components/Utils/Chatbot';
import ProgressBar from '../../components/Utils/ProgressBar';
import { supabase } from '../../utils/supabase';

export default async function WebsiteLayout({ children }) {
  // Fetch homepage settings from Supabase
  const { data: settingsData, error: settingsError } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'homepage')
    .single();

  if (settingsError && settingsError.code !== 'PGRST116') {
    console.error('Error fetching homepage layout settings:', settingsError);
  }

  const homepageSettings = settingsData?.value || {};
  let partitions = homepageSettings.partitions;
  if (!partitions || !Array.isArray(partitions)) {
    partitions = [];
    const openCount = Number(homepageSettings.openSlots) ?? 2;
    const isWorking = homepageSettings.status === 'working' || homepageSettings.status === 'busy';
    for (let i = 0; i < 4; i++) {
      if (i < openCount) partitions.push('open');
      else if (isWorking) partitions.push('working');
      else partitions.push('campus');
    }
  }

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
