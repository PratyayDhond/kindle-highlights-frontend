import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import BookPdf from "../components/BookPdf";

export async function generatePdfZip(highlightsData, updateProgress) {
    const zip = new JSZip();
  const totalProgressForModule = 80;
  const progressPerBook = totalProgressForModule/highlightsData.length ;
  for (let i = 0; i < highlightsData.length; i++) {
    const book = highlightsData[i];
    // Generate PDF blob for each book
    const blob = await pdf(
      <BookPdf
        title={book.name}
        author={book.author}
        content={book.highlights}
      />
    ).toBlob();
    // Use book name or index for filename
    const safeTitle = book.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    zip.file(`${safeTitle || "book"}-${i + 1}.pdf`, blob);
    updateProgress(progressPerBook)
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  saveAs(zipBlob, "kindle-highlights.zip");
}

export default generatePdfZip;
