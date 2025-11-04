// ملف اختبار التكامل الشامل
import { clientsApi } from './api/clients';
import { parasiteControlApi } from './api/parasite-control';
import { vaccinationApi } from './api/vaccination';
import { mobileClinicsApi } from './api/mobile-clinics';
import { laboratoriesApi } from './api/laboratories';
import { reportsApi } from './api/reports';
import { authApi } from './api/auth';

interface TestResult {
  module: string;
  endpoint: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  responseTime?: number;
}

class IntegrationTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<TestResult[]> {
    console.log('🚀 بدء اختبار التكامل الشامل...');
    
    // اختبار المصادقة
    await this.testAuthentication();
    
    // اختبار العملاء
    await this.testClients();
    
    // اختبار مكافحة الطفيليات
    await this.testParasiteControl();
    
    // اختبار التحصينات
    await this.testVaccination();
    
    // اختبار العيادات المتنقلة
    await this.testMobileClinics();
    
    // اختبار المختبرات
    await this.testLaboratories();
    
    // اختبار التقارير
    await this.testReports();
    
    return this.results;
  }

  private async testEndpoint(
    module: string,
    endpoint: string,
    testFn: () => Promise<any>
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      await testFn();
      const responseTime = Date.now() - startTime;
      
      this.results.push({
        module,
        endpoint,
        status: 'success',
        message: 'تم الاختبار بنجاح',
        responseTime
      });
      
      console.log(`✅ ${module} - ${endpoint}: نجح (${responseTime}ms)`);
    } catch (error: any) {
      this.results.push({
        module,
        endpoint,
        status: 'error',
        message: error.message || 'خطأ غير معروف'
      });
      
      console.log(`❌ ${module} - ${endpoint}: فشل - ${error.message}`);
    }
  }

  private async testAuthentication(): Promise<void> {
    console.log('\n🔐 اختبار المصادقة...');
    
    // اختبار تسجيل الدخول
    await this.testEndpoint('المصادقة', 'تسجيل الدخول', async () => {
      const response = await authApi.login({
        email: 'test@example.com',
        password: 'test123'
      });
      
      if (!response.success) {
        throw new Error('فشل في تسجيل الدخول');
      }
    });

    // اختبار الحصول على الملف الشخصي
    await this.testEndpoint('المصادقة', 'الملف الشخصي', async () => {
      await authApi.getProfile();
    });
  }

  private async testClients(): Promise<void> {
    console.log('\n👥 اختبار العملاء...');
    
    // اختبار جلب قائمة العملاء
    await this.testEndpoint('العملاء', 'قائمة العملاء', async () => {
      const response = await clientsApi.getList();
      if (!response.data) {
        throw new Error('لا توجد بيانات في الاستجابة');
      }
    });

    // اختبار البحث
    await this.testEndpoint('العملاء', 'البحث', async () => {
      await clientsApi.search('أحمد');
    });

    // اختبار الإحصائيات
    await this.testEndpoint('العملاء', 'الإحصائيات', async () => {
      await clientsApi.getStatistics();
    });
  }

  private async testParasiteControl(): Promise<void> {
    console.log('\n🐛 اختبار مكافحة الطفيليات...');
    
    // اختبار جلب السجلات
    await this.testEndpoint('مكافحة الطفيليات', 'قائمة السجلات', async () => {
      const response = await parasiteControlApi.getList();
      if (!response.data) {
        throw new Error('لا توجد بيانات في الاستجابة');
      }
    });

    // اختبار الفلترة
    await this.testEndpoint('مكافحة الطفيليات', 'الفلترة', async () => {
      await parasiteControlApi.getList({ filter: { health_status: 'Healthy' } });
    });

    // اختبار الإحصائيات
    await this.testEndpoint('مكافحة الطفيليات', 'الإحصائيات', async () => {
      await parasiteControlApi.getList({ filter: { health_status: 'Healthy' } });
    });
  }

  private async testVaccination(): Promise<void> {
    console.log('\n💉 اختبار التحصينات...');
    
    // اختبار جلب السجلات
    await this.testEndpoint('التحصينات', 'قائمة السجلات', async () => {
      const response = await vaccinationApi.getList();
      if (!response.data) {
        throw new Error('لا توجد بيانات في الاستجابة');
      }
    });

    // اختبار الإحصائيات
    await this.testEndpoint('التحصينات', 'الإحصائيات', async () => {
      await vaccinationApi.getList();
    });
  }

  private async testMobileClinics(): Promise<void> {
    console.log('\n🚛 اختبار العيادات المتنقلة...');
    
    // اختبار جلب السجلات
    await this.testEndpoint('العيادات المتنقلة', 'قائمة السجلات', async () => {
      const response = await mobileClinicsApi.getList();
      if (!response.data) {
        throw new Error('لا توجد بيانات في الاستجابة');
      }
    });

    // اختبار الإحصائيات
    await this.testEndpoint('العيادات المتنقلة', 'الإحصائيات', async () => {
      await mobileClinicsApi.getStatistics();
    });
  }

  private async testLaboratories(): Promise<void> {
    console.log('\n🧪 اختبار المختبرات...');
    
    // اختبار جلب السجلات
    await this.testEndpoint('المختبرات', 'قائمة السجلات', async () => {
      const response = await laboratoriesApi.getList();
      if (!response.data) {
        throw new Error('لا توجد بيانات في الاستجابة');
      }
    });

    // اختبار أنواع العينات
    await this.testEndpoint('المختبرات', 'أنواع العينات', async () => {
      await laboratoriesApi.getSampleTypes();
    });

    // اختبار الإحصائيات
    await this.testEndpoint('المختبرات', 'الإحصائيات', async () => {
      await laboratoriesApi.getStatistics();
    });
  }

  private async testReports(): Promise<void> {
    console.log('\n📊 اختبار التقارير...');
    
    // اختبار إحصائيات اللوحة
    await this.testEndpoint('التقارير', 'إحصائيات اللوحة', async () => {
      await reportsApi.getDashboardStats();
    });

    // اختبار ملخص النشاط
    await this.testEndpoint('التقارير', 'ملخص النشاط', async () => {
      await reportsApi.getActivitySummary('month');
    });

    // اختبار مقاييس الأداء
    await this.testEndpoint('التقارير', 'مقاييس الأداء', async () => {
      await reportsApi.getPerformanceMetrics();
    });

    // اختبار قوالب التقارير
    await this.testEndpoint('التقارير', 'قوالب التقارير', async () => {
      await reportsApi.getReportTemplates();
    });
  }

  generateReport(): string {
    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.status === 'success').length;
    const failedTests = this.results.filter(r => r.status === 'error').length;
    const warningTests = this.results.filter(r => r.status === 'warning').length;
    
    const averageResponseTime = this.results
      .filter(r => r.responseTime)
      .reduce((sum, r) => sum + (r.responseTime || 0), 0) / 
      this.results.filter(r => r.responseTime).length;

    let report = `
========================================
       تقرير اختبار التكامل الشامل
========================================

📊 ملخص النتائج:
- إجمالي الاختبارات: ${totalTests}
- نجح: ${successfulTests} (${Math.round((successfulTests/totalTests)*100)}%)
- فشل: ${failedTests} (${Math.round((failedTests/totalTests)*100)}%)
- تحذيرات: ${warningTests} (${Math.round((warningTests/totalTests)*100)}%)

⏱️ متوسط وقت الاستجابة: ${Math.round(averageResponseTime)}ms

📋 تفاصيل الاختبارات:
`;

    this.results.forEach(result => {
      const icon = result.status === 'success' ? '✅' : 
                   result.status === 'error' ? '❌' : '⚠️';
      const time = result.responseTime ? ` (${result.responseTime}ms)` : '';
      
      report += `${icon} ${result.module} - ${result.endpoint}: ${result.message}${time}\n`;
    });

    report += `
========================================
`;

    return report;
  }
}

// دالة لتشغيل الاختبارات
export async function runIntegrationTests(): Promise<void> {
  const tester = new IntegrationTester();
  
  try {
    const results = await tester.runAllTests();
    const report = tester.generateReport();
    
    console.log(report);
    
    // حفظ التقرير في ملف
    if (typeof window === 'undefined') {
      // في بيئة Node.js
      const fs = require('fs');
      const path = require('path');
      
      const reportPath = path.join(process.cwd(), 'integration-test-report.txt');
      fs.writeFileSync(reportPath, report, 'utf8');
      console.log(`📄 تم حفظ التقرير في: ${reportPath}`);
    }
    
    return results;
  } catch (error) {
    console.error('❌ فشل في تشغيل اختبارات التكامل:', error);
    throw error;
  }
}

// دالة لاختبار اتصال سريع
export async function quickHealthCheck(): Promise<boolean> {
  try {
    // اختبار الاتصال بالخادم
    const response = await fetch('http://https://ahcp-backend.vercel.app/health');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ الخادم يعمل بشكل طبيعي:', data);
      return true;
    } else {
      console.log('⚠️ الخادم يستجيب ولكن هناك مشكلة:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ لا يمكن الاتصال بالخادم:', error);
    return false;
  }
}

export default IntegrationTester;
