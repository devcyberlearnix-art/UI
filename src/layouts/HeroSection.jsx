import Navbar from "../layout/Navbar";
import BannerSlider from "./BannerSlider";

const HeroSection = () => {
  return (
    <div className="relative pt-16 bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <BannerSlider />
      </div>
    </div>
  );
};

export default HeroSection;