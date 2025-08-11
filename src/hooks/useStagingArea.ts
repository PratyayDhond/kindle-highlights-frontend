// Create src/hooks/useStagingArea.ts
import { useState, useEffect } from 'react';
import { StagedOperation, Highlight } from '@/interfaces';
import { toast } from 'sonner';

interface UseStagingAreaProps {
  bookId?: string;
  onUpdateLocalBookData?: (successfulOperations: any[]) => void;
  onHandleFailedOperations?: (failedOperations: any[]) => void;
}

export const useStagingArea = ({ 
  bookId, 
  onUpdateLocalBookData, 
  onHandleFailedOperations 
}: UseStagingAreaProps) => {
  const [stagingArea, setStagingArea] = useState<StagedOperation[]>([]);
  const [isCommitting, setIsCommitting] = useState(false);

  // Load staging area from localStorage on mount
  useEffect(() => {
    if (bookId) {
      const saved = localStorage.getItem(`staging_${bookId}`);
      if (saved) {
        try {
          setStagingArea(JSON.parse(saved));
        } catch {
          // Corrupted data, ignore
        }
      }
    }
  }, [bookId]);

  // Save staging area to localStorage whenever it changes
  useEffect(() => {
    if (bookId) {
      localStorage.setItem(`staging_${bookId}`, JSON.stringify(stagingArea));
    }
  }, [stagingArea, bookId]);

  // Add operation to staging area
  const addToStagingArea = (operation: Omit<StagedOperation, 'id' | 'timestamp'>) => {
    const stagedOp: StagedOperation = {
      ...operation,
      id: `${operation.type}_${operation.highlightId}_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    
    setStagingArea(prev => {
      // Remove any existing operations for the same highlight
      const filtered = prev.filter(op => op.highlightId !== operation.highlightId);
      return [...filtered, stagedOp];
    });
  };

  // Remove operation from staging area
  const removeFromStagingArea = (operationId: string) => {
    setStagingArea(prev => prev.filter(op => op.id !== operationId));
  };

  // Clear staging area
  const clearStagingArea = () => {
    setStagingArea([]);
    if (bookId) {
      localStorage.removeItem(`staging_${bookId}`);
    }
  };

  // Check if a highlight is staged
  const isHighlightStaged = (highlightId: string): StagedOperation | null => {
    return stagingArea.find(op => op.highlightId === highlightId) || null;
  };

  // Get the effective highlight data (with staged edits applied)
  const getEffectiveHighlight = (highlight: Highlight): Highlight => {
    const stagedOp = stagingArea.find(op => 
      op.highlightId === highlight._id && op.type === 'edit'
    );
    
    if (stagedOp?.updatedHighlight) {
      return { ...highlight, ...stagedOp.updatedHighlight };
    }
    
    return highlight;
  };

  // Handle delete highlight - add to staging
  const handleDelete = (highlight: Highlight) => {
    addToStagingArea({
      type: 'delete',
      highlightId: highlight._id,
      originalHighlight: highlight,
    });
    console.log("Highlight staged for deletion:", highlight);
  };

  
  // Handle save edit - add to staging
  const handleSaveEdit = (originalHighlight: Highlight, updatedHighlight: any) => {
    addToStagingArea({
      type: 'edit',
      highlightId: originalHighlight._id,
      originalHighlight: originalHighlight,
      updatedHighlight: updatedHighlight,
    });
    
    console.log("Highlight staged for edit:", updatedHighlight);
  };

  // Commit all staged operations
  const commitStagedOperations = async () => {
    if (stagingArea.length === 0 || !bookId) return;
    
    setIsCommitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/book/${bookId}/batch-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          operations: stagingArea,
        }),
      });

      if (!response.ok) throw new Error('Failed to commit changes');

      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      // Update local cached data based on successful operations
      if (responseData.results?.successful?.length > 0 && onUpdateLocalBookData) {
        console.log('Going inside updateLocalBookData');
        onUpdateLocalBookData(responseData.results.successful);
      }
      
      // Handle failed operations
      if (responseData.results?.failed?.length > 0 && onHandleFailedOperations) {
        onHandleFailedOperations(responseData.results.failed);
      }
      
      // Clear staging area on success (or partial success)
      clearStagingArea();
      console.log("Response data after commit:", responseData);
      // Show success/partial success message
      if (responseData.results.successCount === responseData.results.totalOperations) {
        // console.log(`Successfully committed all ${responseData.results.successCount} operations`);
        toast.success(`Successfully updated ${responseData.results.successCount} highlights`);
      } else {
        // console.log(`Committed ${responseData.results.successCount}/${responseData.results.totalOperations} operations`);
        toast.warning(`Updated ${responseData.results.successCount} of ${responseData.results.totalOperations} highlights`);
      }
      
    } catch (error) {
    //   console.error('Failed to commit staged operations:', error);
      toast.error('Failed to commit changes. Please try again.');
    } finally {
      setIsCommitting(false);
    }
  };

  return {
    stagingArea,
    isCommitting,
    addToStagingArea,
    removeFromStagingArea,
    clearStagingArea,
    isHighlightStaged,
    getEffectiveHighlight,
    handleDelete,
    handleSaveEdit,
    commitStagedOperations,
  };
};