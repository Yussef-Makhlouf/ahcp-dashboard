/**
 * معالج موحد لعمليات الحذف المجمع
 */

import { api } from "./base-api";

export interface BulkDeleteResult {
  deletedCount: number;
}

/**
 * دالة موحدة لمعالجة الحذف المجمع مع معالجة أفضل للأخطاء
 */
export async function handleBulkDelete(
  endpoint: string,
  ids: (string | number)[]
): Promise<BulkDeleteResult> {
  try {
    console.log(`🗑️ Calling bulk delete for ${endpoint} with IDs:`, ids.length, 'items');
    
    const response = await api.delete(`${endpoint}/bulk-delete`, {
      data: { ids },
      timeout: 30000,
    });
    
    console.log(`✅ Bulk delete response for ${endpoint}:`, response);
    
    // Handle different response structures
    const responseData = (response as any).data || response;
    const deletedCount = 
      responseData?.deletedCount || 
      responseData?.deleted || 
      responseData?.count ||
      responseData?.affectedRows ||
      ids.length; // Fallback to requested count
    
    return { deletedCount: Number(deletedCount) };
  } catch (error: any) {
    console.error(`❌ Bulk delete failed for ${endpoint}:`, error);
    throw new Error(`Failed to delete records: ${error.message || 'Unknown error'}`);
  }
}

/**
 * تطبيق معالج الحذف المجمع على API معين
 */
export function createBulkDeleteMethod(endpoint: string) {
  return (ids: (string | number)[]): Promise<BulkDeleteResult> => {
    return handleBulkDelete(endpoint, ids);
  };
}
