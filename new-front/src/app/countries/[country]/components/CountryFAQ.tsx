'use client';

import { useState } from 'react';
import { CountryPageData } from '@/data/countryPages';

interface Props {
  faqs: CountryPageData['faqs'];
}

export default function CountryFAQ({ faqs }: Props) {
  const [openIndexes, setOpenIndexes] = useState<Record<number, boolean>>({});

  const toggleIndex = (idx: number) => {
    setOpenIndexes((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <section className="section">
      <div className="container">
        <div className="faq-wrap">
          <div style={{ textAlign: 'center' }}>
            <div className="eyebrow" style={{ color: '#8f6d00' }}>FAQ</div>
            <h2 className="section-title">Common Questions</h2>
          </div>
          <div className="faq-list">
            {faqs.map((faq, idx) => {
              const isOpen = !!openIndexes[idx];
              return (
                <div key={idx} className={`faq-item-custom ${isOpen ? 'active' : ''}`}>
                  <button className="faq-question-custom" onClick={() => toggleIndex(idx)}>
                    <span>{faq.q}</span>
                    <span>+</span>
                  </button>
                  <div 
                    className="faq-answer-custom"
                    style={{
                      maxHeight: isOpen ? '200px' : '0',
                      padding: isOpen ? '0 24px 22px' : '0 24px',
                      transition: 'max-height 0.3s ease, padding 0.3s ease',
                    }}
                  >
                    {faq.a}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
