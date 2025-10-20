"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Search, Filter, Download, Upload, Settings, Eye, MoreHorizontal } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { dropdownListsApi, DROPDOWN_CATEGORIES, CATEGORY_LABELS } from "@/lib/api/dropdown-lists";
import type { DropdownOption } from "@/lib/api/dropdown-lists";

interface AdvancedDropdownManagerProps {
  onClose?: () => void;
}

export function AdvancedDropdownManager({ onClose }: AdvancedDropdownManagerProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  
  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<DropdownOption | null>(null);
  const [formData, setFormData] = useState({
    value: '',
    label: '',
    labelAr: '',
    sortOrder: 0,
    isActive: true
  });

  // Statistics
  const [stats, setStats] = useState({
    totalOptions: 0,
    activeOptions: 0,
    categoriesCount: 0
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadOptions();
    }
  }, [selectedCategory]);

  useEffect(() => {
    filterOptions();
  }, [options, searchTerm, showActiveOnly]);

  const loadCategories = () => {
    const categoryList = Object.keys(DROPDOWN_CATEGORIES);
    setCategories(categoryList);
    if (categoryList.length > 0) {
      setSelectedCategory(categoryList[0]);
    }
  };

  const loadOptions = async () => {
    if (!selectedCategory) return;
    
    setLoading(true);
    try {
      const categoryValue = DROPDOWN_CATEGORIES[selectedCategory as keyof typeof DROPDOWN_CATEGORIES];
      const response = await dropdownListsApi.getAll({ 
        category: categoryValue,
        limit: 1000 
      });
      // Ensure response.data is an array
      const optionsData = Array.isArray(response.data) ? response.data : [];
      setOptions(optionsData);
      
      // Update stats
      setStats({
        totalOptions: optionsData.length,
        activeOptions: optionsData.filter(opt => opt.isActive).length,
        categoriesCount: categories.length
      });
    } catch (error) {
      console.error('Error loading options:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOptions = () => {
    let filtered = [...options];
    
    if (searchTerm) {
      filtered = filtered.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.labelAr.includes(searchTerm) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (showActiveOnly) {
      filtered = filtered.filter(option => option.isActive);
    }
    
    setFilteredOptions(filtered);
  };

  const handleSaveOption = async () => {
    try {
      const categoryValue = DROPDOWN_CATEGORIES[selectedCategory as keyof typeof DROPDOWN_CATEGORIES];
      const optionData = {
        ...formData,
        category: categoryValue
      };

      if (editingOption) {
        await dropdownListsApi.update(editingOption._id!, optionData);
      } else {
        await dropdownListsApi.create(optionData);
      }
      
      setIsFormOpen(false);
      resetForm();
      loadOptions();
    } catch (error) {
      console.error('Error saving option:', error);
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الخيار؟')) {
      try {
        await dropdownListsApi.delete(optionId);
        loadOptions();
      } catch (error) {
        console.error('Error deleting option:', error);
      }
    }
  };

  const handleToggleStatus = async (option: DropdownOption) => {
    try {
      await dropdownListsApi.update(option._id!, { 
        ...option, 
        isActive: !option.isActive 
      });
      loadOptions();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      value: '',
      label: '',
      labelAr: '',
      sortOrder: 0,
      isActive: true
    });
    setEditingOption(null);
  };

  const openEditForm = (option: DropdownOption) => {
    setFormData({
      value: option.value,
      label: option.label,
      labelAr: option.labelAr,
      sortOrder: option.sortOrder,
      isActive: option.isActive
    });
    setEditingOption(option);
    setIsFormOpen(true);
  };

  const getCategoryLabel = (category: string) => {
    const categoryValue = DROPDOWN_CATEGORIES[category as keyof typeof DROPDOWN_CATEGORIES];
    return CATEGORY_LABELS[categoryValue]?.ar || category;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة القوائم المنسدلة المتقدمة</h2>
          <p className="text-gray-600">تحكم كامل في جميع خيارات القوائم المنسدلة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            تصدير
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            استيراد
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الخيارات</p>
                <p className="text-2xl font-bold">{stats.totalOptions}</p>
              </div>
              <Settings className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الخيارات النشطة</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeOptions}</p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">عدد الفئات</p>
                <p className="text-2xl font-bold text-purple-600">{stats.categoriesCount}</p>
              </div>
              <Filter className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">الفئات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "ghost"}
                  className="w-full justify-start text-right"
                  onClick={() => setSelectedCategory(category)}
                >
                  {getCategoryLabel(category)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedCategory ? getCategoryLabel(selectedCategory) : 'اختر فئة'}
              </CardTitle>
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetForm(); setIsFormOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة خيار جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingOption ? 'تعديل الخيار' : 'إضافة خيار جديد'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>القيمة (بالإنجليزية) *</Label>
                      <Input
                        value={formData.value}
                        onChange={(e) => setFormData({...formData, value: e.target.value})}
                        placeholder="مثال: healthy"
                      />
                    </div>
                    
                    <div>
                      <Label>التسمية (بالإنجليزية) *</Label>
                      <Input
                        value={formData.label}
                        onChange={(e) => setFormData({...formData, label: e.target.value})}
                        placeholder="مثال: Healthy"
                      />
                    </div>
                    
                    <div>
                      <Label>التسمية (بالعربية) *</Label>
                      <Input
                        value={formData.labelAr}
                        onChange={(e) => setFormData({...formData, labelAr: e.target.value})}
                        placeholder="مثال: سليم"
                      />
                    </div>
                    
                    <div>
                      <Label>ترتيب العرض</Label>
                      <Input
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    
              
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                      إلغاء
                    </Button>
                    <Button onClick={handleSaveOption}>
                      {editingOption ? 'حفظ التغييرات' : 'إضافة الخيار'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Search and Filters */}
            <div className="flex gap-4 mt-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="البحث في الخيارات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                variant={showActiveOnly ? "default" : "outline"}
                onClick={() => setShowActiveOnly(!showActiveOnly)}
              >
                النشطة فقط
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : (
              <div className="space-y-2">
                {filteredOptions.map((option) => (
                  <div
                    key={option._id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{option.labelAr}</span>
                        <Badge variant={option.isActive ? "default" : "secondary"}>
                          {option.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {option.label} ({option.value})
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditForm(option)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={option.isActive ? "secondary" : "default"}
                        onClick={() => handleToggleStatus(option)}
                      >
                        {option.isActive ? "إيقاف" : "تفعيل"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteOption(option._id!)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {filteredOptions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد خيارات متاحة
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
