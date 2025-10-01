import { mockVaccinationData } from "@/lib/mock/vaccination-data";
import type { Vaccination, ApiResponse, PaginatedResponse } from "@/types";

class VaccinationApiService {
  private baseUrl = "/api/vaccination";

  async getList(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Vaccination>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredData = [...mockVaccinationData];

    // Apply search filter if provided
    if (params?.search) {
      const searchTerm = params.search.toLowerCase();
      filteredData = filteredData.filter(item =>
        item.owner.name.toLowerCase().includes(searchTerm) ||
        item.vaccineType.toLowerCase().includes(searchTerm) ||
        item.serialNo.toString().includes(searchTerm) ||
        item.owner.phone.includes(searchTerm)
      );
    }

    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: filteredData.length,
      page,
      limit,
      totalPages: Math.ceil(filteredData.length / limit)
    };
  }

  async getById(id: number): Promise<Vaccination | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const item = mockVaccinationData.find(item => item.serialNo === id);
    return item || null;
  }

  async create(data: Omit<Vaccination, 'serialNo'>): Promise<Vaccination> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newItem: Vaccination = {
      ...data,
      serialNo: Math.max(...mockVaccinationData.map(item => item.serialNo)) + 1
    };

    mockVaccinationData.push(newItem);
    return newItem;
  }

  async update(id: number, data: Partial<Vaccination>): Promise<Vaccination> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = mockVaccinationData.findIndex(item => item.serialNo === id);
    if (index === -1) {
      throw new Error("Item not found");
    }

    mockVaccinationData[index] = { ...mockVaccinationData[index], ...data };
    return mockVaccinationData[index];
  }

  async delete(id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const index = mockVaccinationData.findIndex(item => item.serialNo === id);
    if (index === -1) {
      throw new Error("Item not found");
    }

    mockVaccinationData.splice(index, 1);
  }

  async exportToCsv(): Promise<Blob> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const headers = [
      "رقم التسلسل",
      "التاريخ",
      "اسم المالك",
      "رقم الهوية",
      "تاريخ الميلاد",
      "رقم الهاتف",
      "خط الطول (E)",
      "خط العرض (N)",
      "المشرف",
      "رقم المركبة",
      "نوع المصل",
      "حالة القطيع",
      "معاملة الحيوانات",
      "عدد العمال",
      "الموقع قابل للوصول",
      "تاريخ الطلب",
      "حالة الطلب",
      "تاريخ الإنجاز",
      "الفئة",
      "الملاحظات"
    ];

    const csvData = mockVaccinationData.map(item => [
      item.serialNo,
      item.date,
      item.owner.name,
      item.owner.id,
      item.owner.birthDate,
      item.owner.phone,
      item.location.e,
      item.location.n,
      item.supervisor,
      item.vehicleNo,
      item.vaccineType,
      item.herdHealth,
      item.animalsHandling,
      item.labours,
      item.reachableLocation ? "نعم" : "لا",
      item.request.date,
      item.request.situation,
      item.request.fulfillingDate || "",
      item.category,
      item.remarks
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

    return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  }
}

export const vaccinationApi = new VaccinationApiService();
