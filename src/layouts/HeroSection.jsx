import React from 'react';
import Navbar from './Navbar';
import BannerSlider from './BannerSlider';

const HeroSection = () => {
  return (
    <div className="relative pt-16 bg-[#070709] text-[#F5F5F7] min-h-[400px]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <BannerSlider />
      </div>
    </div>
  );
};

export default HeroSection;