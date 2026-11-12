/**
 * Universal Printing Utility for School Management System
 * Enables crisp, high-fidelity, isolated printing of receipts, vouchers,
 * student/staff ID cards, academic routines, admit cards, and grade sheets.
 */

export interface PrintOptions {
  title?: string;
  pageSize?: 'A4' | 'A5' | 'Letter' | 'ID-Card' | 'auto';
  orientation?: 'portrait' | 'landscape';
  margin?: string;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
}

/**
 * Prints a specific DOM element (by element ID or HTMLElement reference)
 * isolated in a dedicated print frame, preventing UI chrome, sidebar,
 * or modal backdrops from appearing in the print output.
 */
export const printElement = (
  target: string | HTMLElement | null,
  options: PrintOptions = {}
): boolean => {
  if (!target) {
    window.print();
    return true;
  }

  const element: HTMLElement | null =
    typeof target === 'string' ? document.getElementById(target) : target;

  if (!element) {
    console.warn(`[printElement] Target element "${target}" not found. Falling back to window.print()`);
    window.print();
    return false;
  }

  const {
    title = document.title || 'Print Document',
    pageSize = 'auto',
    orientation = 'portrait',
    margin = '8mm',
    onBeforePrint,
    onAfterPrint,
  } = options;

  if (onBeforePrint) onBeforePrint();

  // Try isolated hidden iframe method first (universal and cleanest)
  try {
    const existingFrame = document.getElementById('sms-isolated-print-frame');
    if (existingFrame && existingFrame.parentNode) {
      existingFrame.parentNode.removeChild(existingFrame);
    }

    const printFrame = document.createElement('iframe');
    printFrame.id = 'sms-isolated-print-frame';
    printFrame.setAttribute(
      'style',
      'position: fixed; top: -9999px; left: -9999px; width: 0; height: 0; border: 0; visibility: hidden;'
    );
    document.body.appendChild(printFrame);

    const frameWindow = printFrame.contentWindow;
    const frameDoc = frameWindow?.document || printFrame.contentDocument;

    if (!frameDoc || !frameWindow) {
      throw new Error('Unable to access iframe document');
    }

    // Capture all stylesheets and styles from parent document
    const headStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((node) => node.outerHTML)
      .join('\n');

    // Clone element HTML
    const contentHtml = element.outerHTML;

    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <base href="${window.location.origin}" />
        ${headStyles}
        <style>
          @page {
            size: ${pageSize === 'ID-Card' ? '86mm 54mm' : `${pageSize} ${orientation}`};
            margin: ${margin};
          }
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              background: #ffffff !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .no-print, .print\\:hidden, button {
              display: none !important;
            }
          }
          body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 10px !important;
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            color: #0f172a;
          }
          svg {
            display: inline-block;
            vertical-align: middle;
          }
        </style>
      </head>
      <body class="antialiased">
        <div class="sms-printable-root">
          ${contentHtml}
        </div>
      </body>
      </html>
    `);
    frameDoc.close();

    // Trigger printing once parsed
    setTimeout(() => {
      try {
        frameWindow.focus();
        frameWindow.print();
        if (onAfterPrint) onAfterPrint();
      } catch (printErr) {
        console.warn('Iframe print error, falling back to window.print():', printErr);
        window.print();
      } finally {
        setTimeout(() => {
          if (printFrame.parentNode) {
            printFrame.parentNode.removeChild(printFrame);
          }
        }, 3000);
      }
    }, 280);

    return true;
  } catch (err) {
    console.warn('Isolated iframe setup failed, running fallback isolation:', err);
    element.classList.add('print-isolated-target');
    document.body.classList.add('printing-isolated');
    window.print();
    setTimeout(() => {
      element.classList.remove('print-isolated-target');
      document.body.classList.remove('printing-isolated');
      if (onAfterPrint) onAfterPrint();
    }, 1200);
    return false;
  }
};
