import React, { useState } from 'react';
import Header from './common/Header';
import HeroSection from './home/HeroSection';
import PricingSection from './home/PricingSection';
import FeaturesSection from './home/FeaturesSection';
import FAQSection from './home/FAQSection';
import CTASection from './home/CTASection';
import WaitlistModal from './common/WaitlistModal';
import SEOHead from './seo/SEOHead';

const Home = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);

  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleOpenWaitlist = () => {
    setShowWaitlistModal(true);
  };

  const handleCloseWaitlist = () => {
    setShowWaitlistModal(false);
  };

  return (
    <>
      <SEOHead />
      <div className="home-container">
        <Header
          showMobileMenu={showMobileMenu}
          onMobileMenuToggle={handleMobileMenuToggle}
        />
        <main>
          <HeroSection onOpenWaitlist={handleOpenWaitlist} />
          <PricingSection onOpenWaitlist={handleOpenWaitlist} />
          <FeaturesSection />
          <FAQSection />
          <CTASection onOpenWaitlist={handleOpenWaitlist} />
        </main>

        <WaitlistModal
          isOpen={showWaitlistModal}
          onClose={handleCloseWaitlist}
        />
      </div>
    </>
  );
};

export default Home;
