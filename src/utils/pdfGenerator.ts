import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

export interface PdfExportOptions {
  filename?: string;
  format?: 'a4' | 'a5';
  orientation?: 'portrait' | 'landscape';
  margin?: number; // margin in mm
}

/**
 * Exports an HTML DOM element to a professional PDF file.
 * Uses html2canvas-pro to support modern CSS color spaces including OKLCH, Display P3, and Tailwind CSS v4.
 * Automatically handles multi-page splitting for tall reports.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  options: PdfExportOptions = {}
): Promise<boolean> {
  const {
    filename = 'Report.pdf',
    format = 'a4',
    orientation = 'portrait',
    margin = 8
  } = options;

  try {
    // Generate high-resolution canvas with html2canvas-pro (native oklch support)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc, clonedElement) => {
        // Ensure any scroll containers or fixed heights expand naturally
        if (clonedElement && clonedElement instanceof HTMLElement) {
          clonedElement.style.overflow = 'visible';
          clonedElement.style.maxHeight = 'none';
        }
        const pdfTargets = clonedDoc.querySelectorAll('[data-pdf-target]');
        pdfTargets.forEach((target) => {
          if (target instanceof HTMLElement) {
            target.style.overflow = 'visible';
            target.style.maxHeight = 'none';
          }
        });
      }
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: orientation === 'portrait' ? 'p' : 'l',
      unit: 'mm',
      format: format
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const usableWidth = pageWidth - (margin * 2);
    const usableHeight = pageHeight - (margin * 2);

    // Calculate scaled image height to match usable width
    const imgHeight = (canvas.height * usableWidth) / canvas.width;

    if (imgHeight <= usableHeight) {
      // Single page document
      pdf.addImage(imgData, 'PNG', margin, margin, usableWidth, imgHeight);
    } else {
      // Multi-page document handling
      let heightLeft = imgHeight;
      let position = margin;
      let page = 0;

      while (heightLeft > 0) {
        if (page > 0) {
          pdf.addPage();
        }

        // Clip or place image slice
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          position - (page * usableHeight),
          usableWidth,
          imgHeight
        );

        heightLeft -= usableHeight;
        page++;
      }
    }

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    return true;
  } catch (err) {
    console.error('Failed to export PDF:', err);
    throw err;
  }
}
