// Export all API services
export { default as authApi } from './auth';
export { default as clientsApi } from './clients';
export { parasiteControlApi } from './parasite-control';
export { vaccinationApi } from './vaccination';
export { default as mobileClinicsApi } from './mobile-clinics';
export { equineHealthApi } from './equine-health';
export { default as laboratoriesApi } from './laboratories';
export { default as reportsApi } from './reports';
export { holdingCodesApi } from './holding-codes';
export { api, default as apiClient } from './base-api';

// Export types
export type { LoginRequest, LoginResponse, RegisterRequest } from './auth';
export type { DashboardStats, ReportParams } from './reports';
export type { 
  HoldingCode, 
  HoldingCodeCreateRequest, 
  HoldingCodeUpdateRequest, 
  HoldingCodeListParams,
  HoldingCodeListResponse,
  HoldingCodeResponse 
} from './holding-codes';

// Re-export common types from types/index
export type { 
  User, 
  Client, 
  ParasiteControl, 
  Vaccination, 
  MobileClinic, 
  EquineHealth, 
  Laboratory,
  PaginatedResponse,
  ApiResponse 
} from '@/types';
