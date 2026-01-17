import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl">
      <div className="relative w-24 h-24">
        <div className="absolute w-full h-full border-4 border-chai/10 rounded-full animate-ping"></div>
        <div className="absolute w-full h-full border-4 border-t-chai border-r-transparent border-b-chai border-l-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(220,176,126,0.3)]"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-chai font-black text-[10px] uppercase tracking-[0.3em] italic">
          WAITING
        </div>
      </div>
    </div>
  );
};

export default Loader;
