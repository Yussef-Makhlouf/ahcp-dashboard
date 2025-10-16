// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Owner/Client Types
export interface Owner {
  name: string;
  id: string;
  birthDate: string;
  phone: string;
}

// Client Types with backend structure
export interface Client {
  _id?: string; // MongoDB ID
  id?: string; // Alternative ID field for compatibility
  name: string;
  nationalId: string; // Backend primary field
  birthDate?: string; // Backend primary field
  phone: string;
  email?: string;
  village?: string;
  detailedAddress?: string;
  status: "نشط" | "غير نشط";
  animals: Animal[];
  availableServices: string[]; // Backend primary field
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
  // Virtual fields from backend
  totalAnimals?: number;
  healthyAnimalsCount?: number;
  animalsByType?: Record<string, number>;
  // Aggregated fields from all forms
  servicesReceived?: string[];
  birthDateFromForms?: string;
  totalVisits?: number;
  lastServiceDate?: string;
  mobileClinicCount?: number;
  vaccinationCount?: number;
  equineHealthCount?: number;
  laboratoryCount?: number;
  parasiteControlCount?: number;
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
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
  // Legacy fields for compatibility
  national_id?: string;
  birth_date?: string;
  detailed_address?: string;
  available_services?: string[];
}

export interface Animal {
  animalType: string; // Backend primary field
  breed: string;
  age: number;
  gender: "ذكر" | "أنثى";
  healthStatus: "سليم" | "مريض" | "تحت العلاج"; // Backend primary field
  identificationNumber?: string; // Backend primary field
  animalCount: number; // Backend primary field
  // Legacy fields for compatibility
  animal_type?: string;
  health_status?: string;
  identification_number?: string;
  animal_count?: number;
}

// Location Types
export interface Location {
  e: number | null;
  n: number | null;
}

// Animal Count Types
export interface AnimalCount {
  total: number;
  young: number;
  female: number;
  treated?: number;
  vaccinated?: number;
}

// Herd Types
export interface Herd {
  sheep: AnimalCount;
  goats: AnimalCount;
  camel: AnimalCount;
  cattle: AnimalCount;
  horse?: AnimalCount;
}

// Request Types
export interface Request {
  date: string;
  situation: "Open" | "Closed" | "Pending";
  fulfillingDate?: string;
}

// Parasite Control Types
export interface Insecticide {
  type: string;
  method: string;
  volume_ml: number;
  status: "Sprayed" | "Not Sprayed";
  category: string; // Pour-on / Spray etc
}

export interface Barn {
  size: number; // Animal_Barn_Size_sqM
  insecticideVolume: number;
}

export interface BreedingSite {
  type: string;
  area: number;
  treatment: string;
}

// API Response format from real API
export interface ParasiteControlAPIResponse {
  _id: string;
  serial_no: string;
  date: string;
  owner_name: string;
  owner_id: string;
  owner_birthdate: string;
  owner_phone: string;
  herd_location: string;
  coordinate_e: number;
  coordinate_n: number;
  supervisor: string;
  vehicle_no: string;
  total_sheep: number;
  young_sheep: number;
  female_sheep: number;
  treated_sheep: number;
  total_goats: number;
  young_goats: number;
  female_goats: number;
  treated_goats: number;
  total_camel: number;
  young_camels: number;
  female_camels: number;
  treated_camels: number;
  total_cattle: number;
  young_cattle: number;
  female_cattle: number;
  treated_cattle: number;
  total_herd: number;
  total_young: number;
  total_female: number;
  total_treated: number;
  insecticide_type: string;
  insecticide_volume_ml: number;
  insecticide_category: string;
  insecticide_status: string;
  animal_barn_size_sqm: number;
  breeding_sites: string;
  parasite_control_volume: number;
  parasite_control_status: string;
  herd_health_status: string;
  complying_to_instructions: boolean;
  request_date: string;
  request_situation: string;
  request_fulfilling_date?: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Updated ParasiteControl interface to match backend structure
export interface ParasiteControl {
  _id?: string; // MongoDB ID from API
  serialNo: string; // Backend uses string, not number
  date: string;
  // Support both old and new structures
  owner?: Owner; // Legacy support
  client: string | {  // Backend expects string ID, but can also be populated object
    _id?: string;
    name: string;
    nationalId: string;
    phone: string;
    village?: string;
    detailedAddress?: string;
    birthDate?: string;
  };
  location?: Location; // Legacy support
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  supervisor: string;
  vehicleNo: string;
  // Support both old and new herd structures
  herd?: Herd; // Legacy support
  herdCounts?: {
    sheep: AnimalCount;
    goats: AnimalCount;
    camel: AnimalCount;
    cattle: AnimalCount;
    horse?: AnimalCount;
  };
  insecticide: {
    type: string;
    method: string;
    volume_ml?: number; // Legacy support
    volumeMl?: number; // Backend field
    status: "Sprayed" | "Not Sprayed";
    category: string;
  };
  barns?: Barn[]; // Legacy support
  // Backend fields
  herdLocation: string;
  animalBarnSizeSqM: number;
  breedingSites: string; // Backend expects string
  parasiteControlVolume: number;
  parasiteControlStatus: string;
  herdHealthStatus: "Healthy" | "Sick" | "Under Treatment";
  complying?: "Comply" | "Not Comply"; // Legacy support
  complyingToInstructions: boolean; // Backend field
  request: Request;
  category?: string;
  remarks?: string;
  // Virtual fields from backend
  totalHerdCount?: number;
  totalTreated?: number;
  treatmentEfficiency?: number;
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
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
}

// Vaccination Types - Updated to match backend structure
export interface Vaccination {
  _id?: string; // MongoDB ID
  id?: string; // Alternative ID field for compatibility
  serialNo: string; // Backend uses string, not number
  date: string;
  client: {
    _id: string;
    name: string;
    nationalId: string;
    phone: string;
    village?: string;
    detailedAddress?: string;
    birthDate?: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  supervisor: string;
  vehicleNo: string;
  farmLocation: string;
  team: string;
  vaccineType: string;
  vaccineCategory: string; // Preventive / Emergency
  herdCounts: {
    sheep: {
      total: number;
      young: number;
      female: number;
      vaccinated: number;
    };
    goats: {
      total: number;
      young: number;
      female: number;
      vaccinated: number;
    };
    camel: {
      total: number;
      young: number;
      female: number;
      vaccinated: number;
    };
    cattle: {
      total: number;
      young: number;
      female: number;
      vaccinated: number;
    };
    horse: {
      total: number;
      young: number;
      female: number;
      vaccinated: number;
    };
  };
  herdHealth: "Healthy" | "Sick" | "Under Treatment";
  animalsHandling: "Easy" | "Difficult";
  labours: string; // Available / Not Available
  reachableLocation: string; // Easy / Hard to reach
  request: {
    date: string;
    situation: "Open" | "Closed" | "Pending";
    fulfillingDate?: string;
  };
  category?: string;
  remarks: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  
  // Legacy support for old structure
  owner?: Owner;
  location?: Location;
  herd?: Herd;
}

// Mobile Clinic Types - Updated to match backend structure
export interface MobileClinic {
  _id?: string;
  serialNo: string;
  date: string;
  client: {
    _id: string;
    name: string;
    nationalId: string;
    phone: string;
    village?: string;
    detailedAddress?: string;
    birthDate?: string;
  };
  farmLocation: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  supervisor: string;
  vehicleNo: string;
  animalCounts: {
    sheep: number;
    goats: number;
    camel: number;
    horse: number;
    cattle: number;
  };
  diagnosis: string;
  interventionCategory: "Emergency" | "Routine" | "Preventive" | "Follow-up";
  treatment: string;
  medicationsUsed?: {
    name: string;
    dosage: string;
    quantity: number;
    route: "Oral" | "Injection" | "Topical" | "Intravenous" | "Intramuscular" | "Subcutaneous";
  }[];
  request: {
    date: string;
    situation: "Open" | "Closed" | "Pending";
    fulfillingDate?: string;
  };
  followUpRequired?: boolean;
  followUpDate?: string;
  remarks?: string;
  // Virtual fields from backend
  totalAnimals?: number;
  totalMedications?: number;
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
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
  
  // Legacy fields for backward compatibility
  owner?: Owner;
  location?: Location;
  sheep?: number;
  goats?: number;
  camel?: number;
  horse?: number;
  cattle?: number;
}

// Equine Health Types
export interface EquineHealth {
  _id?: string; // MongoDB ID
  serialNo: string;
  date: string;
  client: {
    _id?: string;
    name: string;
    nationalId: string;
    birthDate?: string;
    phone: string;
    village?: string;
    detailedAddress?: string;
  };
  farmLocation: string;
  coordinates: {
    latitude?: number;
    longitude?: number;
  };
  supervisor: string;
  vehicleNo: string;
  horseCount: number;
  diagnosis: string;
  interventionCategory: "Emergency" | "Routine" | "Preventive" | "Follow-up" | "Breeding" | "Performance";
  treatment: string;
  followUpRequired: boolean;
  followUpDate?: string;
  request: Request;
  remarks?: string;
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
  // createdBy?: {
  //   _id: string;
  //   name: string;
  //   email: string;
  // };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  // Legacy fields for backward compatibility
  owner?: Owner;
  location?: Location;
  category?: string;
}

// Laboratory Types - Updated to match the table structure exactly
export interface Laboratory {
  _id?: string; // MongoDB ID
  serialNo: number; // Serial number from table
  date: string; // Date column
  sampleCode: string; // Sample Code column
  clientName: string; // Name column (client name)
  clientId: string; // ID column (client ID - 10 digits)
  clientBirthDate: string; // Birth Date column
  clientPhone: string; // phone column (9 digits)
  farmLocation: string; // Location column
  coordinates: {
    latitude: number; // N column (North coordinate)
    longitude: number; // E column (East coordinate)
  };
  speciesCounts: {
    sheep: number; // Sheep column (Mandatory)
    goats: number; // Goats column (Mandatory)
    camel: number; // Camel column (Mandatory)
    cattle: number; // Cattle column (Mandatory)
    horse: number; // Horse column (Mandatory)
    other?: string; // Other (Species) column
  };
  collector: string; // Sample Collector column
  sampleType: string; // Sample Type column (Drop List)
  sampleNumber: string; // Collector Code column (جامع العينة رمز)
  positiveCases: number; // positive cases column (Mandatory)
  negativeCases: number; // Negative Cases column (Mandatory)
  remarks: string; // Remarks column
  testResults?: Array<{
    id: string;
    animalId: string;
    animalType: string;
    testType: string;
    result: string;
    notes: string;
  }>;
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
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
}

// User/Auth Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'section_supervisor' | 'field_worker';
  roleNameAr: string;
  section: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Supervisor {
  _id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'section_supervisor';
  section?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
