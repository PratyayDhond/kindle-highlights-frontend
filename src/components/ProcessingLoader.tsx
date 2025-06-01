
import React from 'react';
import { Loader } from 'lucide-react';

const ProcessingLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-royal-500/20 animate-pulse-glow"></div>
        <div className="relative bg-white rounded-full p-6 shadow-lg border border-royal-200">
          <Loader className="h-8 w-8 text-royal-500 animate-spin-slow" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">
        Processing your highlights...
      </h3>
      <p className="text-gray-600 text-center max-w-md">
        This may take up to a minute. We're carefully organizing your Kindle clippings 
        into a beautiful format for you.
      </p>
      <div className="mt-6 w-64 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-royal-400 to-royal-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default ProcessingLoader;
