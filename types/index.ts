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

// Legacy interface for backward compatibility
export interface ParasiteControl {
  _id?: string; // MongoDB ID from API
  serialNo: number;
  date: string;
  owner: Owner;
  location: Location;
  supervisor: string;
  vehicleNo: string;
  herd: Herd;
  insecticide: Insecticide;
  barns: Barn[];
  breedingSites: BreedingSite[];
  // New fields from database schema
  herdLocation: string; // Herd_Location
  animalBarnSizeSqM: number; // Animal_Barn_Size_sqM
  parasiteControlVolume: number; // Parasite_Control_Volume
  parasiteControlStatus: string; // Parasite_Control_Status
  herdHealthStatus: "Healthy" | "Sick" | "Under Treatment";
  complying: "Comply" | "Not Comply";
  request: Request;
  category: string;
  remarks: string;
}

// Vaccination Types - Updated to match backend structure
export interface Vaccination {
  _id?: string;
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

// Equine Health Types - Updated to match backend structure
export interface HorseDetail {
  id: string;
  breed: string;
  age: number;
  gender: string;
  color: string;
  healthStatus: string;
}

export interface EquineHealth {
  _id?: string;
  id?: string;
  serialNo: string;
  date: string;
  client: {
    _id: string;
    name: string;
    nationalId: string;
    phone: string;
    village?: string;
    totalAnimals?: number;
    healthyAnimalsCount?: number;
    id?: string;
  };
  farmLocation: string;
  supervisor: string;
  vehicleNo: string;
  horseCount: number;
  horseDetails: HorseDetail[];
  diagnosis: string;
  interventionCategory: "Clinical Examination" | "Surgical Operation" | "Ultrasonography" | "Lab Analysis" | "Farriery" | "Routine";
  treatment: string;
  request: {
    date: string;
    situation: "Open" | "Closed" | "Pending";
    fulfillingDate?: string;
  };
  followUpRequired?: boolean;
  remarks?: string;
  createdBy?: string;
  medicationsUsed?: any[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  healthyHorsesCount?: number;
  sickHorsesCount?: number;
  underTreatmentCount?: number;
  totalMedications?: number;
  
  // Legacy fields for backward compatibility
  owner?: Owner;
  location?: Location;
  category?: string;
}

// Laboratory Types
export interface Laboratory {
  sampleCode: string;
  sampleType: string;
  collector: string;
  date: string;
  speciesCounts: {
    sheep: number;
    goats: number;
    camel: number;
    cattle: number;
    horse: number;
  };
  positiveCases: number;
  negativeCases: number;
  remarks: string;
}

// User/Auth Types
export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  password?: string; // Only for registration, not returned in queries
  role: "super_admin" | "section_supervisor" | "field_worker";
  section?: "Mobile Clinic" | "Vaccination" | "Parasite Control" | "Equine Health" | "Laboratory" | "Administration";
  avatar?: string;
  isActive?: boolean;
  lastLogin?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
