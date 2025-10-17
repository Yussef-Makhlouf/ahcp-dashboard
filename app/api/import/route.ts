import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// قائمة الجداول المسموحة
const ALLOWED_TABLES = ['laboratory', 'vaccination', 'parasite_control', 'mobile', 'equine_health'];

// حد أقصى لعدد الصفوف
const MAX_ROWS = 50000;

// تعيين endpoints للجداول المختلفة
const TABLE_ENDPOINTS: Record<string, string> = {
  laboratory: 'laboratories',
  vaccination: 'vaccinations', 
  parasite_control: 'parasite-controls',
  mobile: 'mobile-clinics',
  equine_health: 'equine-health'
};

interface ImportError {
  rowIndex: number;
  field: string;
  message: string;
  value: any;
}

interface ImportRequest {
  tableType: string;
  rows: any[];
  dromoBackendKey?: string;
}

// الحصول على الـ backend URL
const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
};

// تنظيف وتحقق من صحة البيانات
function cleanAndValidateRow(row: any, rowIndex: number, tableType: string): { cleaned: any; errors: ImportError[] } {
  const errors: ImportError[] = [];
  const cleaned: any = {
    _importedAt: new Date().toISOString(),
    _source: 'dromo',
    _rowIndex: rowIndex
  };

  // تنظيف أساسي للحقول
  for (const [key, value] of Object.entries(row)) {
    if (key.startsWith('_')) continue; // تجاهل الحقول الداخلية

    let cleanedValue = value;

    // تنظيف السلاسل النصية
    if (typeof value === 'string') {
      cleanedValue = value.trim();
      if (cleanedValue === '') {
        cleanedValue = null;
      }
    }

    // تحويل التواريخ
    if (key.includes('date') || key.includes('Date')) {
      if (cleanedValue && (typeof cleanedValue === 'string' || typeof cleanedValue === 'number')) {
        try {
          const dateValue = new Date(cleanedValue as string | number);
          if (isNaN(dateValue.getTime())) {
            errors.push({
              rowIndex,
              field: key,
              message: 'تاريخ غير صحيح',
              value
            });
            cleanedValue = null;
          } else {
            cleanedValue = dateValue.toISOString();
          }
        } catch (error) {
          errors.push({
            rowIndex,
            field: key,
            message: 'تاريخ غير صحيح',
            value
          });
          cleanedValue = null;
        }
      }
    }

    // تحويل الأرقام
    if (key.includes('count') || key.includes('Count') || key.includes('cases') || key.includes('Cases') || key.includes('volume') || key.includes('Volume')) {
      if (cleanedValue !== null && cleanedValue !== '') {
        const numValue = Number(cleanedValue);
        if (isNaN(numValue)) {
          errors.push({
            rowIndex,
            field: key,
            message: 'قيمة رقمية غير صحيحة',
            value
          });
        } else {
          cleanedValue = numValue;
        }
      }
    }

    cleaned[key] = cleanedValue;
  }

  // تحقق خاص بكل جدول
  switch (tableType) {
    case 'laboratory':
      if (!cleaned.sampleCode) {
        errors.push({
          rowIndex,
          field: 'sampleCode',
          message: 'رمز العينة مطلوب',
          value: cleaned.sampleCode
        });
      }
      break;

    case 'vaccination':
      if (!cleaned.vaccinationType) {
        errors.push({
          rowIndex,
          field: 'vaccinationType',
          message: 'نوع التطعيم مطلوب',
          value: cleaned.vaccinationType
        });
      }
      break;

    case 'parasite_control':
      if (!cleaned.insecticideType) {
        errors.push({
          rowIndex,
          field: 'insecticideType',
          message: 'نوع المبيد مطلوب',
          value: cleaned.insecticideType
        });
      }
      break;

    case 'mobile':
      if (!cleaned.diagnosis) {
        errors.push({
          rowIndex,
          field: 'diagnosis',
          message: 'التشخيص مطلوب',
          value: cleaned.diagnosis
        });
      }
      break;

    case 'equine_health':
      if (!cleaned.surgeryType) {
        errors.push({
          rowIndex,
          field: 'surgeryType',
          message: 'نوع العملية مطلوب',
          value: cleaned.surgeryType
        });
      }
      break;
  }

  return { cleaned, errors };
}

export async function POST(request: NextRequest) {
  try {
    const body: ImportRequest = await request.json();
    const { tableType, rows, dromoBackendKey } = body;

    // التحقق من صحة المدخلات
    if (!tableType || !ALLOWED_TABLES.includes(tableType)) {
      return NextResponse.json(
        { success: false, message: 'نوع الجدول غير صحيح' },
        { status: 400 }
      );
    }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'لا توجد بيانات للاستيراد' },
        { status: 400 }
      );
    }

    if (rows.length > MAX_ROWS) {
      return NextResponse.json(
        { success: false, message: `عدد الصفوف يتجاوز الحد المسموح (${MAX_ROWS})` },
        { status: 400 }
      );
    }

    // التحقق الأمني - استخدام المفتاح من متغيرات البيئة مباشرة
    const expectedBackendKey = process.env.DROMO_BACKEND_KEY;
    if (expectedBackendKey) {
      if (!dromoBackendKey || dromoBackendKey !== expectedBackendKey) {
        console.log('Security check failed:', { 
          hasKey: !!dromoBackendKey, 
          expectedLength: expectedBackendKey.length,
          receivedLength: dromoBackendKey?.length 
        });
        return NextResponse.json(
          { success: false, message: 'غير مصرح بالوصول' },
          { status: 401 }
        );
      }
    }

    // تنظيف وتحقق من البيانات
    const cleanedRows: any[] = [];
    const allErrors: ImportError[] = [];

    for (let i = 0; i < rows.length; i++) {
      const { cleaned, errors } = cleanAndValidateRow(rows[i], i + 1, tableType);
      
      if (errors.length === 0) {
        cleanedRows.push(cleaned);
      } else {
        allErrors.push(...errors);
      }
    }

    // إرسال البيانات إلى الـ backend
    let insertedCount = 0;
    let batchId: string | null = null;

    if (cleanedRows.length > 0) {
      // إرسال البيانات إلى الـ backend عبر Dromo endpoint
      const backendUrl = getBackendUrl();
      const endpoint = `${backendUrl}/import-export/dromo-import`;
      
      console.log('Sending to Dromo backend:', { endpoint, tableType, rowCount: cleanedRows.length });
      
      const backendResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.BACKEND_API_TOKEN || 'development-token'}`
        },
        body: JSON.stringify({
          tableType: tableType,
          rows: cleanedRows,
          dromoBackendKey: expectedBackendKey,
          batchId: `dromo_batch_${Date.now()}`
        })
      });

      const response = await backendResponse.json();

      if (response.success) {
        insertedCount = response.insertedCount || cleanedRows.length;
        batchId = response.batchId;
      } else {
        console.error('Backend import error:', response.message);
        throw new Error(response.message || 'فشل في الاستيراد من الخادم');
      }
    }

    // إنشاء معرف دفعة مؤقت إذا لم يتم إنشاؤه
    if (!batchId) {
      batchId = `dromo_${tableType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // إرجاع النتيجة
    return NextResponse.json({
      success: true,
      insertedCount,
      errors: allErrors,
      batchId,
      totalRows: rows.length,
      successRate: rows.length > 0 ? Math.round((insertedCount / rows.length) * 100) : 0
    });

  } catch (error: any) {
    console.error('Import API error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'حدث خطأ أثناء الاستيراد' },
      { status: 500 }
    );
  }
}

// معلومات عن API
export async function GET() {
  return NextResponse.json({
    message: 'Import API',
    allowedTables: ALLOWED_TABLES,
    maxRows: MAX_ROWS
  });
}
