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
    <section
      className="features-section"
      id="features"
      aria-labelledby="features-heading">
      <div className="features-content">
        <div className="features-header">
          <h2
            id="features-heading"
            className="features-title">
            Why Choose CharlitexMobileConnect?
          </h2>
          <p className="features-subtitle">
            Experience the future of international calling with our cutting-edge features and unbeatable value
          </p>
        </div>
        <div
          className="features-grid"
          role="list">
          {features.map((feature, index) => (
            <div
              key={index}
              role="listitem">
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
