import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Sparkles, Menu, Component } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import ProcessingLoader from '@/components/ProcessingLoader';
import DownloadSection from '@/components/DownloadSection';
import { useToast } from '@/hooks/use-toast';
import { generatePdfZip } from "@/utils/generatePdfZip";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CoinsDashboard from '@/components/CoinsDashboard';
import { useCoins } from "@/context/CoinsContext";
import { useStats } from "@/context/StatsContext";
import DashboardDrawer from "@/components/DashboardDrawer";

const MAX_FILE_SIZE_MB = import.meta.env.VITE_MAX_FILE_SIZE_MB;

type ProcessingState = 'idle' | 'processing' | 'completed';

const Index = () => {
  const { coins, setCoins } = useCoins();
  const { stats, setStats } = useStats();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const { toast: toastSonner } = useToast();
  const [jobId, setJobId] = useState<string | null>(null);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [consent, setConsent] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // perform an api call to health-check the backend
    const checkBackendHealth = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/health-check/`);
        if (!response.ok) throw new Error("Backend is not healthy");
      } catch (error) {
        toastSonner({
          title: "Backend Error",
          description: "Unable to connect to the backend. Please try again later.",
          variant: "destructive",
        });
      }
    };
    checkBackendHealth();
  }, [toastSonner]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/stats`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data.stats || {
          totalBooks: 0,
          totalHighlights: 0,
          avgHighlights: 0,
          maxHighlights: 0,
          updatedAt: new Date(),
        });
      } catch (err) {
        setStats({
          totalBooks: 0,
          totalHighlights: 0,
          avgHighlights: 0,
          maxHighlights: 0,
          updatedAt: new Date(),
        });
      }
    };
    // console.log(stats);
    if (!stats)
      fetchStats();
  }, [setStats]); // Optionally, you can remove books if you want to fetch only on mount

  useEffect(() => {
    if (coins === undefined) {
      // Only fetch if coins is undefined
      fetch(`${import.meta.env.VITE_BACKEND_URL}/coins`, {
        credentials: "include",
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
          if (typeof data.coins === "number") setCoins(data.coins);
        })
        .catch(() => { });
    }
  }, [coins, setCoins]);

  const handleFileSelect = (file: File | null) => {
    if (file) {
      // Restrict to .txt files only
      if (!file.name.toLowerCase().endsWith(".txt")) {
        toastSonner({
          title: "Invalid file type",
          description: "Only .txt files are allowed.",
          variant: "destructive",
        });
        setSelectedFile(null);
        return;
      }
      // Restrict file size
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toastSonner({
          title: "File too large",
          description: `The file size must be less than ${MAX_FILE_SIZE_MB}MB.`,
          variant: "destructive",
        });
        setSelectedFile(null);
        return;
      }
    }
    setSelectedFile(file);
    setConsent(true); // Reset consent to true on new file
    if (processingState === 'completed') {
      setProcessingState('idle');
    }
  };
  const updateProgress = (addValue) => {
    setProgress(prev => prev + addValue);
  }
  const handleGenerateZip = async () => {
    if (!selectedFile) {
      toastSonner({
        title: "No file selected",
        description: "Please select a clippings.txt file first.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('consent', consent ? 'true' : 'false');

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/get-user-highlights-json`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (response.status === 402) {
        const data = await response.json();
        toastSonner({
          title: "Not enough coins",
          description: data.message || "You do not have enough coins to process these books.",
          variant: "destructive",
        });
        setProcessingState('idle');
        return;
      }

      if (response.status === 418) {
        const data = await response.json();
        toastSonner({
          title: "Processing Error",
          description: data.message || "There was an error processing your file. Please try again.",
          variant: "destructive",
        });
        setProcessingState('idle');
        setSelectedFile(null);
        return;
      }

      if (!response.ok) throw new Error("Upload Failed");

      const data = await response.json();

      if (typeof data.coins === "number") {
        setCoins(data.coins);
      }
      setStats(data.stats || null);

      setProgress(20);
      setProcessingState('processing');
      if (data.highlights) {
        await generatePdfZip(data.highlights, updateProgress);
        toastSonner({
          title: "Download ready!",
          description: "Your highlights PDFs have been zipped and downloaded.",
        });
        setProgress(100)
        setProcessingState('completed');
        setIsDownloading(false);
        setHasDownloaded(true);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toastSonner({
        title: "Upload failed",
        description: error.message || "There was an error processing your file. Please try again.",
        variant: "destructive",
      });
      setProcessingState('idle');
    } finally {
      setIsGenerating(false);
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

    toastSonner({
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

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      toast.success("Logged out successfully!");
      navigate("/auth");
    } catch (err) {
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <div className="min-h-[89vh] bg-gradient-to-br from-background via-royal-100/30 to-royal-200/30 dark:from-background dark:via-royal-900/10 dark:to-royal-900/10 flex flex-col items-center justify-center p-6 relative">
      {/* Burger menu top left */}
      <div className="absolute top-6 left-8 z-50">
        <button
          onClick={() => setDashboardOpen(true)}
          className="p-2 rounded-full bg-card dark:bg-card/50 shadow hover:bg-accent transition-colors"
        >
          <Menu className="h-6 w-6 text-royal-500" />
        </button>
      </div>

      {/* Coins dashboard top right */}
      <div className="absolute top-6 right-8 z-50">
        <CoinsDashboard coins={typeof coins === "number" && !isNaN(coins) ? coins : 0} />
      </div>

      {/* Dashboard Drawer */}
      <DashboardDrawer
        open={dashboardOpen}
        onClose={() => setDashboardOpen(false)}
        onLogout={handleLogout}
        stats={stats}
      />

      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-royal-500/20 animate-pulse-glow"></div>
              <div className="relative bg-card rounded-full p-4 shadow-lg border border-royal-200 dark:border-royal-800">
                <BookOpen className="h-8 w-8 text-royal-500" />
              </div>
            </div>
            <Sparkles className="h-6 w-6 text-royal-400 ml-2 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Kindle Clippings
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
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

              {/* Consent Checkbox: show only if a file is selected */}
              {selectedFile && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="dashboard-consent"
                    checked={consent}
                    onChange={e => setConsent(e.target.checked)}
                    className="accent-royal-500"
                  />
                  <label htmlFor="dashboard-consent" className="text-sm text-foreground select-none">
                    I agree to use '{selectedFile.name}' to personalize and display its content on my dashboard.
                  </label>
                </div>
              )}

              {selectedFile && (
                <div className="text-center animate-fade-in">
                  <Button
                    onClick={handleGenerateZip}
                    disabled={isGenerating}
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
              <div className="w-full bg-gray-200 dark:bg-muted rounded-full h-4 mt-4">
                <div
                  className="bg-royal-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-center mt-2 text-sm text-muted-foreground">  {progress.toFixed(2)}%</div>
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

        <div className="text-center mt-8 animate-fade-in">
          <p className="text-sm text-muted-foreground">
            Your files are processed securely and never stored on our servers without your consent.
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">No Clippings.txt file? No problem. </span>
            Try the app using our{" "}
            <a
              href="/My Clippings.txt"
              download="My Clippings.txt"
              className="text-royal-500 hover:underline"
            >
              Sample File
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;



// Moved Stats to a different Component
// CoinsDashboard Number check to avoid NaN
// Sidebar for Dashboard is fixed now for Desktop