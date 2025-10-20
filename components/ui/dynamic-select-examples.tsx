'use client';

import React, { useState } from 'react';
import { DynamicSelect } from './dynamic-select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DROPDOWN_CATEGORIES } from '@/lib/api/dropdown-lists';

export function DynamicSelectExamples() {
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});

  const handleValueChange = (category: string, value: string) => {
    setSelectedValues(prev => ({ ...prev, [category]: value }));
  };

  const examples = [
    {
      title: 'أنواع المصل',
      description: 'قائمة أنواع المصل المستخدمة في التطعيمات',
      category: 'VACCINE_TYPES' as keyof typeof DROPDOWN_CATEGORIES,
      required: true
    },
    {
      title: 'حالة القطيع',
      description: 'حالة القطيع الصحية',
      category: 'HERD_HEALTH' as keyof typeof DROPDOWN_CATEGORIES,
      required: false
    },
    {
      title: 'أنواع المبيدات',
      description: 'أنواع المبيدات المستخدمة في مكافحة الطفيليات',
      category: 'INSECTICIDE_TYPES' as keyof typeof DROPDOWN_CATEGORIES,
      required: true
    },
    {
      title: 'أنواع العينات',
      description: 'أنواع العينات المختبرية',
      category: 'SAMPLE_TYPES' as keyof typeof DROPDOWN_CATEGORIES,
      required: false
    },
    {
      title: 'مستويات الأولوية',
      description: 'مستويات الأولوية للمهام',
      category: 'PRIORITY_LEVELS' as keyof typeof DROPDOWN_CATEGORIES,
      required: true
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">أمثلة على القوائم المنسدلة الديناميكية</h2>
        <p className="text-muted-foreground">
          هذه أمثلة على كيفية استخدام مكون DynamicSelect مع فئات مختلفة من القوائم المنسدلة
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {examples.map((example) => (
          <Card key={example.category}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {example.title}
                {example.required && (
                  <Badge variant="destructive" className="text-xs">مطلوب</Badge>
                )}
              </CardTitle>
              <CardDescription>{example.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DynamicSelect
                category={example.category}
                value={selectedValues[example.category] || ''}
                onValueChange={(value) => handleValueChange(example.category, value)}
                label={example.title}
                required={example.required}
                placeholder={`اختر ${example.title}`}
                allowEmpty={!example.required}
                emptyText="لا يوجد خيار"
              />
              
              {selectedValues[example.category] && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm">
                    <strong>القيمة المختارة:</strong> {selectedValues[example.category]}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>جميع القيم المختارة</CardTitle>
          <CardDescription>عرض جميع القيم المختارة من القوائم أعلاه</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(selectedValues).length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              لم يتم اختيار أي قيم بعد
            </p>
          ) : (
            <div className="space-y-2">
              {Object.entries(selectedValues).map(([category, value]) => {
                const example = examples.find(ex => ex.category === category);
                return (
                  <div key={category} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="font-medium">{example?.title}:</span>
                    <Badge variant="outline">{value}</Badge>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setSelectedValues({})}
              disabled={Object.keys(selectedValues).length === 0}
            >
              مسح الكل
            </Button>
            <Button 
              onClick={() => console.log('Selected values:', selectedValues)}
              disabled={Object.keys(selectedValues).length === 0}
            >
              طباعة القيم
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>كود الاستخدام</CardTitle>
          <CardDescription>مثال على كيفية استخدام DynamicSelect في الكود</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
{`import { DynamicSelect } from '@/components/ui/dynamic-select';

// في المكون الخاص بك
const [vaccineType, setVaccineType] = useState('');

<DynamicSelect
  category="VACCINE_TYPES"
  value={vaccineType}
  onValueChange={setVaccineType}
  label="نوع المصل"
  required={true}
  placeholder="اختر نوع المصل"
  error={errors.vaccineType}
/>`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
