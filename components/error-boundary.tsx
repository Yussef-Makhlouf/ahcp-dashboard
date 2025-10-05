"use client";

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Filter out browser extension errors
    if (
      error.message?.includes('contentScript.js') ||
      error.message?.includes('Cannot read properties of null') ||
      error.message?.includes('indexOf')
    ) {
      // Don't show error boundary for extension errors
      return { hasError: false };
    }
    
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Filter out browser extension errors
    if (
      error.message?.includes('contentScript.js') ||
      error.message?.includes('Cannot read properties of null') ||
      error.message?.includes('indexOf')
    ) {
      // Don't log extension errors
      return;
    }
    
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      
      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} />;
      }
      
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-lg font-medium text-red-800">حدث خطأ في التطبيق</h2>
          <p className="text-red-600">يرجى إعادة تحميل الصفحة</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            إعادة تحميل
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
