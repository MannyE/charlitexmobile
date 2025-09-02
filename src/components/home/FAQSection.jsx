import React, { useState } from 'react';

const FAQSection = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    {
      question: 'What countries are included in the international calling plan?',
      answer: 'Our service covers 155+ countries worldwide including the US, Canada, UK, Australia, Germany, France, India, China, Japan, Brazil, and many more. We provide unlimited calling to most destinations with some countries having generous minute allowances.',
    },
    {
      question: 'How much does the international calling service cost?',
      answer: 'Our Essentials plan starts at just $15/month with a $40 setup fee, offering unlimited international calls. Our Premium plan is $55/month with a $50 setup fee, including unlimited data, hotspot, and 20GB international roaming.',
    },
    {
      question: 'Is the call quality really crystal-clear?',
      answer: 'Yes! We use cutting-edge VoIP technology and reliable network infrastructure to ensure crystal-clear voice quality for all international calls. Our advanced technology provides instant connection and superior audio quality.',
    },
    {
      question: 'Are there any hidden fees or minute limits?',
      answer: 'No hidden fees! Our plans offer unlimited calling to supported countries with transparent pricing. The only fees are the monthly plan cost and one-time setup fee. No surprise charges or complex billing.',
    },
    {
      question: 'How do I get started with CharlitexMobileConnect?',
      answer: "Simply join our waitlist by clicking the 'Join the Waitlist' button. Enter your phone number, verify with OTP, and you'll be notified when our service launches. It's that easy!",
    },
    {
      question: 'Do you offer international roaming?',
      answer: 'Yes! Our Premium plan includes 20GB of international roaming data, perfect for travelers who need to stay connected while abroad. This feature is included in addition to unlimited international calling.',
    },
  ];

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <section
      className="faq-section"
      id="faq"
      aria-labelledby="faq-heading">
      <div className="faq-content">
        <h2
          id="faq-heading"
          className="faq-title">
          Frequently Asked Questions About International Calling
        </h2>
        <div className="faq-grid">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`faq-item ${openFAQ === index ? 'open' : ''}`}
              itemScope
              itemType="https://schema.org/Question">
              <button
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openFAQ === index}
                aria-controls={`faq-answer-${index}`}
                itemProp="name">
                {faq.question}
                <span
                  className="faq-icon"
                  aria-hidden="true">
                  {openFAQ === index ? '−' : '+'}
                </span>
              </button>
              <div
                id={`faq-answer-${index}`}
                className="faq-answer"
                aria-hidden={openFAQ !== index}
                itemScope
                itemType="https://schema.org/Answer">
                <div itemProp="text">{faq.answer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
