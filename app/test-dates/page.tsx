"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BirthDateCell, SimpleDateCell } from "@/components/ui/date-cell";
import { BirthDateDisplay } from "@/components/ui/birth-date-display";
import { parseFlexibleDate, formatDateShort } from "@/lib/utils/date-utils";

export default function TestDatesPage() {
  const [testDate, setTestDate] = useState("1985/03/15");
  const [results, setResults] = useState<any>(null);

  const testDateParsing = () => {
    console.log(`🧪 Testing date: ${testDate}`);
    
    const parsed = parseFlexibleDate(testDate);
    const formatted = formatDateShort(testDate);
    
    setResults({
      input: testDate,
      parsed: parsed ? {
        date: parsed,
        iso: parsed.toISOString().split('T')[0],
        year: parsed.getFullYear(),
        month: parsed.getMonth() + 1,
        day: parsed.getDate()
      } : null,
      formatted,
      success: !!parsed
    });
  };

  const testCases = [
    "1985/03/15",  // من الصورة
    "1985-03-15",  // ISO format
    "1985-15-03",  // YYYY-DD-MM
    "15/03/1985",  // DD/MM/YYYY
    "03/15/1985",  // MM/DD/YYYY
    "1990/12/25",  // Christmas
    "2000/01/01",  // Y2K
  ];

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle>اختبار معالجة التواريخ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              placeholder="أدخل التاريخ للاختبار"
              className="text-right"
            />
            <Button onClick={testDateParsing}>اختبار</Button>
          </div>

          {results && (
            <Card className={results.success ? "border-green-500" : "border-red-500"}>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <p><strong>المدخل:</strong> {results.input}</p>
                  <p><strong>النتيجة:</strong> {results.success ? "✅ نجح" : "❌ فشل"}</p>
                  {results.parsed && (
                    <>
                      <p><strong>التاريخ المحلل:</strong> {results.parsed.iso}</p>
                      <p><strong>السنة:</strong> {results.parsed.year}</p>
                      <p><strong>الشهر:</strong> {results.parsed.month}</p>
                      <p><strong>اليوم:</strong> {results.parsed.day}</p>
                    </>
                  )}
                  <p><strong>التنسيق:</strong> {results.formatted}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>اختبار المكونات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">BirthDateCell:</h4>
              <BirthDateCell date={testDate} />
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">SimpleDateCell:</h4>
              <SimpleDateCell date={testDate} />
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">BirthDateDisplay مع العمر:</h4>
              <BirthDateDisplay birthDate={testDate} showAge={true} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>حالات اختبار متعددة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testCases.map((dateCase, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <p className="font-mono text-sm">{dateCase}</p>
                  <BirthDateCell date={dateCase} />
                  <p className="text-xs text-gray-500">
                    {formatDateShort(dateCase)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
