import React from "react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import { Sparkles } from "lucide-react";

interface UploadClippingsSectionProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  onGenerateZip: () => void;
  isGenerating: boolean;
}

const UploadClippingsSection: React.FC<UploadClippingsSectionProps> = ({
  selectedFile,
  onFileSelect,
  onGenerateZip,
  isGenerating,
}) => (
  <div className="space-y-8">
    <FileUpload onFileSelect={onFileSelect} selectedFile={selectedFile} />
    {selectedFile && (
      <div className="text-center animate-fade-in">
        <Button
          onClick={onGenerateZip}
          disabled={isGenerating}
          className="bg-gradient-to-r from-royal-500 to-royal-600 hover:from-royal-600 hover:to-royal-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Zip
        </Button>
      </div>
    )}
  </div>
);

export default UploadClippingsSection;