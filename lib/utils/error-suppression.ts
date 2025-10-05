// Error suppression for browser extension errors
export const suppressBrowserExtensionErrors = () => {
  // Override console.error to filter out extension errors
  const originalError = console.error;
  
  console.error = (...args: any[]) => {
    const errorMessage = args.join(' ');
    
    // Filter out browser extension errors
    if (
      errorMessage.includes('contentScript.js') ||
      errorMessage.includes('Cannot read properties of null') ||
      errorMessage.includes('indexOf')
    ) {
      // Don't log extension errors
      return;
    }
    
    // Log other errors normally
    originalError.apply(console, args);
  };
  
  // Override window.onerror to filter extension errors
  const originalOnError = window.onerror;
  
  window.onerror = (message, source, lineno, colno, error) => {
    if (
      source?.includes('contentScript.js') ||
      message?.includes('Cannot read properties of null') ||
      message?.includes('indexOf')
    ) {
      // Suppress extension errors
      return true;
    }
    
    // Handle other errors normally
    if (originalOnError) {
      return originalOnError.call(window, message, source, lineno, colno, error);
    }
    
    return false;
  };
};

// Initialize error suppression
if (typeof window !== 'undefined') {
  suppressBrowserExtensionErrors();
}
