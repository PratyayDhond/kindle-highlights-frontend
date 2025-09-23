// Create src/pages/KindleSecret.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Key, Download, Eye, EyeOff, Copy, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';

interface KindleSecretData {
  secret: string;
  userId: string;
  createdAt: string;
}

export default function KindleSecret() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [secretData, setSecretData] = useState<KindleSecretData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showUserId, setShowUserId] = useState(false); // Add this line

  // Fetch existing secret on component mount
  useEffect(() => {
    if(user)
        fetchSecret();
  }, [user]);

  const fetchSecret = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/kindle-secret`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSecretData({ secret: data.secretKey, userId: user.id, createdAt: data.createdAt });
      } else if (response.status === 404) {
        // No secret exists yet
        setSecretData(null);
      } else {
        throw new Error('Failed to fetch secret');
      }
    } catch (error) {
      console.error('Error fetching secret:', error);
      toast.error('Failed to load Kindle secret');
    } finally {
      setLoading(false);
    }
  };

  const generateSecret = async () => {
    try {
      setGenerating(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/generate-kindle-secret`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSecretData({ secret: data.secretKey, userId: user.id, createdAt: data.createdAt });
        toast.success('Kindle secret generated successfully!');
      } else {
        throw new Error('Failed to generate secret');
      }
    } catch (error) {
      console.error('Error generating secret:', error);
      toast.error('Failed to generate Kindle secret');
    } finally {
      setGenerating(false);
    }
  };

  const deleteSecret = async () => {

    try {
      setDeleting(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/kindle-secret`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setSecretData(null);
        toast.success('Kindle secret deleted successfully!');
      } else {
        throw new Error('Failed to delete secret');
      }
    } catch (error) {
      console.error('Error deleting secret:', error);
      toast.error('Failed to delete Kindle secret');
    } finally {
      setDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const downloadSecretFile = () => {
    if (!secretData) return;

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const content = `${secretData.userId},${secretData.secret},${backendUrl}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kindle_secret.kindle_clippings';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Secret file downloaded!');
  };

  const maskSecret = (secret: string) => {
    if (!secret) return '';
    if (secret.length < 12) return secret; // Don't mask if too short
    return secret.substring(0, 8) + '*'.repeat(secret.length - 12) + secret.substring(secret.length - 4);
  };

  // Add a new function to mask User ID
  const maskUserId = (userId: string) => {
    if (!userId) return '';
    if (userId.length < 8) return userId; // Don't mask if too short
    return userId.substring(0, 4) + '*'.repeat(userId.length - 8) + userId.substring(userId.length - 4);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-royal-100/30 to-royal-200/30">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-royal-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-royal-700 mb-2">Loading Kindle Secret...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-royal-100/30 to-royal-200/30">
      <div className="max-w-4xl mx-auto py-10 px-4">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-royal-600 hover:text-royal-800 transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <Key className="w-8 h-8 text-royal-600" />
            <h1 className="text-3xl font-bold text-royal-700">Kindle Secret Management</h1>
          </div>
        </div>

        {/* Disclaimer Alert */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-amber-800 mb-2">Important Security Notice</h3>
              <ul className="text-amber-700 space-y-1 text-sm">
                <li>• <strong>Keep your secret key private</strong> - Never share it with anyone</li>
                <li>• <strong>Store securely on your Kindle</strong> - Copy to root directory as '<code className="bg-amber-100 px-1 rounded">.kindle_secret.kindle_clippings</code>' file.</li>
                <li>• <strong>Revoke if compromised</strong> - Delete and regenerate if you suspect unauthorized access</li>
                <li>• <strong>Jailbroken Kindle required</strong> - This feature requires a modified Kindle device</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {secretData ? (
            /* Existing Secret Display */
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Key className="w-4 h-4" />
                  Secret Key Active
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Kindle Secret</h2>
                <p className="text-gray-600">Generated on {new Date(secretData.createdAt).toLocaleDateString()}</p>
              </div>

              {/* User ID Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">User ID</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={showUserId ? (secretData?.userId || '') : maskUserId(secretData?.userId || '')}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 font-mono"
                  />
                  <button
                    onClick={() => setShowUserId(!showUserId)}
                    className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    title={showUserId ? "Hide User ID" : "Show User ID"}
                  >
                    {showUserId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(secretData?.userId || '')}
                    className="px-3 py-2 bg-royal-600 text-white rounded-md hover:bg-royal-700 transition-colors"
                    title="Copy User ID"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Secret Key Section - also update with fallbacks */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Secret Key</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={showSecret ? (secretData?.secret || '') : maskSecret(secretData?.secret || '')}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 font-mono"
                  />
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    title={showSecret ? "Hide Secret" : "Show Secret"}
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(secretData?.secret || '')}
                    className="px-3 py-2 bg-royal-600 text-white rounded-md hover:bg-royal-700 transition-colors"
                    title="Copy Secret"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  onClick={downloadSecretFile}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Download className="w-5 h-5" />
                  Download Secret File
                </button>
                
                <button
                  onClick={deleteSecret}
                  disabled={deleting}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:bg-red-400 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Revoke Secret
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* No Secret - Generate New */
            <div className="text-center space-y-6">
              <div>
                <Key className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No Kindle Secret Found</h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Generate a secret key to enable direct uploads from your jailbroken Kindle device.
                </p>
              </div>

              <button
                onClick={generateSecret}
                disabled={generating}
                className="inline-flex items-center gap-2 px-8 py-4 bg-royal-600 text-white rounded-lg hover:bg-royal-700 transition-colors font-medium text-lg disabled:bg-royal-400 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    Generate Kindle Secret
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Instructions Section */}
        {secretData && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Setup Instructions</h3>
            <div className="space-y-3 text-blue-700">
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <p>Download the secret file using the button above</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <p>Copy the file to your Kindle's root directory (same level as documents folder)</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <p>Ensure the filename is exactly: <code className="bg-blue-100 px-1 rounded">.kindle_secret.kindle_clippings</code></p>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <p>The file contains your credentials and server URL for automatic sync</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                <p>Your Kindle can now automatically sync highlights to your account</p>
              </div>
            </div>

            {/* File Format Information */}
            <div className="mt-4 p-3 bg-blue-100 rounded-md">
              <h4 className="text-sm font-semibold text-blue-800 mb-1">File Format:</h4>
              <code className="text-xs text-blue-700 font-mono">
                {secretData.userId},{maskSecret(secretData.secret)},{import.meta.env.VITE_BACKEND_URL}
              </code>
              <p className="text-xs text-blue-600 mt-1">
                Format: UserID, Secret Key, Server URL (comma-separated)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}