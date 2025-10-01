import type { EquineHealth } from "@/types";

export const mockEquineHealthData: EquineHealth[] = [
  {
    serialNo: 1,
    date: "2025-01-15",
    owner: {
      name: "أحمد محمد علي",
      id: "12345678901234",
      birthDate: "1985-03-20",
      phone: "01012345678"
    },
    location: {
      e: 31.2357,
      n: 30.0444
    },
    supervisor: "د. محمد أحمد",
    vehicleNo: "VET001",
    horseCount: 3,
    diagnosis: "التهاب المفاصل التنكسي",
    interventionCategory: "Clinical Examination",
    treatment: "حقن داخل المفصل - حمض الهيالورونيك",
    request: {
      date: "2025-01-10",
      situation: "Closed",
      fulfillingDate: "2025-01-15"
    },
    category: "Equine Health Service",
    remarks: "تحسن ملحوظ في الحركة بعد العلاج"
  },
  {
    serialNo: 2,
    date: "2025-01-18",
    owner: {
      name: "فاطمة إبراهيم حسن",
      id: "23456789012345",
      birthDate: "1978-07-15",
      phone: "01198765432"
    },
    location: {
      e: 31.2456,
      n: 30.0543
    },
    supervisor: "د. أحمد علي",
    vehicleNo: "VET002",
    horseCount: 2,
    diagnosis: "التهاب الرئة",
    interventionCategory: "Lab Analysis",
    treatment: "مضادات حيوية - سيفترياكسون",
    request: {
      date: "2025-01-12",
      situation: "Closed",
      fulfillingDate: "2025-01-18"
    },
    category: "Equine Health Service",
    remarks: "نتائج التحاليل المخبرية إيجابية"
  },
  {
    serialNo: 3,
    date: "2025-01-22",
    owner: {
      name: "محمد سعد الدين",
      id: "34567890123456",
      birthDate: "1982-11-08",
      phone: "01234567890"
    },
    location: {
      e: 31.1987,
      n: 29.9876
    },
    supervisor: "د. سارة محمد",
    vehicleNo: "VET003",
    horseCount: 5,
    diagnosis: "مشاكل الأسنان",
    interventionCategory: "Farriery",
    treatment: "تلميع الأسنان وإزالة الجير",
    request: {
      date: "2025-01-16",
      situation: "Closed",
      fulfillingDate: "2025-01-22"
    },
    category: "Equine Health Service",
    remarks: "تحسن في الأكل والمضغ"
  },
  {
    serialNo: 4,
    date: "2025-02-03",
    owner: {
      name: "علياء محمود أحمد",
      id: "45678901234567",
      birthDate: "1990-05-12",
      phone: "01587654321"
    },
    location: {
      e: 31.2678,
      n: 30.1234
    },
    supervisor: "د. إبراهيم حسن",
    vehicleNo: "VET004",
    horseCount: 4,
    diagnosis: "التهاب الجلد",
    interventionCategory: "Surgical Operation",
    treatment: "جراحة لإزالة الورم الجلدي",
    request: {
      date: "2025-01-28",
      situation: "Closed",
      fulfillingDate: "2025-02-03"
    },
    category: "Equine Health Service",
    remarks: "عملية ناجحة - غرز قابلة للذوبان"
  },
  {
    serialNo: 5,
    date: "2025-02-10",
    owner: {
      name: "خالد عبد الرحمن",
      id: "56789012345678",
      birthDate: "1975-09-25",
      phone: "01055556666"
    },
    location: {
      e: 31.1789,
      n: 29.8765
    },
    supervisor: "د. فاطمة أحمد",
    vehicleNo: "VET005",
    horseCount: 1,
    diagnosis: "مشاكل في البطن",
    interventionCategory: "Ultrasonography",
    treatment: "فحص بالموجات فوق الصوتية",
    request: {
      date: "2025-02-05",
      situation: "Closed",
      fulfillingDate: "2025-02-10"
    },
    category: "Equine Health Service",
    remarks: "لا توجد مشاكل عضوية واضحة"
  },
  {
    serialNo: 6,
    date: "2025-02-15",
    owner: {
      name: "نورا سامي محمد",
      id: "67890123456789",
      birthDate: "1988-12-03",
      phone: "01177778888"
    },
    location: {
      e: 31.3456,
      n: 30.2345
    },
    supervisor: "د. عمرو محمود",
    vehicleNo: "VET006",
    horseCount: 6,
    diagnosis: "التهاب العضلات",
    interventionCategory: "Clinical Examination",
    treatment: "علاج فيزيائي ومضادات التهاب",
    request: {
      date: "2025-02-08",
      situation: "Closed",
      fulfillingDate: "2025-02-15"
    },
    category: "Equine Health Service",
    remarks: "تحسن تدريجي مع العلاج الطبيعي"
  },
  {
    serialNo: 7,
    date: "2025-02-20",
    owner: {
      name: "طارق حسن إبراهيم",
      id: "78901234567890",
      birthDate: "1980-06-18",
      phone: "01299998888"
    },
    location: {
      e: 31.1567,
      n: 29.7654
    },
    supervisor: "د. لينا محمد",
    vehicleNo: "VET007",
    horseCount: 2,
    diagnosis: "مشاكل في الهضم",
    interventionCategory: "Lab Analysis",
    treatment: "تحاليل دم شاملة",
    request: {
      date: "2025-02-14",
      situation: "Closed",
      fulfillingDate: "2025-02-20"
    },
    category: "Equine Health Service",
    remarks: "نتائج طبيعية - تغيير في النظام الغذائي"
  },
  {
    serialNo: 8,
    date: "2025-03-05",
    owner: {
      name: "هدى علي محمود",
      id: "89012345678901",
      birthDate: "1983-08-30",
      phone: "01533334444"
    },
    location: {
      e: 31.2789,
      n: 30.3456
    },
    supervisor: "د. كريم أحمد",
    vehicleNo: "VET008",
    horseCount: 3,
    diagnosis: "إصابة في الحافر",
    interventionCategory: "Farriery",
    treatment: "علاج الحافر وتركيب حدوة خاصة",
    request: {
      date: "2025-02-28",
      situation: "Closed",
      fulfillingDate: "2025-03-05"
    },
    category: "Equine Health Service",
    remarks: "تحسن في المشي بعد العلاج"
  },
  {
    serialNo: 9,
    date: "2025-03-12",
    owner: {
      name: "سمير عبد الله",
      id: "90123456789012",
      birthDate: "1977-04-14",
      phone: "01011112222"
    },
    location: {
      e: 31.2345,
      n: 30.1567
    },
    supervisor: "د. مروة حسن",
    vehicleNo: "VET009",
    horseCount: 4,
    diagnosis: "مشاكل في التنفس",
    interventionCategory: "Clinical Examination",
    treatment: "أدوية موسعة للشعب الهوائية",
    request: {
      date: "2025-03-07",
      situation: "Closed",
      fulfillingDate: "2025-03-12"
    },
    category: "Equine Health Service",
    remarks: "تحسن ملحوظ في التنفس"
  },
  {
    serialNo: 10,
    date: "2025-03-18",
    owner: {
      name: "رانيا محمد سعد",
      id: "01234567890123",
      birthDate: "1986-01-22",
      phone: "01122223333"
    },
    location: {
      e: 31.1890,
      n: 29.8901
    },
    supervisor: "د. تامر إبراهيم",
    vehicleNo: "VET010",
    horseCount: 1,
    diagnosis: "التهاب المثانة",
    interventionCategory: "Lab Analysis",
    treatment: "مضادات حيوية ومدرات للبول",
    request: {
      date: "2025-03-13",
      situation: "Closed",
      fulfillingDate: "2025-03-18"
    },
    category: "Equine Health Service",
    remarks: "نتائج التحاليل تؤكد الشفاء"
  }
];
