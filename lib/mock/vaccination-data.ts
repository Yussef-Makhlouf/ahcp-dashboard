import type { Vaccination } from '@/types';

export const mockVaccinationData: Vaccination[] = [
  {
    serialNo: 1,
    date: "2025-09-07",
    owner: {
      name: "خالد محمد",
      id: "V1",
      birthDate: "1980-02-15",
      phone: "+201012345678"
    },
    location: { e: 30.0555, n: 31.2468 },
    supervisor: "د. سامي أحمد",
    vehicleNo: "V1",
    // New fields from database schema
    farmLocation: "مزرعة الشمال",
    team: "فريق التحصين الأول",
    vaccineType: "HS",
    vaccineCategory: "Preventive",
    herd: {
      sheep: { total: 50, young: 15, female: 28, vaccinated: 50 },
      goats: { total: 30, young: 8, female: 18, vaccinated: 30 },
      camel: { total: 2, young: 0, female: 1, vaccinated: 2 },
      cattle: { total: 10, young: 3, female: 6, vaccinated: 10 }
    },
    herdHealth: "Healthy",
    animalsHandling: "Easy",
    labours: "Available",
    reachableLocation: "Easy",
    request: {
      date: "2025-09-07",
      situation: "Closed",
      fulfillingDate: "2025-09-07"
    },
    category: "التحصين",
    remarks: "تم التحصين بنجاح"
  },
  {
    serialNo: 2,
    date: "2025-09-08",
    owner: {
      name: "سارة عبدالرحمن",
      id: "V2",
      birthDate: "1985-06-20",
      phone: "01098765432"
    },
    location: { e: 30.1111, n: 31.3333 },
    supervisor: "د. منى حسن",
    vehicleNo: "V2",
    // New fields from database schema
    farmLocation: "مزرعة الجنوب",
    team: "فريق التحصين الثاني",
    vaccineType: "SG-Pox",
    vaccineCategory: "Preventive",
    herd: {
      sheep: { total: 70, young: 20, female: 40, vaccinated: 70 },
      goats: { total: 45, young: 12, female: 25, vaccinated: 45 },
      camel: { total: 0, young: 0, female: 0, vaccinated: 0 },
      cattle: { total: 5, young: 1, female: 3, vaccinated: 5 }
    },
    herdHealth: "Healthy",
    animalsHandling: "Easy",
    labours: "Available",
    reachableLocation: "Easy",
    request: {
      date: "2025-09-08",
      situation: "Closed",
      fulfillingDate: "2025-09-08"
    },
    category: "التحصين",
    remarks: ""
  },
  {
    serialNo: 3,
    date: "2025-09-09",
    owner: {
      name: "عمر سليمان",
      id: "V3",
      birthDate: "1992-09-10",
      phone: "+201555987654"
    },
    location: { e: null, n: null },
    supervisor: "د. سامي أحمد",
    vehicleNo: "V1",
    // New fields from database schema
    farmLocation: "مزرعة الشرق",
    team: "فريق التحصين الأول",
    vaccineType: "Brucella",
    vaccineCategory: "Emergency",
    herd: {
      sheep: { total: 40, young: 10, female: 22, vaccinated: 0 },
      goats: { total: 25, young: 7, female: 14, vaccinated: 0 },
      camel: { total: 1, young: 0, female: 1, vaccinated: 0 },
      cattle: { total: 8, young: 2, female: 5, vaccinated: 0 }
    },
    herdHealth: "Sick",
    animalsHandling: "Difficult",
    labours: "Not Available",
    reachableLocation: "Hard to reach",
    request: {
      date: "2025-09-09",
      situation: "Open"
    },
    category: "التحصين",
    remarks: "تأجيل بسبب مرض القطيع"
  },
  {
    serialNo: 4,
    date: "2025-09-10",
    owner: {
      name: "ليلى أحمد",
      id: "V4",
      birthDate: "1988-12-25",
      phone: "01234567890"
    },
    location: { e: 30.2222, n: 31.4444 },
    supervisor: "د. منى حسن",
    vehicleNo: "V2",
    // New fields from database schema
    farmLocation: "مزرعة الغرب",
    team: "فريق التحصين الثاني",
    vaccineType: "ET",
    vaccineCategory: "Preventive",
    herd: {
      sheep: { total: 90, young: 25, female: 50, vaccinated: 90 },
      goats: { total: 60, young: 15, female: 35, vaccinated: 60 },
      camel: { total: 4, young: 1, female: 2, vaccinated: 4 },
      cattle: { total: 20, young: 5, female: 12, vaccinated: 20 }
    },
    herdHealth: "Healthy",
    animalsHandling: "Easy",
    labours: "Available",
    reachableLocation: "Easy",
    request: {
      date: "2025-09-10",
      situation: "Closed",
      fulfillingDate: "2025-09-10"
    },
    category: "التحصين",
    remarks: "قطيع كبير - تم التحصين على مرحلتين"
  }
];
