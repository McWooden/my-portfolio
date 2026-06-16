"use client";
import React, { useState, useRef } from 'react';
import { faqs as staticFaqs } from '../../data/siteData';
import SectionHeader from './SectionHeader';
import Section from './Section';

export default function FAQ({ faqs = staticFaqs, labelIndex = "05" }) {
  const [activeFaq, setActiveFaq] = useState(null);
  const answerRefs = useRef([]);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const getFaqHeight = (index) => {
    if (activeFaq === index && answerRefs.current[index]) {
      return `${answerRefs.current[index].scrollHeight}px`;
    }
    return '0px';
  };

  return (
    <Section id="faq">

      <SectionHeader
        index={labelIndex}
        tag="Have a questions?"
        name="FAQ"
        title="Questions People Often Ask Before We Start"
        subtitle="And honest answers to help you feel clear and confident"
      />

      {/* FAQ list */}
      <div className="w-full max-w-[1000px] flex flex-col">
        {faqs.map((faq, i) => {
          const isActive = activeFaq === i;
          return (
            <div
              key={i}
              className={`border-b border-border py-6 flex flex-col cursor-pointer ${i === 0 ? 'border-t border-border' : ''}`}
              onClick={() => toggleFaq(i)}
            >
              <div className="flex justify-between items-center w-full select-none">
                <div className="flex items-center gap-6">
                  <span className="font-mono text-[1rem] text-text-muted">{faq.number}</span>
                  <h3 className={`text-[1.2rem] font-medium tracking-[-0.02em] transition-colors duration-200 ${isActive ? 'text-accent' : 'text-white'}`}>
                    {faq.question}
                  </h3>
                </div>
                <div
                  className={`flex items-center justify-center text-text-secondary transition-all duration-300 ${isActive ? 'rotate-45 text-accent' : ''}`}
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                </div>
              </div>

              {/* Answer */}
              <div
                className="overflow-hidden transition-all duration-300 opacity-0"
                style={{
                  maxHeight: getFaqHeight(i),
                  opacity: isActive ? 1 : 0,
                  transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
                }}
                ref={(el) => (answerRefs.current[i] = el)}
              >
                <p className="pt-4 pb-2 pl-12 text-[1.05rem] leading-[1.5] text-text-secondary">
                  {faq.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
