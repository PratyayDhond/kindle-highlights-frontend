import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Sparkles } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import ProcessingLoader from '@/components/ProcessingLoader';
import DownloadSection from '@/components/DownloadSection';
import { useToast } from '@/hooks/use-toast';

type ProcessingState = 'idle' | 'processing' | 'completed';

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    if (processingState === 'completed') {
      setProcessingState('idle');
    }
  };

  const handleGenerateZip = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a clippings.txt file first.",
        variant: "destructive",
      });
      return;
    }
    setProcessingState('processing');

    const formData = new FormData();
formData.append('file', selectedFile); // Make sure 'file' matches the field expected by multer

try {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user-highlights`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error("Upload failed");

  const data = await response.json();
  console.log("Server response:", data);

  // Optional: Show toast or update UI
} catch (error) {
  console.error("Error uploading file:", error);
  toast({
    title: "Upload failed",
    description: "There was an error processing your file. Please try again.",
    variant: "destructive",
  });
  setProcessingState('idle');
}


    // Simulate API call with processing time (35-60 seconds)
    const processingTime = Math.random() * 25000 + 35000; // 35-60 seconds
    
    setTimeout(() => {
      setProcessingState('completed');
      toast({
        title: "Processing complete!",
        description: "Your highlights are ready for download.",
      });
    }, processingTime);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    
    // Simulate download
    setTimeout(() => {
      setIsDownloading(false);
      toast({
        title: "Download started",
        description: "Your zip file is being downloaded.",
      });
    }, 2000);
  };

  const resetProcess = () => {
    setSelectedFile(null);
    setProcessingState('idle');
    setIsDownloading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-royal-100/30 to-royal-200/30 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-royal-500/20 animate-pulse-glow"></div>
              <div className="relative bg-white rounded-full p-4 shadow-lg border border-royal-200">
                <BookOpen className="h-8 w-8 text-royal-500" />
              </div>
            </div>
            <Sparkles className="h-6 w-6 text-royal-400 ml-2 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Kindle Clippings Processor
          </h1>
          <p className="text-lg text-gray-600 max-w-lg mx-auto">
            Transform your Kindle highlights into organized, downloadable formats. 
            Upload your clippings.txt file and let us work our magic.
          </p>
        </div>

        {/* Main Content */}
        <div className="glass-effect rounded-2xl p-8 shadow-xl">
          {processingState === 'idle' && (
            <div className="space-y-8">
              <FileUpload
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
              />
              
              {selectedFile && (
                <div className="text-center animate-fade-in">
                  <Button
                    onClick={handleGenerateZip}
                    className="bg-gradient-to-r from-royal-500 to-royal-600 hover:from-royal-600 hover:to-royal-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Zip
                  </Button>
                </div>
              )}
            </div>
          )}

          {processingState === 'processing' && (
            <ProcessingLoader />
          )}

          {processingState === 'completed' && (
            <div className="space-y-6">
              <DownloadSection 
                onDownload={handleDownload}
                isDownloading={isDownloading}
              />
              
              <div className="text-center">
                <Button
                  onClick={resetProcess}
                  variant="outline"
                  className="border-royal-300 text-royal-600 hover:bg-royal-50"
                >
                  Process Another File
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 animate-fade-in">
          <p className="text-sm text-gray-500">
            Your files are processed securely and never stored on our servers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
