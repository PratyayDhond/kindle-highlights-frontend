
import React from 'react';
import { Download, CheckCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DownloadSectionProps {
  onDownload: () => void;
  isDownloading?: boolean;
  hasDownloaded?: boolean;
}

const DownloadSection: React.FC<DownloadSectionProps> = ({ onDownload, isDownloading, hasDownloaded }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-green-500/20 animate-pulse-glow"></div>
        <div className="relative bg-white rounded-full p-6 shadow-lg border border-green-200">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Your highlights are ready!
      </h3>
      <p className="text-gray-600 text-center max-w-md mb-8">
        Your Kindle clippings have been processed and organized. 
        Download your zip file to access your beautifully formatted highlights.
      </p>
      
      <Button
        onClick={onDownload}
        disabled={isDownloading || hasDownloaded}
        className="bg-gradient-to-r from-royal-500 to-royal-600 hover:from-royal-600 hover:to-royal-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      >
        {isDownloading ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Downloading...
          </>
        ) : hasDownloaded ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4 text-green-950" />
            Download Completed.
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Download Zip File
          </>
        )}
      </Button>
    </div>
  );
};

export default DownloadSection;
