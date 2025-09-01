import React from 'react';
import FeatureCard from '../ui/FeatureCard';

const FeaturesSection = () => {
  const features = [
    {
      icon: '🌍',
      title: 'Global Reach',
      description: 'Make free calls to 155+ countries worldwide with crystal-clear voice quality.',
    },
    {
      icon: '💰',
      title: 'Unbeatable Pricing',
      description: 'Starting at just $15/month - save thousands on international calling costs.',
    },
    {
      icon: '📞',
      title: 'Unlimited Calling',
      description: 'No minute limits, no hidden fees. Call as much as you want to supported countries.',
    },
    {
      icon: '⚡',
      title: 'Instant Connection',
      description: 'Connect immediately with advanced VoIP technology and reliable network infrastructure.',
    },
  ];

  return (
    <section className="features-section">
      <div className="features-content">
        <div className="features-grid">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
