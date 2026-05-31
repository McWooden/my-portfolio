import React from 'react';
import SectionHeader from '../components/Utils/SectionHeader';
import Section from '../components/Utils/Section';
import NetworkMap from '../components/Utils/NetworkMap';
import Contact from '../components/Utils/Contact';

export default function Network() {
  return (
    <div className="pt-[140px] max-[810px]:pt-[100px] bg-bg-dark min-h-screen flex flex-col justify-between">
      
      {/* Page Header */}
      <div className="w-full max-w-[1600px] mx-auto px-5 xl:px-10">
        <SectionHeader
          index="05"
          tag="Connected Peers"
          name="Network"
          title="My Professional Creative & Development Circle"
          subtitle="Explore the network map of creatives, clients, and partners I collaborate with on digital systems"
        />
      </div>

      {/* Network Map Section */}
      <section id="network-map" className="w-full max-w-[1600px] mx-auto px-5 xl:px-10 flex-1 flex flex-col items-center">
        <NetworkMap />
      </section>

      {/* Contact Section */}
      <Contact />
    </div>
  );
}
