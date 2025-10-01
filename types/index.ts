// Owner/Client Types
export interface Owner {
  name: string;
  id: string;
  birthDate: string;
  phone: string;
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
}

export interface Barn {
  size: number;
  insecticideVolume: number;
}

export interface BreedingSite {
  type: string;
  area: number;
  treatment: string;
}

export interface ParasiteControl {
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
  herdHealthStatus: "Healthy" | "Sick" | "Under Treatment";
  complying: "Comply" | "Not Comply";
  request: Request;
  category: string;
  remarks: string;
}

// Vaccination Types
export interface Vaccination {
  serialNo: number;
  date: string;
  owner: Owner;
  location: Location;
  supervisor: string;
  vehicleNo: string;
  vaccineType: string;
  herd: Herd;
  herdHealth: "Healthy" | "Sick" | "Under Treatment";
  animalsHandling: "Good" | "Fair" | "Poor";
  labours: number;
  reachableLocation: boolean;
  request: Request;
  category: string;
  remarks: string;
}

// Mobile Clinic Types
export interface MobileClinic {
  serialNo: number;
  date: string;
  owner: Owner;
  location: Location;
  supervisor: string;
  vehicleNo: string;
  sheep: number;
  goats: number;
  camel: number;
  horse: number;
  cattle: number;
  diagnosis: string;
  interventionCategory: string;
  treatment: string;
  request: Request;
  category: string;
  remarks: string;
}

// Equine Health Types
export interface EquineHealth {
  serialNo: number;
  date: string;
  owner: Owner;
  location: Location;
  supervisor: string;
  vehicleNo: string;
  horseCount: number;
  diagnosis: string;
  interventionCategory: string;
  treatment: string;
  request: Request;
  category: string;
  remarks: string;
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
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "section_supervisor" | "field_worker";
  section?: string;
  avatar?: string;
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
