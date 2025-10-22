"use client";

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, MapPin, User, Hash } from 'lucide-react';
import { HoldingCode } from '@/lib/api/holding-codes';
import { api } from '@/lib/api/base-api';

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

  // Fetch holding codes based on village
  const fetchHoldingCodes = async () => {
    console.log('🔍 HoldingCodeSelector: fetchHoldingCodes called with village:', village);
    
    if (!village) {
      console.log('❌ No village provided, skipping fetch');
      return;
    }
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('village', village);
      params.append('active', 'true');

      console.log('📡 Fetching holding codes with URL:', `/holding-codes?${params.toString()}`);
      const data = await api.get<{success: boolean, data: HoldingCode[]}>(`/holding-codes?${params.toString()}`);
      
      console.log('✅ Holding codes response:', data);
      console.log('📋 Number of holding codes found:', data.data?.length || 0);
      
      setHoldingCodes(data.data || []);
    } catch (error) {
      console.error('❌ Error fetching holding codes:', error);
      setHoldingCodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 HoldingCodeSelector useEffect triggered - village prop changed to:', village);
    fetchHoldingCodes();
  }, [village]);

  // Create new holding code
  const handleCreateHoldingCode = async () => {
    if (!newCode.trim() || !village) return;

    try {
      const data = await api.post<{success: boolean, data: HoldingCode, message: string}>('/holding-codes', {
        code: newCode.trim(),
        village: village,
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

  const canCreateNew = village && !disabled;

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
                    <span>القرية: {village || 'غير محددة'}</span>
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
      {!village && (
        <p className="text-sm text-gray-500">
          يرجى تحديد القرية أولاً لعرض رمز الحيازة المتاح
        </p>
      )}

    </div>
  );
}
