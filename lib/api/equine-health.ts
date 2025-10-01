import { mockEquineHealthData } from "@/lib/mock/equine-health-data";
import type { EquineHealth, ApiResponse, PaginatedResponse } from "@/types";

class EquineHealthApiService {
  private baseUrl = "/api/equine-health";

  async getList(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<EquineHealth>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredData = [...mockEquineHealthData];

    // Apply search filter if provided
    if (params?.search) {
      const searchTerm = params.search.toLowerCase();
      filteredData = filteredData.filter(item =>
        item.owner.name.toLowerCase().includes(searchTerm) ||
        item.diagnosis.toLowerCase().includes(searchTerm) ||
        item.interventionCategory.toLowerCase().includes(searchTerm) ||
        item.serialNo.toString().includes(searchTerm)
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

  async getById(id: number): Promise<EquineHealth | null> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const item = mockEquineHealthData.find(item => item.serialNo === id);
    return item || null;
  }

  async create(data: Omit<EquineHealth, 'serialNo'>): Promise<EquineHealth> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newItem: EquineHealth = {
      ...data,
      serialNo: Math.max(...mockEquineHealthData.map(item => item.serialNo)) + 1
    };

    mockEquineHealthData.push(newItem);
    return newItem;
  }

  async update(id: number, data: Partial<EquineHealth>): Promise<EquineHealth> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = mockEquineHealthData.findIndex(item => item.serialNo === id);
    if (index === -1) {
      throw new Error("Item not found");
    }

    mockEquineHealthData[index] = { ...mockEquineHealthData[index], ...data };
    return mockEquineHealthData[index];
  }

  async delete(id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const index = mockEquineHealthData.findIndex(item => item.serialNo === id);
    if (index === -1) {
      throw new Error("Item not found");
    }

    mockEquineHealthData.splice(index, 1);
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
      "عدد الخيول",
      "التشخيص",
      "فئة التدخل",
      "العلاج",
      "تاريخ الطلب",
      "حالة الطلب",
      "تاريخ الإنجاز",
      "الفئة",
      "الملاحظات"
    ];

    const csvData = mockEquineHealthData.map(item => [
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
      item.horseCount,
      item.diagnosis,
      item.interventionCategory,
      item.treatment,
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

export const equineHealthApi = new EquineHealthApiService();
