"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export function ApiConnectionTest() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  const runConnectionTests = async () => {
    setTesting(true);
    const results: any[] = [];

    // Test 1: Basic API connection
    try {
      console.log('🧪 Testing: Basic API connection');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://ahcp-backend-production.up.railway.app/api'}/dropdown-lists`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      results.push({
        test: 'Basic API Connection',
        success: response.ok,
        status: response.status,
        data: response.ok ? `Connected successfully` : data.message || 'Connection failed',
        details: data
      });
    } catch (error: any) {
      results.push({
        test: 'Basic API Connection',
        success: false,
        error: error.message,
        details: error
      });
    }

    // Test 2: Categories endpoint
    try {
      console.log('🧪 Testing: Categories endpoint');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://ahcp-backend-production.up.railway.app/api'}/dropdown-lists/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      results.push({
        test: 'Categories Endpoint',
        success: response.ok,
        status: response.status,
        data: response.ok ? `Found ${data.data?.length || 0} categories` : data.message || 'Failed',
        details: data
      });
    } catch (error: any) {
      results.push({
        test: 'Categories Endpoint',
        success: false,
        error: error.message,
        details: error
      });
    }

    // Test 3: Environment variables
    results.push({
      test: 'Environment Variables',
      success: !!process.env.NEXT_PUBLIC_API_URL,
      data: `API URL: ${process.env.NEXT_PUBLIC_API_URL || 'Not set'}`,
      details: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
      }
    });

    setTestResults(results);
    setTesting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>اختبار الاتصال بـ APIs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runConnectionTests} disabled={testing}>
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              جاري الاختبار...
            </>
          ) : (
            'تشغيل اختبارات الاتصال'
          )}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">نتائج الاختبارات:</h3>
            {testResults.map((result, index) => (
              <Alert key={index} className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <strong>{result.test}</strong>
                      {result.status && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          result.status === 200 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {result.status}
                        </span>
                      )}
                    </div>
                    
                    <div className={result.success ? 'text-green-700' : 'text-red-700'}>
                      <div>النتيجة: {result.data || result.error}</div>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm">عرض التفاصيل</summary>
                          <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
