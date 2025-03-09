import * as pdfjsLib from 'pdfjs-dist';

export const initializePdfjs = () => {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
};