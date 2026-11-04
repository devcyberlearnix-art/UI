import React from 'react';
import Navbar from './Navbar';
import BannerSlider from './BannerSlider';

const HeroSection = () => {
  return (
    <div className="relative pt-16 bg-[#F5F2EC] dark:bg-[#151413] text-[#282521] dark:text-[#EDE8E1] min-h-[400px]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <BannerSlider />
      </div>
    </div>
  );
};

export default HeroSection;