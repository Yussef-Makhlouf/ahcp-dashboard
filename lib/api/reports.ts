import { api } from './base-api';

export interface ReportParams {
  startDate: string;
  endDate: string;
  reportType: 'parasite-control' | 'vaccination' | 'mobile-clinics' | 'equine-health' | 'laboratories' | 'comprehensive';
  format: 'pdf' | 'excel' | 'csv';
  filters?: {
    supervisor?: string;
    village?: string;
    animalType?: string;
    status?: string;
  };
}

export interface DashboardStats {
  totalClients: number;
  totalAnimals: number;
  parasiteControlRecords: number;
  vaccinationRecords: number;
  mobileClinicVisits: number;
  laboratoryTests: number;
  equineHealthRecords: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    date: string;
    status: string;
  }>;
  monthlyStats: Array<{
    month: string;
    parasiteControl: number;
    vaccination: number;
    mobileClinic: number;
    laboratory: number;
  }>;
  animalDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

export const reportsApi = {
  // Generate report
  generateReport: async (params: ReportParams): Promise<Blob> => {
    const response = await api.post<Blob>('/reports/generate', params, {
      responseType: 'blob'
    });
    return response as Blob;
  },

  // Get dashboard statistics
  getDashboardStats: async (dateRange?: {
    startDate: string;
    endDate: string;
  }): Promise<DashboardStats> => {
    try {
      // جمع الإحصائيات من مختلف الـ APIs
      const [
        clientsStats,
        parasiteControlStats,
        vaccinationStats,
        mobileClinicsStats,
        laboratoriesStats
      ] = await Promise.allSettled([
        api.get('/clients/statistics'),
        api.get('/parasite-control/statistics'),
        api.get('/vaccination/statistics'),
        api.get('/mobile-clinics/statistics'),
        api.get('/laboratories/statistics')
      ]);

      // استخراج البيانات مع معالجة الأخطاء
      const getStatValue = (result: any, fallback: any = {}) => {
        if (result.status === 'fulfilled' && result.value?.data) {
          return result.value.data;
        }
        return fallback;
      };

      const clients = getStatValue(clientsStats, { totalClients: 0 });
      const parasiteControl = getStatValue(parasiteControlStats, { totalRecords: 0 });
      const vaccination = getStatValue(vaccinationStats, { totalRecords: 0 });
      const mobileClinics = getStatValue(mobileClinicsStats, { totalRecords: 0 });
      const laboratories = getStatValue(laboratoriesStats, { totalSamples: 0 });

      // بناء الإحصائيات المجمعة
      const dashboardStats: DashboardStats = {
        totalClients: clients.totalClients || 0,
        totalAnimals: clients.totalAnimals || 0,
        parasiteControlRecords: parasiteControl.totalRecords || 0,
        vaccinationRecords: vaccination.totalRecords || 0,
        mobileClinicVisits: mobileClinics.totalRecords || 0,
        laboratoryTests: laboratories.totalSamples || 0,
        equineHealthRecords: 0,
        recentActivity: [],
        monthlyStats: [],
        animalDistribution: []
      };

      return dashboardStats;
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      
      // إرجاع إحصائيات فارغة في حالة الخطأ
      return {
        totalClients: 0,
        totalAnimals: 0,
        parasiteControlRecords: 0,
        vaccinationRecords: 0,
        mobileClinicVisits: 0,
        laboratoryTests: 0,
        equineHealthRecords: 0,
        recentActivity: [],
        monthlyStats: [],
        animalDistribution: []
      };
    }
  },

  // Get activity summary
  getActivitySummary: async (period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<{
    period: string;
    totalActivities: number;
    activitiesByType: Record<string, number>;
    activitiesByDate: Array<{
      date: string;
      count: number;
      types: Record<string, number>;
    }>;
  }> => {
    return await api.get(`/reports/activity-summary?period=${period}`);
  },

  // Get performance metrics
  getPerformanceMetrics: async (dateRange?: {
    startDate: string;
    endDate: string;
  }): Promise<{
    totalRecords: number;
    recordsPerDay: number;
    supervisorPerformance: Array<{
      supervisor: string;
      recordsCount: number;
      efficiency: number;
    }>;
    villagesCovered: number;
    animalsTreated: number;
    complianceRate: number;
  }> => {
    const queryParams = new URLSearchParams();
    if (dateRange?.startDate) queryParams.append('startDate', dateRange.startDate);
    if (dateRange?.endDate) queryParams.append('endDate', dateRange.endDate);

    return await api.get(`/reports/performance-metrics?${queryParams.toString()}`);
  },

  // Export all data
  exportAllData: async (format: 'excel' | 'csv' = 'excel'): Promise<Blob> => {
    const response = await api.post<Blob>('/reports/export-all', { format }, {
      responseType: 'blob'
    });
    return response as Blob;
  },

  // Get available report templates
  getReportTemplates: async (): Promise<Array<{
    id: string;
    name: string;
    description: string;
    type: string;
    parameters: Array<{
      name: string;
      type: string;
      required: boolean;
      options?: string[];
    }>;
  }>> => {
    const response = await api.get<{ data: any[] }>('/reports/templates');
    return response.data;
  }
};

export default reportsApi;
