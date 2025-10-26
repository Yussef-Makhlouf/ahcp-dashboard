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
    
    // If it's already a village name (string), return it
    if (typeof village === 'string') {
      // Check if it's an ObjectId (24 hex characters)
      if (/^[0-9a-fA-F]{24}$/.test(village)) {
        // Find village by ObjectId
        const foundVillage = villages.find(v => v._id === village);
        return foundVillage ? foundVillage.nameArabic : '';
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
      
      setHoldingCodes(holdingCodesData);
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
    return `${holdingCode.code} - ${holdingCode.village}`;
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
            onValueChange(val);
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
              holdingCodes.map((holdingCode) => (
                <SelectItem key={holdingCode._id} value={holdingCode._id || ''}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{getHoldingCodeDisplay(holdingCode)}</span>
                  </div>
                </SelectItem>
              ))
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
                    <span>القرية: {resolvedVillageName || 'غير محددة'}</span>
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
          Debug: village={village}, resolved={resolvedVillageName}, codes={holdingCodes.length}
        </div>
      )}

    </div>
  );
}
