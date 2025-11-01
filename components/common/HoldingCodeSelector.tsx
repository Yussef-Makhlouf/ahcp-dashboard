"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, MapPin, User, Hash } from 'lucide-react';
import { HoldingCode } from '@/lib/api/holding-codes';
import { api } from '@/lib/api/base-api';
import { villagesApi } from '@/lib/api/villages';

interface HoldingCodeSelectorProps {
  value?: string;
  onValueChange: (holdingCodeId: string | undefined) => void;
  village?: string; // فقط القرية مطلوبة
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function HoldingCodeSelector({
  value,
  onValueChange,
  village,
  placeholder = "اختر رمز الحيازة",
  disabled = false,
  className = ""
}: HoldingCodeSelectorProps) {
  const [holdingCodes, setHoldingCodes] = useState<HoldingCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Get villages data to resolve village ObjectId to name
  const { data: villagesResponse } = useQuery({
    queryKey: ['villages'],
    queryFn: () => villagesApi.search('', 1000),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const villages = villagesResponse?.data || [];

  // Resolve village name from ObjectId if needed
  const resolvedVillageName = React.useMemo(() => {
    if (!village) return '';
    
    // Handle village object directly passed (e.g., from populated data)
    if (typeof village === 'object' && village !== null) {
      const villageObj = village as any;
      const name = villageObj.nameArabic || villageObj.name || villageObj.nameEnglish;
      return name && typeof name === 'string' ? name : '';
    }
    
    // If it's already a village name (string), return it
    if (typeof village === 'string') {
      // Check if it's an ObjectId (24 hex characters)
      if (/^[0-9a-fA-F]{24}$/.test(village)) {
        // Find village by ObjectId
        const foundVillage = villages.find(v => v._id === village);
        const name = foundVillage?.nameArabic || foundVillage?.nameEnglish;
        return name && typeof name === 'string' ? name : '';
      } else {
        // It's already a village name
        return village;
      }
    }
    
    return '';
  }, [village, villages]);

  // Fetch holding codes based on resolved village name
  const fetchHoldingCodes = async () => {
    console.log('🔍 HoldingCodeSelector: fetchHoldingCodes called with:', {
      originalVillage: village,
      resolvedVillageName: resolvedVillageName
    });
    
    if (!resolvedVillageName) {
      console.log('❌ No resolved village name, skipping fetch');
      setHoldingCodes([]);
      return;
    }
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('village', resolvedVillageName); // استخدم اسم القرية المحلول
      params.append('active', 'true');
      params.append('limit', '100');

      console.log('📡 Fetching holding codes with URL:', `/holding-codes?${params.toString()}`);
      const response = await api.get<{success: boolean, data: HoldingCode[], pagination?: any}>(`/holding-codes?${params.toString()}`);
      
      console.log('✅ Holding codes raw response:', response);
      
      // معالجة الاستجابة - قد تكون متداخلة
      let holdingCodesData: HoldingCode[] = [];
      
      if (response && typeof response === 'object') {
        // تحقق من البنية: { success: true, data: [...] }
        if (response.data && Array.isArray(response.data)) {
          holdingCodesData = response.data;
        }
        // تحقق من البنية المتداخلة: { data: { success: true, data: [...] } }
        else if ((response as any).data?.data && Array.isArray((response as any).data.data)) {
          holdingCodesData = (response as any).data.data;
        }
        // إذا كانت الاستجابة مباشرة مصفوفة
        else if (Array.isArray(response)) {
          holdingCodesData = response;
        }
      }
      
      console.log('📋 Processed holding codes:', holdingCodesData);
      console.log('📊 Number of holding codes found:', holdingCodesData.length);
      
      // تنظيف البيانات للتأكد من عدم وجود كائنات معقدة في العرض
      const cleanedData = holdingCodesData.map(item => {
        // Handle village field - ensure it's a string
        let villageStr = '';
        if (item.village) {
          if (typeof item.village === 'object' && item.village !== null) {
            const villageObj = item.village as any;
            villageStr = villageObj.nameArabic || villageObj.name || villageObj.nameEnglish || '';
          } else if (typeof item.village === 'string') {
            villageStr = item.village;
          }
        }
        
        return {
          ...item,
          _id: String(item._id || ''),
          code: String(item.code || ''),
          village: villageStr, // Always a string now
          description: String(item.description || '')
        };
      });
      
      setHoldingCodes(cleanedData);
    } catch (error: any) {
      console.error('❌ Error fetching holding codes:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setHoldingCodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 HoldingCodeSelector useEffect triggered - resolved village name changed to:', resolvedVillageName);
    fetchHoldingCodes();
  }, [resolvedVillageName]); // استخدم resolvedVillageName بدلاً من village

  // Create new holding code
  const handleCreateHoldingCode = async () => {
    if (!newCode.trim() || !resolvedVillageName) return;

    try {
      const data = await api.post<{success: boolean, data: HoldingCode, message: string}>('/holding-codes', {
        code: newCode.trim(),
        village: resolvedVillageName, // استخدم اسم القرية المحلول
        description: newDescription.trim() || undefined
      });

      const newHoldingCode = data.data;
      
      // Add to list and select it
      setHoldingCodes(prev => [...prev, newHoldingCode]);
      onValueChange(newHoldingCode._id);
      
      // Reset form and close dialog
      setNewCode('');
      setNewDescription('');
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating holding code:', error);
      const errorMessage = error.response?.data?.message || error.userMessage || 'فشل في إنشاء رمز الحيازة';
      alert(errorMessage);
    }
  };

  // Get display text for holding code
  const getHoldingCodeDisplay = (holdingCode: HoldingCode) => {
    try {
      // Handle both simple string and complex object for village
      let villageText = 'غير محدد';
      
      if (holdingCode.village) {
        if (typeof holdingCode.village === 'object' && holdingCode.village !== null) {
          // Extract text from village object, ensuring it's a string
          const villageObj = holdingCode.village as any;
          const potentialName = villageObj.nameArabic || villageObj.name || villageObj.nameEnglish;
          villageText = potentialName && typeof potentialName === 'string' ? potentialName : 'غير محدد';
        } else if (typeof holdingCode.village === 'string') {
          villageText = holdingCode.village;
        }
      }
      
      // Ensure code is a string
      const codeText = holdingCode.code && typeof holdingCode.code === 'string' 
        ? holdingCode.code 
        : String(holdingCode.code || 'غير محدد');
      
      // Return plain string concatenation
      return codeText + ' - ' + villageText;
    } catch (error) {
      console.error('Error in getHoldingCodeDisplay:', error, holdingCode);
      return 'خطأ في عرض البيانات';
    }
  };

  const canCreateNew = resolvedVillageName && !disabled;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <Select 
          value={value || ""} 
          onValueChange={(val) => {
            // تجنب إرسال القيمة الوهمية
            if (val === "__no_items__") return;
            console.log('🏠 HoldingCodeSelector: Value changed to:', val);
            // إرسال undefined بدلاً من string فارغ عندما لا يتم اختيار قيمة
            onValueChange(val || undefined);
          }}
          disabled={disabled || loading}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={loading ? "جاري التحميل..." : placeholder} />
          </SelectTrigger>
          <SelectContent>
            {holdingCodes.length === 0 ? (
              <SelectItem value="__no_items__" disabled>
                {loading ? "جاري التحميل..." : "لا توجد رموز حيازة متاحة"}
              </SelectItem>
            ) : (
              holdingCodes.map((holdingCode) => {
                try {
                  const displayText = getHoldingCodeDisplay(holdingCode);
                  const itemValue = String(holdingCode._id || '');
                  
                  // Ensure displayText is a primitive string
                  const safeDisplayText = typeof displayText === 'string' ? displayText : String(displayText || '');
                  
                  return (
                    <SelectItem key={itemValue} value={itemValue}>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{safeDisplayText}</span>
                      </div>
                    </SelectItem>
                  );
                } catch (error) {
                  console.error('Error rendering holding code item:', error, holdingCode);
                  return null;
                }
              })
            )}
          </SelectContent>
        </Select>

        {canCreateNew && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="px-3"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة رمز حيازة جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">رمز الحيازة *</Label>
                  <Input
                    id="code"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="أدخل رمز الحيازة"
                    maxLength={50}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">الوصف (اختياري)</Label>
                  <Input
                    id="description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="وصف إضافي لرمز الحيازة"
                    maxLength={200}
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>القرية: {String(resolvedVillageName || 'غير محددة')}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    سيتم إنشاء رمز حيازة جديد لهذه القرية
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setNewCode('');
                      setNewDescription('');
                    }}
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCreateHoldingCode}
                    disabled={!newCode.trim()}
                  >
                    إضافة
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Info text */}
      {!resolvedVillageName && (
        <p className="text-sm text-gray-500">
          يرجى تحديد القرية أولاً لعرض رمز الحيازة المتاح
        </p>
      )}
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 mt-1">
          Debug: village={String(village || 'none')}, resolved={String(resolvedVillageName || 'none')}, codes={holdingCodes.length}
        </div>
      )}

    </div>
  );
}
