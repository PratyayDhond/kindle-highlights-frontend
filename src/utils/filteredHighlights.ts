import { Highlight, StagedOperation } from "@/interfaces";

function getFilteredHighlights(highlights: Highlight[], showHighlights: boolean, showNotes: boolean, showUrlsOnly: boolean, search: string, isHighlightStaged: (id: string) => StagedOperation | undefined, getEffectiveHighlight: (hl: Highlight) => Highlight): Highlight[] {
    return highlights
        .filter((hl: any) => {
          const stagedOp = isHighlightStaged(hl._id);
          if (stagedOp?.type === 'delete' || stagedOp?.type === 'edit') return false;
          
          const isActive = hl.knowledge_end_date === null;
          const matchesSearch = search
            ? hl.highlight.toLowerCase().includes(search.toLowerCase())
            : true;
          const matchesType =
            (showHighlights && hl.type === "highlight") ||
            (showNotes && hl.type === "note") ||
            (showUrlsOnly && hl.containsUrl);
          return isActive && matchesSearch && matchesType;
        })
        .map((hl: any) => getEffectiveHighlight(hl));
}