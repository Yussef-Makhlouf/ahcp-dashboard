// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ulaahcprp.cloud/api';

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    // Import/Export endpoints
    clients: {
      export: `${API_BASE_URL}/import-export/clients/export`,
      import: `${API_BASE_URL}/import-export/clients/import`,
      template: `${API_BASE_URL}/import-export/clients/template`
    },
    vaccination: {
      export: `${API_BASE_URL}/import-export/vaccination/export`,
      import: `${API_BASE_URL}/import-export/vaccination/import`,
      template: `${API_BASE_URL}/import-export/vaccination/template`
    },
    parasiteControl: {
      export: `${API_BASE_URL}/import-export/parasite-control/export`,
      import: `${API_BASE_URL}/import-export/parasite-control/import`,
      template: `${API_BASE_URL}/import-export/parasite-control/template`
    },
    mobileClinics: {
      export: `${API_BASE_URL}/import-export/mobile-clinics/export`,
      import: `${API_BASE_URL}/import-export/mobile-clinics/import`,
      template: `${API_BASE_URL}/import-export/mobile-clinics/template`
    },
    laboratories: {
      export: `${API_BASE_URL}/import-export/laboratories/export`,
      import: `${API_BASE_URL}/import-export/laboratories/import`,
      template: `${API_BASE_URL}/import-export/laboratories/template`
    },
    inventory: {
      export: `${API_BASE_URL}/import-export/inventory/export`,
      import: `${API_BASE_URL}/import-export/inventory/import`,
      template: `${API_BASE_URL}/import-export/inventory/template`
    },
    equineHealth: {
      export: `${API_BASE_URL}/import-export/equine-health/export`,
      import: `${API_BASE_URL}/import-export/equine-health/import-enhanced`,
      template: `${API_BASE_URL}/import-export/equine-health/template`
    }
  }
};

export default apiConfig;
