import React from 'react';
import SectionHeader from './SectionHeader';
import Section from './Section';
import SocialCard from './SocialCard';

export default function Contact() {
  const socials = [
    { label: 'X/Twitter', value: '@SashaMozdir', href: 'https://x.com/SashaMozdir' },
    { label: 'Instagram', value: '@Sasha.mozdir', href: 'https://www.instagram.com/Sasha.mozdir' },
    { label: 'Framer', value: '@SashaMozdir', href: 'https://framer.link/gTuEdNG' },
    { label: 'Email', value: 'hello@tmpl.digital', href: 'mailto:hello@tmpl.digital', isEmail: true }
  ];

  return (
    <Section id="contact">
      <div className="w-full flex flex-col items-center gap-[60px]">
        {/* Full-width Centered Header */}
        <SectionHeader
          tag="Let's connect?"
          name="Contact"
          title="Feel Free To Reach Out — Whether It's About A Project Or Just To Say Hi"
          subtitle="You'll usually find me designing something, testing an idea, or sharing notes from the process"
        />

        {/* 4-column horizontal card grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 w-full">
          {socials.map((social, index) => (
            <SocialCard
              key={index}
              label={social.label}
              value={social.value}
              href={social.href}
              isEmail={social.isEmail}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
