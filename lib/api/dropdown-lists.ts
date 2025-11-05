import apiClient from "./base-api";


export interface DropdownOption {
  _id?: string;
  category: string;
  value: string;
  label: string;
  labelAr: string;
  isActive?: boolean;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
  usage?: {
    used: boolean;
    model: string | null;
    count: number;
  };
}

export interface CategoryInfo {
  category: string;
  label: string;
  labelAr: string;
  total: number;
}

export interface DropdownListsResponse {
  success: boolean;
  data: DropdownOption[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CategoriesResponse {
  success: boolean;
  data: CategoryInfo[];
}

export interface DropdownOptionResponse {
  success: boolean;
  data: DropdownOption;
}

export interface CreateDropdownOptionRequest {
  category: string;
  value: string;
  label: string;
  labelAr: string;
  isActive?: boolean;
}

export interface UpdateDropdownOptionRequest extends Partial<CreateDropdownOptionRequest> {}

export interface BulkCreateRequest {
  category: string;
  options: Array<{
    value: string;
    label: string;
    labelAr: string;
  }>;
}

export interface DropdownListsFilters {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

class DropdownListsAPI {
  private basePath = '/dropdown-lists';

  /**
   * Get all dropdown list options with optional filters
   */
  async getAll(filters: DropdownListsFilters = {}): Promise<DropdownListsResponse> {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;
    
    const response = await apiClient.get<DropdownListsResponse>(url);
    return response.data;
  }

  /**
   * Get all available categories with statistics
   */
  async getCategories(): Promise<CategoriesResponse> {
    const response = await apiClient.get<CategoriesResponse>(`${this.basePath}/categories`);
    return response.data;
  }

  /**
   * Get options by category
   */
  async getByCategory(category: string, activeOnly: boolean = true): Promise<DropdownListsResponse> {
    const params = activeOnly ? '' : '?includeInactive=true';
    const response = await apiClient.get<DropdownListsResponse>(`${this.basePath}/by-category/${category}${params}`);
    return response.data;
  }

  /**
   * Get dropdown option by ID
   */
  async getById(id: string): Promise<DropdownOptionResponse> {
    const response = await apiClient.get<DropdownOptionResponse>(`${this.basePath}/${id}`);
    return response.data;
  }

  /**
   * Create new dropdown option
   */
  async create(data: CreateDropdownOptionRequest): Promise<DropdownOptionResponse> {
    const response = await apiClient.post<DropdownOptionResponse>(this.basePath, data);
    return response.data;
  }

  /**
   * Update dropdown option
   */
  async update(id: string, data: UpdateDropdownOptionRequest): Promise<DropdownOptionResponse> {
    const response = await apiClient.put<DropdownOptionResponse>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  /**
   * Delete dropdown option
   */
  async delete(id: string, force: boolean = false): Promise<{ success: boolean; message: string; usage?: any }> {
    const params = force ? '?force=true' : '';
    const response = await apiClient.delete(`${this.basePath}/${id}${params}`);
    return response.data;
  }

  /**
   * Bulk create dropdown options
   */
  async bulkCreate(data: BulkCreateRequest): Promise<DropdownListsResponse> {
    const response = await apiClient.post<DropdownListsResponse>(`${this.basePath}/bulk-create`, data);
    return response.data;
  }

  /**
   * Get options for a specific category formatted for Select components
   */
  async getOptionsForSelect(category: string): Promise<Array<{ value: string; label: string; labelAr: string }>> {
    const response = await this.getByCategory(category);
    return response.data.map(option => ({
      value: option.value,
      label: option.label,
      labelAr: option.labelAr
    }));
  }



  /**
   * Search dropdown options across all categories
   */
  async search(query: string, filters: Omit<DropdownListsFilters, 'search'> = {}): Promise<DropdownListsResponse> {
    return this.getAll({ ...filters, search: query });
  }

  /**
   * Get category statistics
   */
  async getCategoryStats(category: string): Promise<{ total: number }> {
    const response = await this.getByCategory(category);
    const options = response.data;
    
    return {
      total: options.length
    };
  }

  /**
   * Export dropdown options for a category
   */
  async exportCategory(category: string): Promise<DropdownOption[]> {
    const response = await this.getByCategory(category);
    return response.data;
  }

  /**
   * Import dropdown options from data
   */
  async importCategory(category: string, options: Array<Omit<CreateDropdownOptionRequest, 'category'>>): Promise<DropdownListsResponse> {
    const optionsWithCategory = options.map(option => ({ ...option, category }));
    return this.bulkCreate({ category, options: optionsWithCategory });
  }
}

// Export singleton instance
export const dropdownListsApi = new DropdownListsAPI();

// Export category constants
export const DROPDOWN_CATEGORIES = {
  // Vaccination categories
  VACCINE_TYPES: 'vaccine_types',
  HERD_HEALTH: 'herd_health',
  ANIMALS_HANDLING: 'animals_handling',
  LABOURS: 'labours',
  REACHABLE_LOCATION: 'reachable_location',
  REQUEST_SITUATION: 'request_situation',
  
  // Parasite Control categories
  INSECTICIDE_TYPES: 'insecticide_types',
  SPRAY_METHODS: 'spray_methods',
  INSECTICIDE_CATEGORIES: 'insecticide_categories',
  SPRAY_STATUS: 'spray_status',
  HERD_HEALTH_STATUS: 'herd_health_status',
  COMPLIANCE_STATUS: 'compliance',
  BREEDING_SITES_STATUS: 'breeding_sites',
  
  // Mobile Clinics categories
  DIAGNOSIS: 'diagnosis',
  MEDICATIONS: 'medications',
  INTERVENTION_CATEGORIES: 'intervention_categories',
  
  // Equine Health categories
  HORSE_GENDER: 'horse_gender',
  HEALTH_STATUS: 'health_status',
  ADMINISTRATION_ROUTES: 'administration_routes',
  
  // Laboratory categories
  SAMPLE_TYPES: 'sample_types',
  TEST_TYPES: 'test_types',
  ANIMAL_TYPES: 'animal_types',
  
  // Scheduling categories
  PRIORITY_LEVELS: 'priority_levels',
  TASK_STATUS: 'task_status',
  REMINDER_TIMES: 'reminder_times',
  RECURRING_TYPES: 'recurring_types',
  
  // Reports categories
  TIME_PERIODS: 'time_periods',
  
  // User Management categories
  USER_ROLES: 'user_roles'
} as const;

// Export category labels
export const CATEGORY_LABELS = {
  [DROPDOWN_CATEGORIES.VACCINE_TYPES]: { en: 'Vaccine Types', ar: 'أنواع المصل' },
  [DROPDOWN_CATEGORIES.HERD_HEALTH]: { en: 'Herd Health', ar: 'حالة القطيع' },
  [DROPDOWN_CATEGORIES.ANIMALS_HANDLING]: { en: 'Animals Handling', ar: 'معاملة الحيوانات' },
  [DROPDOWN_CATEGORIES.LABOURS]: { en: 'Labour Status', ar: 'حالة العمال' },
  [DROPDOWN_CATEGORIES.REACHABLE_LOCATION]: { en: 'Location Accessibility', ar: 'سهولة الوصول للموقع' },
  [DROPDOWN_CATEGORIES.REQUEST_SITUATION]: { en: 'Request Situation', ar: 'حالة الطلب' },
  [DROPDOWN_CATEGORIES.INSECTICIDE_TYPES]: { en: 'Insecticide Types', ar: 'أنواع المبيدات' },
  [DROPDOWN_CATEGORIES.SPRAY_METHODS]: { en: 'Spray Methods', ar: 'طرق الرش' },
  [DROPDOWN_CATEGORIES.INSECTICIDE_CATEGORIES]: { en: 'Insecticide Categories', ar: 'فئات المبيد' },
  [DROPDOWN_CATEGORIES.SPRAY_STATUS]: { en: 'Spray Status', ar: 'حالة الرش' },
  [DROPDOWN_CATEGORIES.HERD_HEALTH_STATUS]: { en: 'Herd Health Status', ar: 'حالة القطيع الصحية' },
  [DROPDOWN_CATEGORIES.COMPLIANCE_STATUS]: { en: 'Compliance Status', ar: 'الامتثال للتعليمات' },
  [DROPDOWN_CATEGORIES.BREEDING_SITES_STATUS]: { en: 'Breeding Sites Status', ar: 'حالة مواقع التكاثر' },
  [DROPDOWN_CATEGORIES.DIAGNOSIS]: { en: 'Diagnosis', ar: 'التشخيص' },
  [DROPDOWN_CATEGORIES.MEDICATIONS]: { en: 'Medications', ar: 'الأدوية' },
  [DROPDOWN_CATEGORIES.INTERVENTION_CATEGORIES]: { en: 'Intervention Categories', ar: 'فئات التدخل' },
  [DROPDOWN_CATEGORIES.HORSE_GENDER]: { en: 'Horse Gender', ar: 'جنس الخيل' },
  [DROPDOWN_CATEGORIES.HEALTH_STATUS]: { en: 'Health Status', ar: 'حالة الصحة' },
  [DROPDOWN_CATEGORIES.ADMINISTRATION_ROUTES]: { en: 'Administration Routes', ar: 'طرق إعطاء الدواء' },
  [DROPDOWN_CATEGORIES.SAMPLE_TYPES]: { en: 'Sample Types', ar: 'أنواع العينات' },
  [DROPDOWN_CATEGORIES.TEST_TYPES]: { en: 'Test Types', ar: 'أنواع الفحوصات' },
  [DROPDOWN_CATEGORIES.ANIMAL_TYPES]: { en: 'Animal Types', ar: 'أنواع الحيوانات' },
  [DROPDOWN_CATEGORIES.PRIORITY_LEVELS]: { en: 'Priority Levels', ar: 'مستويات الأولوية' },
  [DROPDOWN_CATEGORIES.TASK_STATUS]: { en: 'Task Status', ar: 'حالة المهمة' },
  [DROPDOWN_CATEGORIES.REMINDER_TIMES]: { en: 'Reminder Times', ar: 'أوقات التذكير' },
  [DROPDOWN_CATEGORIES.RECURRING_TYPES]: { en: 'Recurring Types', ar: 'أنواع التكرار' },
  [DROPDOWN_CATEGORIES.TIME_PERIODS]: { en: 'Time Periods', ar: 'الفترات الزمنية' },
  [DROPDOWN_CATEGORIES.USER_ROLES]: { en: 'User Roles', ar: 'أدوار المستخدمين' }
} as const;
