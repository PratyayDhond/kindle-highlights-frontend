// Create src/components/StagingArea.tsx
import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import { StagedOperation } from '@/interfaces';

interface StagingAreaProps {
  stagingArea: StagedOperation[];
  isCommitting: boolean;
  isDesktop: boolean;
  onRemoveOperation: (operationId: string) => void;
  onClearAll: () => void;
  onCommitAll: () => void;
}

const StagingArea: React.FC<StagingAreaProps> = ({
  stagingArea,
  isCommitting,
  isDesktop,
  onRemoveOperation,
  onClearAll,
  onCommitAll
}) => {
  return (
    <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Staging Area</h3>
        <div className="flex gap-2">
          <button
            onClick={onClearAll}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
            disabled={stagingArea.length === 0}
          >
            Clear All
          </button>
          <button
            onClick={onCommitAll}
            disabled={stagingArea.length === 0 || isCommitting}
            className="px-3 py-1 text-sm bg-royal-600 text-white rounded hover:bg-royal-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {isCommitting ? (
              <>
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                Committing...
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3" />
                Commit All Changes ({stagingArea.length})
              </>
            )}
          </button>
        </div>
      </div>
      
      {stagingArea.length === 0 ? (
        <p className="text-gray-500 text-sm">No pending changes</p>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {stagingArea.map((op) => (
            <div
              key={op.id}
              className={`p-3 rounded border-l-4 ${
                op.type === 'delete' 
                  ? 'border-red-400 bg-red-50' 
                  : 'border-blue-400 bg-blue-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      op.type === 'delete' 
                        ? 'bg-red-200 text-red-800' 
                        : 'bg-blue-200 text-blue-800'
                    }`}>
                      {op.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(op.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {op.type === 'edit' 
                      ? op.updatedHighlight?.highlight || op.originalHighlight.highlight
                      : op.originalHighlight.highlight
                    }
                  </p>
                  {op.type === 'edit' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Original: {isDesktop 
                        ? op.originalHighlight.highlight.substring(0,255) + (op.originalHighlight.highlight.length > 255 ? '...' : '') 
                        : op.originalHighlight.highlight.substring(0, 50) + '...'
                      }
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onRemoveOperation(op.id)}
                  className="text-gray-400 hover:text-red-600 ml-2"
                  title="Remove from staging"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StagingArea;