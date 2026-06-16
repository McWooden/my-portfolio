"use client";
import SectionHeader from '../components/Utils/SectionHeader';
import Section from '../components/Utils/Section';
import NetworkMap from '../components/Utils/NetworkMap';
import Contact from '../components/Utils/Contact';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { certifications, communities } from '../data/siteData';

export default function Network() {
  const [certGridRef, certsRevealed] = useScrollReveal(0.05);
  const [commGridRef, commsRevealed] = useScrollReveal(0.05);

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
      <section id="network-map" className="w-full max-w-[1600px] mx-auto px-5 xl:px-10 flex flex-col items-center mb-10">
        <NetworkMap />
      </section>

      {/* Certified By Section */}
      <Section id="certifications" borderBottom={false}>
        <SectionHeader
          index="06"
          tag="Validated Skills"
          name="Certifications"
          title="Certified Competence & Training"
          subtitle="Validated credentials earned from global development academies and interactive code platforms"
        />
        
        <div 
          ref={certGridRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[1200px]"
        >
          {certifications.map((cert, index) => (
            <div 
              key={cert.id}
              className={`bg-bg-card rounded-[30px] p-10 flex flex-col gap-6 text-left reveal-item ${certsRevealed ? 'revealed' : ''}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-row items-center gap-2.5">
                <div className="w-10 h-10 bg-accent rounded-2xl flex items-center justify-center">
                  <span className="font-mono text-[20px] font-normal text-bg-dark uppercase">
                    {cert.label}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-[26px] font-medium text-[#F2F2F2] tracking-[-1.56px] leading-tight">{cert.name}</h4>
                <p className="text-[16px] font-normal text-text-secondary leading-relaxed">
                  {cert.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </Section>

      {/* Communities Section */}
      <Section id="communities" borderBottom={false}>
        <SectionHeader
          index="07"
          tag="Developer Ecosystems"
          name="Communities"
          title="Developer Networks I Follow"
          subtitle="Learning hubs, educational spaces, and Indonesian dev groups where I stay updated with modern tech stacks"
        />
        
        <div 
          ref={commGridRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-[1000px]"
        >
          {communities.map((comm, index) => (
            <a 
              key={comm.id}
              href={comm.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`bg-bg-card rounded-[30px] p-10 flex flex-col gap-6 text-left group reveal-item ${commsRevealed ? 'revealed' : ''}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-accent rounded-2xl flex items-center justify-center">
                  <span className="font-mono text-[20px] font-normal text-bg-dark uppercase">
                    {comm.label}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-[26px] font-medium text-[#F2F2F2] tracking-[-1.56px] leading-tight group-hover:text-accent transition-colors">
                  {comm.name}
                </h4>
                <p className="text-[16px] font-normal text-[#F2F2F2]/60 leading-relaxed">
                  {comm.description}
                </p>
              </div>
            </a>
          ))}
        </div>


      </Section>

      {/* Trusted By Section */}
      <Section id="trusted-by">
        <SectionHeader
          index="08"
          tag="Corporate Partners"
          name="Partners"
          title="Trusted By Industry Leaders"
          subtitle="Collaborating with global technology brands and enterprises to architect digital systems"
        />
        <div className="flex flex-wrap items-center justify-center gap-16 md:gap-32 mt-6">
          {/* Google */}
          <div className="flex items-center gap-4 text-[#F2F2F2]/30 transition-colors duration-300 select-none">
            <svg viewBox="0 0 24 24" className="w-14 h-14 fill-current">
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-5.136 4.113-3.41 0-6.177-2.767-6.177-6.178 0-3.41 2.767-6.177 6.177-6.177 1.564 0 2.983.585 4.074 1.543l3.076-3.075C19.324 2.14 15.976 1 12.24 1 6.043 1 1 6.043 1 12.24s5.043 11.24 11.24 11.24c5.84 0 10.876-4.218 10.876-11.24 0-.765-.082-1.34-.19-1.955H12.24z"/>
            </svg>
            <span className="font-sans font-semibold text-[2.2rem] tracking-tight">Google</span>
          </div>

          {/* Microsoft */}
          <div className="flex items-center gap-4 text-[#F2F2F2]/30 transition-colors duration-300 select-none">
            <svg viewBox="0 0 23 23" className="w-12 h-12 fill-current">
              <path d="M0 0h11v11H0zM12 0h11v11H12zM0 12h11v11H0zM12 12h11v11H12z" />
            </svg>
            <span className="font-sans font-semibold text-[2rem] tracking-tight">Microsoft</span>
          </div>

          {/* Alibaba */}
          <div className="flex items-center gap-4 text-[#F2F2F2]/30 transition-colors duration-300 select-none">
            <svg viewBox="0 0 24 24" className="w-14 h-14 fill-current">
              <path d="M12.012 3c-1.378 0-2.616.582-3.498 1.503l-3.328-3.328C3.174 3.197 2 5.962 2 9.083c0 5.485 4.49 9.932 10.012 9.932 1.353 0 2.628-.27 3.791-.758l2.97 2.97 1.705-1.705-2.923-2.923c1.442-1.802 2.31-4.086 2.31-6.588C19.86 5.415 16.342 3 12.012 3zm0 13c-3.86 0-7.012-3.14-7.012-7s3.152-7 7.012-7c3.084 0 5.679 2.003 6.621 4.793l-2.22 2.22c-.67-.6-1.536-.97-2.483-.97-2.072 0-3.75 1.678-3.75 3.75s1.678 3.75 3.75 3.75c1.08 0 2.05-.456 2.736-1.189l2.258 2.258c-1.127 1.93-3.238 3.138-5.652 3.138z"/>
            </svg>
            <span className="font-sans font-semibold text-[2rem] tracking-tight">Alibaba</span>
          </div>
        </div>
      </Section>

      {/* Contact Section */}
      <Contact />
    </div>
  );
}
