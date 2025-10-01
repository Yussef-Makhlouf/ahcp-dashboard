import { api } from './base-api';
import type { ParasiteControl, PaginatedResponse } from '@/types';
import { mockParasiteControlData } from '@/lib/mock/parasite-control-data';

// For development, we'll use mock data
const USE_MOCK = true;

export const parasiteControlApi = {
  // Get paginated list
  getList: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    filter?: Record<string, any>;
  }): Promise<PaginatedResponse<ParasiteControl>> => {
    if (USE_MOCK) {
      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const search = params?.search?.toLowerCase() || '';
      
      let filtered = [...mockParasiteControlData];
      
      // Apply search
      if (search) {
        filtered = filtered.filter(item =>
          item.owner.name.toLowerCase().includes(search) ||
          item.owner.id.toLowerCase().includes(search) ||
          item.owner.phone.includes(search) ||
          item.supervisor.toLowerCase().includes(search)
        );
      }
      
      // Apply filters
      if (params?.filter) {
        Object.entries(params.filter).forEach(([key, value]) => {
          if (value) {
            filtered = filtered.filter(item => {
              const keys = key.split('.');
              let current: any = item;
              for (const k of keys) {
                current = current?.[k];
              }
              return current === value;
            });
          }
        });
      }
      
      const start = (page - 1) * limit;
      const end = start + limit;
      
      return Promise.resolve({
        data: filtered.slice(start, end),
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      });
    }
    
    return api.get<PaginatedResponse<ParasiteControl>>('/parasite-control', {
      params,
    });
  },
  
  // Get single record
  getById: async (id: number): Promise<ParasiteControl> => {
    if (USE_MOCK) {
      const item = mockParasiteControlData.find(d => d.serialNo === id);
      if (!item) throw new Error('Record not found');
      return Promise.resolve(item);
    }
    
    return api.get<ParasiteControl>(`/parasite-control/${id}`);
  },
  
  // Create new record
  create: async (data: Omit<ParasiteControl, 'serialNo'>): Promise<ParasiteControl> => {
    if (USE_MOCK) {
      const newItem: ParasiteControl = {
        ...data,
        serialNo: Math.max(...mockParasiteControlData.map(d => d.serialNo)) + 1,
      };
      mockParasiteControlData.push(newItem);
      return Promise.resolve(newItem);
    }
    
    return api.post<ParasiteControl>('/parasite-control', data);
  },
  
  // Update record
  update: async (id: number, data: Partial<ParasiteControl>): Promise<ParasiteControl> => {
    if (USE_MOCK) {
      const index = mockParasiteControlData.findIndex(d => d.serialNo === id);
      if (index === -1) throw new Error('Record not found');
      
      mockParasiteControlData[index] = {
        ...mockParasiteControlData[index],
        ...data,
        serialNo: id,
      };
      
      return Promise.resolve(mockParasiteControlData[index]);
    }
    
    return api.put<ParasiteControl>(`/parasite-control/${id}`, data);
  },
  
  // Delete record
  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      const index = mockParasiteControlData.findIndex(d => d.serialNo === id);
      if (index === -1) throw new Error('Record not found');
      
      mockParasiteControlData.splice(index, 1);
      return Promise.resolve();
    }
    
    return api.delete(`/parasite-control/${id}`);
  },
  
  // Export to CSV
  exportToCsv: async (ids?: number[]): Promise<Blob> => {
    if (USE_MOCK) {
      const data = ids 
        ? mockParasiteControlData.filter(d => ids.includes(d.serialNo))
        : mockParasiteControlData;
      
      // Convert to CSV format
      const csv = convertToCSV(data);
      return Promise.resolve(new Blob([csv], { type: 'text/csv' }));
    }
    
    return api.post('/parasite-control/export/csv', { ids }, {
      responseType: 'blob',
    });
  },
};

// Helper function to convert data to CSV
function convertToCSV(data: ParasiteControl[]): string {
  if (!data.length) return '';
  
  const headers = [
    'الرقم المسلسل',
    'التاريخ',
    'اسم المربي',
    'رقم الهوية',
    'تاريخ الميلاد',
    'رقم الهاتف',
    'خط الطول',
    'خط العرض',
    'المشرف',
    'رقم المركبة',
    'إجمالي الأغنام',
    'إجمالي الماعز',
    'إجمالي الإبل',
    'إجمالي الأبقار',
    'نوع المبيد',
    'طريقة الرش',
    'كمية المبيد (مل)',
    'حالة الرش',
    'الحالة الصحية',
    'الامتثال',
    'حالة الطلب',
    'ملاحظات',
  ];
  
  const rows = data.map(item => [
    item.serialNo,
    item.date,
    item.owner.name,
    item.owner.id,
    item.owner.birthDate,
    item.owner.phone,
    item.location.e || '',
    item.location.n || '',
    item.supervisor,
    item.vehicleNo,
    item.herd.sheep.total,
    item.herd.goats.total,
    item.herd.camel.total,
    item.herd.cattle.total,
    item.insecticide.type,
    item.insecticide.method,
    item.insecticide.volume_ml,
    item.insecticide.status,
    item.herdHealthStatus,
    item.complying,
    item.request.situation,
    item.remarks,
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');
  
  // Add BOM for proper UTF-8 encoding in Excel
  return '\ufeff' + csvContent;
}
