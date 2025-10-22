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
  overview: {
    totalClients: number;
    activeClients: number;
    totalAnimals: number;
    totalRecords: number;
  };
  vaccination: {
    totalRecords: number;
    totalAnimals: number;
    totalVaccinated: number;
    healthyHerds: number;
    sickHerds: number;
    servedOwners: number;
    visitedVillages: number;
    visitedHerds: number;
    vaccinatedAnimals: number;
    uniqueHerds: number;
  };
  parasiteControl: {
    totalRecords: number;
    totalAnimals: number;
    totalTreated: number;
    healthyHerds: number;
    sickHerds: number;
    servedOwners: number;
    visitedVillages: number;
    visitedHerds: number;
    treatedAnimals: number;
    uniqueHerds: number;
  };
  mobileClinic: {
    totalRecords: number;
    totalAnimals: number;
    emergencyInterventions: number;
    routineInterventions: number;
    preventiveInterventions: number;
    followUpRequired: number;
    servedOwners: number;
    visitedVillages: number;
    visitedHerds: number;
    treatedAnimals: number;
    uniqueHerds: number;
  };
  laboratory: {
    totalRecords: number;
    totalSamples: number;
    totalPositive: number;
    totalNegative: number;
    pendingTests: number;
    inProgressTests: number;
    completedTests: number;
    failedTests: number;
    servedOwners: number;
    visitedVillages: number;
    sampledHerds: number;
    testedAnimals: number;
    uniqueHerds: number;
  };
  equineHealth: {
    totalRecords: number;
    totalAnimals: number;
    healthyHerds: number;
    sickHerds: number;
  };
  clients: {
    totalClients: number;
    activeClients: number;
    totalAnimals: number;
  };
  comparativeStats: {
    servedHerds: {
      vaccinated: number;
      treated: number;
      sprayed: number;
    };
    servedAnimals: {
      vaccination: number;
      treatment: number;
      parasiteControl: number;
    };
  };
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
      const params = new URLSearchParams();
      if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange?.endDate) params.append('endDate', dateRange.endDate);

      const response = await api.get(`/reports/dashboard?${params.toString()}`);
      
      // Return the comprehensive dashboard data directly from the API
      return response.data;
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      
      // Return empty stats structure in case of error
      return {
        overview: {
          totalClients: 0,
          activeClients: 0,
          totalAnimals: 0,
          totalRecords: 0
        },
        vaccination: {
          totalRecords: 0,
          totalAnimals: 0,
          totalVaccinated: 0,
          healthyHerds: 0,
          sickHerds: 0,
          servedOwners: 0,
          visitedVillages: 0,
          visitedHerds: 0,
          vaccinatedAnimals: 0,
          uniqueHerds: 0
        },
        parasiteControl: {
          totalRecords: 0,
          totalAnimals: 0,
          totalTreated: 0,
          healthyHerds: 0,
          sickHerds: 0,
          servedOwners: 0,
          visitedVillages: 0,
          visitedHerds: 0,
          treatedAnimals: 0,
          uniqueHerds: 0
        },
        mobileClinic: {
          totalRecords: 0,
          totalAnimals: 0,
          emergencyInterventions: 0,
          routineInterventions: 0,
          preventiveInterventions: 0,
          followUpRequired: 0,
          servedOwners: 0,
          visitedVillages: 0,
          visitedHerds: 0,
          treatedAnimals: 0,
          uniqueHerds: 0
        },
        laboratory: {
          totalRecords: 0,
          totalSamples: 0,
          totalPositive: 0,
          totalNegative: 0,
          pendingTests: 0,
          inProgressTests: 0,
          completedTests: 0,
          failedTests: 0,
          servedOwners: 0,
          visitedVillages: 0,
          sampledHerds: 0,
          testedAnimals: 0,
          uniqueHerds: 0
        },
        equineHealth: {
          totalRecords: 0,
          totalAnimals: 0,
          healthyHerds: 0,
          sickHerds: 0
        },
        clients: {
          totalClients: 0,
          activeClients: 0,
          totalAnimals: 0
        },
        comparativeStats: {
          servedHerds: {
            vaccinated: 0,
            treated: 0,
            sprayed: 0
          },
          servedAnimals: {
            vaccination: 0,
            treatment: 0,
            parasiteControl: 0
          }
        },
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
