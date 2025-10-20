import type { ParasiteControl } from '@/types';

export const mockParasiteControlData: ParasiteControl[] = [
  {
    serialNo: 1,
    date: "2025-09-07",
    owner: {
      name: "إبراهيم محمد",
      id: "P1",
      birthDate: "1978-01-01",
      phone: "+201011234567"
    },
    location: { e: 30.0444, n: 31.2357 },
    supervisor: "أحمد سالم",
    vehicleNo: "P1",
    herd: {
      sheep: { total: 45, young: 12, female: 25, treated: 45 },
      goats: { total: 30, young: 8, female: 18, treated: 30 },
      camel: { total: 5, young: 1, female: 3, treated: 5 },
      cattle: { total: 10, young: 3, female: 6, treated: 10 }
    },
    insecticide: {
      type: "Cyperdip 10%",
      method: "Pour on",
      volume_ml: 50,
      status: "Sprayed",
      category: "Pour-on"
    },
    barns: [
      { size: 100, insecticideVolume: 20 },
      { size: 150, insecticideVolume: 30 }
    ],
    breedingSites: [],
    // New fields from database schema
    herdLocation: "منطقة الشمال",
    animalBarnSizeSqM: 250.50,
    holdingCode: "HC001",
    herdHealthStatus: "Healthy",
    complying: "Comply",
    request: {
      date: "2025-09-07",
      situation: "Closed",
      fulfillingDate: "2025-09-07"
    },
    category: "مكافحة الطفيليات",
    remarks: ""
  },
  {
    serialNo: 2,
    date: "2025-09-08",
    owner: {
      name: "أحمد عبدالله",
      id: "P2",
      birthDate: "1985-05-12",
      phone: "+201015987654"
    },
    location: { e: 30.1234, n: 31.3456 },
    supervisor: "محمد حسن",
    vehicleNo: "P2",
    herd: {
      sheep: { total: 60, young: 15, female: 35, treated: 60 },
      goats: { total: 25, young: 7, female: 15, treated: 25 },
      camel: { total: 0, young: 0, female: 0, treated: 0 },
      cattle: { total: 8, young: 2, female: 5, treated: 8 }
    },
    insecticide: {
      type: "Ultra-Pour 1%",
      method: "Pour on",
      volume_ml: 45,
      status: "Sprayed",
      category: "Pour-on"
    },
    barns: [
      { size: 200, insecticideVolume: 40 }
    ],
    breedingSites: [],
    // New fields from database schema
    herdLocation: "منطقة الجنوب",
    animalBarnSizeSqM: 200.00,
    holdingCode: "HC002",
    herdHealthStatus: "Healthy",
    complying: "Comply",
    request: {
      date: "2025-09-08",
      situation: "Closed",
      fulfillingDate: "2025-09-08"
    },
    category: "مكافحة الطفيليات",
    remarks: "تم الرش بنجاح"
  },
  {
    serialNo: 3,
    date: "2025-09-09",
    owner: {
      name: "محمود سيد",
      id: "P3",
      birthDate: "1990-03-20",
      phone: "01098765432"
    },
    location: { e: null, n: null },
    supervisor: "أحمد سالم",
    vehicleNo: "P1",
    herd: {
      sheep: { total: 35, young: 10, female: 20, treated: 0 },
      goats: { total: 20, young: 5, female: 12, treated: 0 },
      camel: { total: 2, young: 0, female: 1, treated: 0 },
      cattle: { total: 0, young: 0, female: 0, treated: 0 }
    },
    insecticide: {
      type: "Cyperdip 10%",
      method: "Spray",
      volume_ml: 0,
      status: "Not Sprayed",
      category: "Spray"
    },
    barns: [],
    breedingSites: [],
    // New fields from database schema
    herdLocation: "منطقة الشرق",
    animalBarnSizeSqM: 0,
    holdingCode: "HC003",
    herdHealthStatus: "Sick",
    complying: "Not Comply",
    request: {
      date: "2025-09-09",
      situation: "Ongoing"
    },
    category: "مكافحة الطفيليات",
    remarks: "المربي غير متواجد"
  },
  {
    serialNo: 4,
    date: "2025-09-10",
    owner: {
      name: "سعيد أحمد",
      id: "P4",
      birthDate: "1982-07-15",
      phone: "01234567890"
    },
    location: { e: 30.2345, n: 31.4567 },
    supervisor: "محمد حسن",
    vehicleNo: "P2",
    herd: {
      sheep: { total: 80, young: 20, female: 45, treated: 80 },
      goats: { total: 40, young: 10, female: 25, treated: 40 },
      camel: { total: 3, young: 1, female: 2, treated: 3 },
      cattle: { total: 15, young: 4, female: 9, treated: 15 }
    },
    insecticide: {
      type: "Deltamethrin 5%",
      method: "Pour on",
      volume_ml: 70,
      status: "Sprayed",
      category: "Pour-on"
    },
    barns: [
      { size: 250, insecticideVolume: 50 },
      { size: 100, insecticideVolume: 20 }
    ],
    breedingSites: [
      { type: "بركة مياه", area: 50, treatment: "معالج" }
    ],
    // New fields from database schema
    herdLocation: "منطقة الغرب",
    animalBarnSizeSqM: 350.75,
    holdingCode: "HC004",
    herdHealthStatus: "Healthy",
    complying: "Comply",
    request: {
      date: "2025-09-10",
      situation: "Closed",
      fulfillingDate: "2025-09-10"
    },
    category: "مكافحة الطفيليات",
    remarks: "ممتاز"
  },
  {
    serialNo: 5,
    date: "2025-09-11",
    owner: {
      name: "فاطمة علي",
      id: "P5",
      birthDate: "1975-11-30",
      phone: "+201555123456"
    },
    location: { e: 30.3456, n: 31.5678 },
    supervisor: "أحمد سالم",
    vehicleNo: "P1",
    herd: {
      sheep: { total: 55, young: 14, female: 30, treated: 55 },
      goats: { total: 35, young: 9, female: 20, treated: 35 },
      camel: { total: 0, young: 0, female: 0, treated: 0 },
      cattle: { total: 12, young: 3, female: 7, treated: 12 }
    },
    insecticide: {
      type: "Cyperdip 10%",
      method: "Pour on",
      volume_ml: 60,
      status: "Sprayed",
      category: "Pour-on"
    },
    barns: [
      { size: 180, insecticideVolume: 35 },
      { size: 120, insecticideVolume: 25 }
    ],
    breedingSites: [],
    // New fields from database schema
    herdLocation: "منطقة الوسط",
    animalBarnSizeSqM: 300.00,
    holdingCode: "HC005",
    herdHealthStatus: "Healthy",
    complying: "Comply",
    request: {
      date: "2025-09-11",
      situation: "Closed",
      fulfillingDate: "2025-09-11"
    },
    category: "مكافحة الطفيليات",
    remarks: "تعاون ممتاز من المربي"
  }
];
