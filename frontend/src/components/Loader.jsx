import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="relative w-24 h-24">
        <div className="absolute w-full h-full border-4 border-purple-200 rounded-full animate-ping"></div>
        <div className="absolute w-full h-full border-4 border-t-purple-600 border-r-transparent border-b-purple-600 border-l-transparent rounded-full animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-600 font-bold text-xs">
          LOADING
        </div>
      </div>
    </div>
  );
};

export default Loader;
