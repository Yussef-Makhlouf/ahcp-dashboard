// Universal API response handler for consistent data structure handling

export interface APIResponse<T> {
  success: boolean;
  data: {
    records: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface PaginatedAPIResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function handleAPIResponse<T>(response: any, defaultLimit: number = 20): PaginatedAPIResponse<T> {
  // Handle multiple API response structures:
  // 1. Vaccination API: { success: true, data: { records: [...], pagination: {...} } }
  // 2. Other APIs: { success: true, data: [...], total: X, page: Y, ... }
  
  // Safety check: ensure response exists
  if (!response) {
    console.warn('⚠️ handleAPIResponse: response is null/undefined');
    return {
      data: [],
      total: 0,
      page: 1,
      limit: defaultLimit,
      totalPages: 0,
    };
  }
  
  // Check if response has nested structure with records in data.records (vaccination API)
  if (response.data?.records && Array.isArray(response.data.records)) {
    const records = response.data.records;
    const pagination = response.data.pagination || {};
    
    const total = pagination.total || 0;
    const limit = pagination.limit || defaultLimit;
    
    return {
      data: records,
      total: total,
      page: pagination.page || 1,
      limit: limit,
      totalPages: pagination.pages || Math.ceil(total / limit),
    };
  }
  
  // Handle structure where data is directly the records array and pagination is at root level
  if (Array.isArray(response.data)) {
    const total = response.total || 0;
    const limit = response.limit || defaultLimit;
    
    return {
      data: response.data,
      total: total,
      page: response.page || 1,
      limit: limit,
      totalPages: response.totalPages || Math.ceil(total / limit),
    };
  }
  
  // Fallback: try to extract data from various possible structures
  const records = response.data?.records || response.records || response.data || [];
  const pagination = response.data?.pagination || response.pagination || {};
  
  const total = response.total || pagination.total || 0;
  const limit = response.limit || pagination.limit || defaultLimit;
  
  return {
    data: Array.isArray(records) ? records : [],
    total: total,
    page: response.page || pagination.page || 1,
    limit: limit,
    totalPages: response.totalPages || pagination.pages || Math.ceil(total / limit),
  };
}

export function handleStatisticsResponse(response: any): any {
  // Statistics APIs return { success: true, data: { ... } }
  // Safety check: ensure response exists
  if (!response) {
    console.warn('⚠️ handleStatisticsResponse: response is null/undefined');
    return {};
  }
  
  return response.data || {};
}
