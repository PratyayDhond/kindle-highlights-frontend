import React, { useEffect, useState } from 'react';
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
  const [progress, setProgress] = useState<number>(0);
  const { toast } = useToast();
  const [jobId, setJobId] = useState<string | null>(null);
  const [hasDownloaded, setHasDownloaded] = useState(false);

  useEffect(() => {
    // perform an api call to health-check the backend
    const checkBackendHealth = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/health-check/`);
        if (!response.ok) throw new Error("Backend is not healthy");
      } catch (error) {
        toast({
          title: "Backend Error",
          description: "Unable to connect to the backend. Please try again later.",
          variant: "destructive",
        });
      }
    };
    checkBackendHealth();
  }, [toast]);
  
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
    setProgress(0);

    // 1. Upload file and get jobId from backend
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user-highlights`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");

      // Assume backend returns { jobId: string }
      const { jobId } = await response.json();
      setJobId(jobId);

      // 2. Start listening for progress updates
      const evtSource = new EventSource(`${import.meta.env.VITE_BACKEND_URL}/progress/${jobId}`);
      evtSource.onmessage = async function(event) {
        const progressValue = Number(event.data);
        setProgress(progressValue);

        if (progressValue >= 100) {
          evtSource.close();
          setProcessingState('completed');

          // 3. Download the zip file from the new GET endpoint
          // const downloadResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/download-highlights/${jobId}`);
          // if (!downloadResponse.ok) throw new Error("Download failed");

          // // Get the filename from the Content-Disposition header if available
          // const disposition = downloadResponse.headers.get('Content-Disposition');
          // let filename = 'kindle-clippings.zip';
          // if (disposition && disposition.includes('filename=')) {
          //   filename = disposition.split('filename=')[1].replace(/["']/g, '');
          // }

          // const blob = await downloadResponse.blob();
          // const url = window.URL.createObjectURL(blob);
          // const a = document.createElement('a');
          // a.href = url;
          // a.download = filename;
          // document.body.appendChild(a);
          // a.click();
          // a.remove();
          // window.URL.revokeObjectURL(url);

          // toast({
          //   title: "Download ready!",
          //   description: "Your highlights zip file has been downloaded.",
          // });

        }
      };

      setProcessingState('processing');

    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: "There was an error processing your file. Please try again.",
        variant: "destructive",
      });
      setProcessingState('idle');
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);

    const downloadResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/download-highlights/${jobId}`);
    if (!downloadResponse.ok) throw new Error("Download failed");

    // Get the filename from the Content-Disposition header if available
    const disposition = downloadResponse.headers.get('Content-Disposition');
    let filename = 'kindle-clippings.zip';
    if (disposition && disposition.includes('filename=')) {
      filename = disposition.split('filename=')[1].replace(/["']/g, '');
    }

    const blob = await downloadResponse.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Download ready!",
      description: "Your highlights zip file has been downloaded.",
    });

    setIsDownloading(false);
    setHasDownloaded(true);

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
            <div>
              <ProcessingLoader />
              <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
                <div
                  className="bg-royal-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-center mt-2 text-sm text-gray-600">{progress}%</div>
            </div>
          )}

          {processingState === 'completed' && (
            <div className="space-y-6">
              <DownloadSection 
                onDownload={handleDownload}
                isDownloading={isDownloading} 
                hasDownloaded={hasDownloaded}
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
