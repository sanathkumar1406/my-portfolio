import { useState, useEffect } from 'react';

// Dynamic import to avoid Vite ESM issues
let pdfjsLib: any = null;

const getPdfJs = async () => {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    // Set worker source - use local worker file from public folder
    if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
      // Use local worker file (copied to public folder)
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    }
  }
  return pdfjsLib;
};

interface UsePdfThumbnailResult {
  thumbnailUrl: string | null;
  loading: boolean;
  error: Error | null;
}

export const usePdfThumbnail = (pdfUrl: string | null): UsePdfThumbnailResult => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!pdfUrl) {
      setThumbnailUrl(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const generateThumbnail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load PDF.js library
        const lib = await getPdfJs();

        // Load the PDF document
        const loadingTask = lib.getDocument({
          url: pdfUrl,
          // Disable CORS warnings for local development
          httpHeaders: {},
          withCredentials: false,
        });

        const pdf = await loadingTask.promise;

        if (cancelled) return;

        // Get the first page
        const page = await pdf.getPage(1);

        // Set up canvas with appropriate dimensions
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error('Could not get canvas context');
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render the page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        if (cancelled) return;

        // Convert canvas to data URL (image)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setThumbnailUrl(dataUrl);
      } catch (err) {
        if (!cancelled) {
          console.error('Error generating PDF thumbnail:', err);
          setError(err instanceof Error ? err : new Error('Failed to generate thumbnail'));
          setThumbnailUrl(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    generateThumbnail();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  return { thumbnailUrl, loading, error };
};
