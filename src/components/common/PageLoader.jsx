import React from 'react';

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#F5F2EC] dark:bg-[#151413]">
    <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#5B3E57] dark:border-[#D1A7CC] border-t-transparent mx-auto"></div>
  </div>
);

export default PageLoader;
