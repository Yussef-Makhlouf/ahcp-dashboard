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
  
  // Check if response has nested structure with records in data.records (vaccination API)
  if (response.data?.records && Array.isArray(response.data.records)) {
    const records = response.data.records;
    const pagination = response.data.pagination || {};
    
    return {
      data: records,
      total: pagination.total || 0,
      page: pagination.page || 1,
      limit: pagination.limit || defaultLimit,
      totalPages: pagination.pages || Math.ceil((pagination.total || 0) / (pagination.limit || defaultLimit)),
    };
  }
  
  // Handle structure where data is directly the records array and pagination is at root level
  if (Array.isArray(response.data)) {
    return {
      data: response.data,
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || defaultLimit,
      totalPages: response.totalPages || Math.ceil((response.total || 0) / (response.limit || defaultLimit)),
    };
  }
  
  // Fallback: try to extract data from various possible structures
  const records = response.data?.records || response.records || response.data || [];
  const pagination = response.data?.pagination || response.pagination || {};
  
  return {
    data: Array.isArray(records) ? records : [],
    total: response.total || pagination.total || 0,
    page: response.page || pagination.page || 1,
    limit: response.limit || pagination.limit || defaultLimit,
    totalPages: response.totalPages || pagination.pages || Math.ceil((response.total || pagination.total || 0) / (response.limit || pagination.limit || defaultLimit)),
  };
}

export function handleStatisticsResponse(response: any): any {
  // Statistics APIs return { success: true, data: { ... } }
  return response.data || {};
}
