"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableFilters, useTableFilters } from '@/components/data-table/table-filters';
import { getTableFilterConfig, filtersToApiParams } from '@/lib/table-filter-configs';
import { parasiteControlApi } from '@/lib/api/parasite-control';
import { vaccinationApi } from '@/lib/api/vaccination';
import { laboratoriesApi } from '@/lib/api/laboratories';
import { mobileClinicsApi } from '@/lib/api/mobile-clinics';

export function FilterTest() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // إعداد الفلاتر لجدول مكافحة الطفيليات
  const {
    filters,
    dateRange,
    updateFilters,
    updateDateRange,
    clearFilters,
    hasActiveFilters
  } = useTableFilters({});

  const testParasiteControlFilters = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing Parasite Control Filters...');
      console.log('📋 Current filters:', filters);
      console.log('📅 Current date range:', dateRange);
      
      const apiParams = filtersToApiParams({ ...filters, dateRange });
      console.log('📤 API Parameters:', apiParams);
      
      const result = await parasiteControlApi.getList({
        page: 1,
        limit: 5,
        ...apiParams,
      });
      
      console.log('✅ Parasite Control API Result:', result);
      setTestResults(prev => [...prev, {
        table: 'Parasite Control',
        filters: apiParams,
        resultCount: result.data.length,
        total: result.total,
        success: true
      }]);
    } catch (error: any) {
      console.error('❌ Parasite Control API Error:', error);
      setTestResults(prev => [...prev, {
        table: 'Parasite Control',
        filters: filtersToApiParams({ ...filters, dateRange }),
        error: error?.message || 'Unknown error',
        success: false
      }]);
    }
    setIsLoading(false);
  };

  const testVaccinationFilters = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing Vaccination Filters...');
      const apiParams = filtersToApiParams({ ...filters, dateRange });
      
      const result = await vaccinationApi.getList({
        page: 1,
        limit: 5,
        ...apiParams,
      });
      
      console.log('✅ Vaccination API Result:', result);
      setTestResults(prev => [...prev, {
        table: 'Vaccination',
        filters: apiParams,
        resultCount: result.data.length,
        total: result.total,
        success: true
      }]);
    } catch (error: any) {
      console.error('❌ Vaccination API Error:', error);
      setTestResults(prev => [...prev, {
        table: 'Vaccination',
        filters: filtersToApiParams({ ...filters, dateRange }),
        error: error?.message || 'Unknown error',
        success: false
      }]);
    }
    setIsLoading(false);
  };

  const testLaboratoriesFilters = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing Laboratories Filters...');
      const apiParams = filtersToApiParams({ ...filters, dateRange });
      
      const result = await laboratoriesApi.getList({
        page: 1,
        limit: 5,
        ...apiParams,
      });
      
      console.log('✅ Laboratories API Result:', result);
      setTestResults(prev => [...prev, {
        table: 'Laboratories',
        filters: apiParams,
        resultCount: result.data.length,
        total: result.total,
        success: true
      }]);
    } catch (error: any) {
      console.error('❌ Laboratories API Error:', error);
      setTestResults(prev => [...prev, {
        table: 'Laboratories',
        filters: filtersToApiParams({ ...filters, dateRange }),
        error: error?.message || 'Unknown error',
        success: false
      }]);
    }
    setIsLoading(false);
  };

  const testMobileClinicsFilters = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing Mobile Clinics Filters...');
      const apiParams = filtersToApiParams({ ...filters, dateRange });
      
      const result = await mobileClinicsApi.getList({
        page: 1,
        limit: 5,
        ...apiParams,
      });
      
      console.log('✅ Mobile Clinics API Result:', result);
      setTestResults(prev => [...prev, {
        table: 'Mobile Clinics',
        filters: apiParams,
        resultCount: result.data.length,
        total: result.total,
        success: true
      }]);
    } catch (error: any) {
      console.error('❌ Mobile Clinics API Error:', error);
      setTestResults(prev => [...prev, {
        table: 'Mobile Clinics',
        filters: filtersToApiParams({ ...filters, dateRange }),
        error: error?.message || 'Unknown error',
        success: false
      }]);
    }
    setIsLoading(false);
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 اختبار الفلاتر - Filter Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* فلاتر الاختبار */}
          <TableFilters
            dateFilter={{
              enabled: true,
              label: "فلترة بالتاريخ",
              value: dateRange,
              onDateChange: updateDateRange,
            }}
            fieldFilters={getTableFilterConfig('parasiteControl')}
            filterValues={filters}
            onFiltersChange={updateFilters}
            defaultExpanded={true}
            className="mb-6"
          />

          {/* أزرار الاختبار */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={testParasiteControlFilters} 
              disabled={isLoading}
              variant="default"
            >
              🦠 اختبار فلاتر الطفيليات
            </Button>
            
            <Button 
              onClick={testVaccinationFilters} 
              disabled={isLoading}
              variant="secondary"
            >
              💉 اختبار فلاتر التطعيمات
            </Button>
            
            <Button 
              onClick={testLaboratoriesFilters} 
              disabled={isLoading}
              variant="outline"
            >
              🧪 اختبار فلاتر المختبرات
            </Button>
            
            <Button 
              onClick={testMobileClinicsFilters} 
              disabled={isLoading}
              variant="ghost"
            >
              🚐 اختبار فلاتر العيادات المتنقلة
            </Button>
            
            <Button 
              onClick={clearFilters} 
              variant="destructive"
              size="sm"
            >
              🗑️ مسح الفلاتر
            </Button>
            
            <Button 
              onClick={clearTestResults} 
              variant="destructive"
              size="sm"
            >
              🗑️ مسح النتائج
            </Button>
          </div>

          {/* عرض حالة الفلاتر الحالية */}
          <Card className="bg-blue-50">
            <CardHeader>
              <CardTitle className="text-sm">📊 حالة الفلاتر الحالية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>الفلاتر النشطة:</strong> {hasActiveFilters ? 'نعم' : 'لا'}</div>
                <div><strong>فلترة التاريخ:</strong> {dateRange?.from ? `من ${dateRange.from.toLocaleDateString('ar-SA')} إلى ${dateRange.to?.toLocaleDateString('ar-SA') || 'الآن'}` : 'غير محدد'}</div>
                <div><strong>الفلاتر الأخرى:</strong> {Object.keys(filters).length} فلتر</div>
                <div><strong>معاملات API:</strong></div>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(filtersToApiParams({ ...filters, dateRange }), null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* عرض نتائج الاختبار */}
          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">📋 نتائج الاختبار</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div key={index} className={`p-3 rounded border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="font-medium">
                        {result.success ? '✅' : '❌'} {result.table}
                      </div>
                      {result.success ? (
                        <div className="text-sm text-gray-600">
                          <div>عدد النتائج: {result.resultCount}</div>
                          <div>إجمالي السجلات: {result.total}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-red-600">
                          خطأ: {result.error}
                        </div>
                      )}
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer">عرض الفلاتر المرسلة</summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(result.filters, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
