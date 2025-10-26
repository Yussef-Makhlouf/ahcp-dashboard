"use client";

import { FilterTest } from '@/components/test/filter-test';

export default function TestFiltersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">🧪 اختبار الفلاتر</h1>
          <p className="text-gray-600 mt-2">
            صفحة اختبار للتأكد من عمل الفلاتر بشكل صحيح مع جميع الجداول
          </p>
        </div>
        
        <FilterTest />
        
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">📝 تعليمات الاختبار:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>1. اختر فلاتر مختلفة من القسم العلوي (تاريخ، طريقة الرش، إلخ)</li>
            <li>2. اضغط على أزرار الاختبار لكل جدول</li>
            <li>3. راقب Console للتحقق من المعاملات المرسلة</li>
            <li>4. تحقق من النتائج المعروضة أسفل الصفحة</li>
            <li>5. تأكد من أن الفلاتر تؤثر على عدد النتائج</li>
          </ul>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">🔍 ما يجب فحصه:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• هل تصل معاملات الفلاتر للباك إند بشكل صحيح؟</li>
            <li>• هل تؤثر الفلاتر على عدد النتائج المعروضة؟</li>
            <li>• هل تعمل فلاتر التاريخ بشكل صحيح؟</li>
            <li>• هل تعمل الفلاتر المخصصة (طريقة الرش، نوع اللقاح، إلخ)؟</li>
            <li>• هل يتم تحويل الفلاتر لمعاملات API بشكل صحيح؟</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
