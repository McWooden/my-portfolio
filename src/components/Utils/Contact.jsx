import React from 'react';
import SectionHeader from './SectionHeader';
import Section from './Section';
import SocialCard from './SocialCard';

export default function Contact() {
  const socials = [
    { label: 'X/Twitter', value: '@halohuddin', href: 'https://x.com/halohuddin' },
    { label: 'Instagram', value: '@halohuddin', href: 'https://www.instagram.com/halohuddin' },
    { label: 'Medium', value: '@halohuddin', href: 'https://medium.com/@halohuddin' },
    { label: 'Email', value: 'halohuddin@gmail.com', href: 'mailto:halohuddin@gmail.com', isEmail: true }
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
