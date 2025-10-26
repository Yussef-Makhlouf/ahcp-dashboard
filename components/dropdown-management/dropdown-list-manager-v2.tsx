"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DataTable } from '@/components/data-table/data-table';
import { LoadingButton } from '@/components/ui/loading-button';
import { Plus, Edit, Trash2, Search, Eye, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { dropdownListsApi, type DropdownOption, type CategoryInfo } from '@/lib/api/dropdown-lists';

interface DropdownListManagerV2Props {
  category?: string;
  allowEdit?: boolean;
  allowDelete?: boolean;
}

export function DropdownListManagerV2({
  category,
  allowEdit = true,
  allowDelete = true,
}: DropdownListManagerV2Props) {
  // State management
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(category || '');
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<DropdownOption | null>(null);
  const [viewingOption, setViewingOption] = useState<DropdownOption | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    category: selectedCategory,
    value: '',
    label: '',
    labelAr: '',
    isActive: true
  });

  // Load data on mount and category change
  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadOptions();
    } else {
      setOptions([]);
    }
  }, [selectedCategory, searchQuery]);

  const loadCategories = async () => {
    try {
      const response = await dropdownListsApi.getCategories();
      const categoriesData = Array.isArray(response.data) ? response.data : [];
      setCategories(categoriesData);
      
      if (!selectedCategory && categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0].category);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('فشل في تحميل الفئات');
    }
  };

  const loadOptions = async () => {
    if (!selectedCategory) return;
    
    setLoading(true);
    try {
      const response = await dropdownListsApi.getAll({
        category: selectedCategory,
        search: searchQuery || undefined
      });
      
      const optionsData = Array.isArray(response.data) ? response.data : [];
      setOptions(optionsData);
    } catch (error) {
      console.error('Error loading options:', error);
      toast.error('فشل في تحميل الخيارات');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (option: DropdownOption) => {
    setEditingOption(option);
    setFormData({
      category: option.category,
      value: option.value,
      label: option.label,
      labelAr: option.labelAr,
      isActive: option.isActive ?? true
    });
    setIsDialogOpen(true);
  };

  const handleView = (option: DropdownOption) => {
    setViewingOption(option);
    setIsViewDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.labelAr.trim()) {
      toast.error('يرجى إدخال الاسم العربي');
      return;
    }
    
    if (!formData.label.trim()) {
      toast.error('يرجى إدخال الاسم الإنجليزي');
      return;
    }
    

    try {
      setLoading(true);
      
      // Auto-generate value from English label
      const generatedValue = formData.label.trim().replace(/\s+/g, '_').toLowerCase();
      
      const dataToSave = {
        ...formData,
        category: selectedCategory,
        labelAr: formData.labelAr.trim(),
        label: formData.label.trim(),
        value: generatedValue
      };
      
      if (editingOption) {
        await dropdownListsApi.update(editingOption._id!, dataToSave);
        toast.success('تم تحديث الخيار بنجاح');
      } else {
        await dropdownListsApi.create(dataToSave);
        toast.success('تم إنشاء الخيار بنجاح');
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadOptions();
      loadCategories(); // Refresh category counts
    } catch (error: any) {
      console.error('Error saving option:', error);
      toast.error(error.message || 'فشل في حفظ الخيار');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: selectedCategory,
      value: '',
      label: '',
      labelAr: '',
      isActive: true
    });
    setEditingOption(null);
  };

  const handleToggleActive = async (option: DropdownOption) => {
    try {
      const newActiveStatus = !option.isActive;
      await dropdownListsApi.update(option._id!, { 
        ...option, 
        isActive: newActiveStatus 
      });
      
      toast.success(
        newActiveStatus 
          ? `تم تفعيل الخيار "${option.labelAr}" بنجاح`
          : `تم إلغاء تفعيل الخيار "${option.labelAr}" بنجاح`
      );
      
      loadOptions();
    } catch (error: any) {
      console.error('Error toggling option status:', error);
      toast.error(error.message || 'فشل في تغيير حالة الخيار');
    }
  };

  const handleDelete = async (option: DropdownOption) => {
    if (!confirm(`هل أنت متأكد من حذف الخيار "${option.labelAr || option.label}"؟`)) {
      return;
    }

    try {
      await dropdownListsApi.delete(option._id!);
      toast.success('تم حذف الخيار بنجاح');
      loadOptions();
      loadCategories(); // Refresh category counts
    } catch (error: any) {
      console.error('Error deleting option:', error);
      if (error.message?.includes('used in')) {
        toast.error('لا يمكن حذف هذا الخيار لأنه مستخدم في السجلات');
      } else {
        toast.error('فشل في حذف الخيار');
      }
    }
  };

  // Table columns
  const columns = [
    {
      accessorKey: 'value',
      header: 'القيمة',
      cell: ({ row }: any) => (
        <code className="px-2 py-1 bg-gray-100 rounded text-md font-mono">
          {row.original.value}
        </code>
      )
    },
    {
      accessorKey: 'labelAr',
      header: 'اسم العنصر (عربي)',
      cell: ({ row }: any) => (
        <div className="font-medium">
          {row.original.labelAr}
        </div>
      )
    },
    {
      accessorKey: 'label',
      header: 'اسم العنصر (إنجليزي)',
      cell: ({ row }: any) => (
        <span className="text-gray-600">{row.original.label}</span>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'الحالة',
      cell: ({ row }: any) => (
        <Badge variant={row.original.isActive ? 'secondary' : 'destructive'}>
          {row.original.isActive ? 'نشط' : 'غير نشط'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const option = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleView(option)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            {allowEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(option)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            
            {allowEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleActive(option)}
                className={`h-8 w-8 p-0 ${
                  option.isActive 
                    ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-50' 
                    : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                }`}
                title={option.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
              >
                {option.isActive ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
              </Button>
            )}
            
            {allowDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(option)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  const currentCategory = categories.find(cat => cat.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="">
          <h2 className="text-2xl font-bold">إدارة القوائم المنسدلة</h2>
          <p className="text-muted-foreground">
            إدارة خيارات القوائم المنسدلة المستخدمة في النظام
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadCategories}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          {selectedCategory && (
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة خيار جديد
            </Button>
          )}
        </div>
      </div>

      {/* Category Selection */}
      <Card>
        <CardHeader className="flex items-center justify-between" >
          <CardTitle>اختيار الفئة</CardTitle>
          <CardDescription>
            اختر الفئة التي تريد إدارة خياراتها
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Label htmlFor="category-select">الفئة</Label>
              <Select 
                value={selectedCategory} 
                onValueChange={(value) => {
                  if (value !== "no-categories") {
                    setSelectedCategory(value);
                  }
                }}
              >
                <SelectTrigger id="category-select" dir='rtl'>
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <SelectItem value="no-categories" disabled>
                      لا توجد فئات متاحة
                    </SelectItem>
                  ) : (
                    categories.map((cat) => (
                      <SelectItem key={cat.category} value={cat.category}>
                        <div className="flex items-center justify-between w-full">
                          <span>{cat.labelAr || cat.label || cat.category}</span>
                          <Badge variant="secondary" className="ml-2">
                            {cat.total || 0}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {currentCategory && (
              <div className="flex items-end">
                <div className="w-full">
                  <Label>إحصائيات الفئة</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="gap-1">
                      المجموع: {currentCategory.total || 0}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search and Options */}
      {selectedCategory && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {currentCategory?.labelAr || currentCategory?.label || selectedCategory}
                </CardTitle>
                <CardDescription>
                  إدارة خيارات هذه الفئة
                </CardDescription>
              </div>
              <Badge variant="secondary">
                {options.length} خيار
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في الخيارات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Options Table */}
            <DataTable
              columns={columns}
              data={options}
              isLoading={loading}
              enableSelection={false}
              enableBulkDelete={false}
              showPagination={options.length > 10}
            />
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-md p-4">
          <DialogHeader>
            <DialogTitle>
              {editingOption ? 'تعديل الخيار' : 'إضافة خيار جديد'}
            </DialogTitle>
            <DialogDescription>
              {editingOption ? 'قم بتعديل بيانات الخيار' : 'أدخل بيانات العنصر الجديد'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="option-name-ar" className="text-right">اسم العنصر (عربي) *</Label>
              <Input
                id="option-name-ar"
                value={formData.labelAr}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    labelAr: e.target.value
                  });
                }}
                placeholder="أدخل اسم العنصر بالعربية"
                className="text-right"
                dir="rtl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="option-name-en" className="text-left">اسم العنصر (إنجليزي) *</Label>
              <Input
                id="option-name-en"
                value={formData.label}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    label: e.target.value
                  });
                }}
                placeholder="Enter item name in English"
                className="text-left"
                dir="ltr"
              />
            </div>

   

            {formData.label && (
              <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="text-sm">
                  <span className="font-medium">معاينة القيمة المولدة: </span>
                  <code className="bg-white px-2 py-1 rounded text-xs">
                    {formData.label.replace(/\s+/g, '_').toLowerCase()}
                  </code>
                </div>
              </div>
            )}
          </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button 
            variant="outline" 
            onClick={() => {
              setIsDialogOpen(false);
              resetForm();
            }}
            disabled={loading}
          >
            إلغاء
          </Button>
          <LoadingButton 
            loading={loading} 
            onClick={handleSave}
            disabled={!formData.labelAr.trim() || !formData.label.trim()}
          >
            {editingOption ? 'تحديث' : 'إنشاء'}
          </LoadingButton>
        </div>
      </DialogContent>
    </Dialog>

    {/* View Dialog */}
    <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
      <DialogContent className="max-w-md p-4">
        <DialogHeader>
          <DialogTitle>عرض تفاصيل الخيار</DialogTitle>
        </DialogHeader>

        {viewingOption && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="text-md font-medium text-muted-foreground">اسم العنصر (عربي)</Label>
                <p className="mt-1 text-lg font-medium">{viewingOption.labelAr}</p>
              </div>
              
              <div>
                <Label className="text-md font-medium text-muted-foreground">اسم العنصر (إنجليزي)</Label>
                <p className="mt-1 text-lg font-medium">{viewingOption.label}</p>
              </div>
              
              <div>
                <Label className="text-md font-medium text-muted-foreground">القيمة المولدة</Label>
                <code className="block mt-1 px-3 py-2 bg-gray-100 rounded text-md font-mono">
                  {viewingOption.value}
                </code>
              </div>

              <div>
                <Label className="text-md font-medium text-muted-foreground">الفئة</Label>
                <p className="mt-1">{currentCategory?.labelAr || viewingOption.category}</p>
              </div>

              <div>
                <Label className="text-md font-medium text-muted-foreground">الحالة</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={viewingOption.isActive ? 'secondary' : 'destructive'}>
                    {viewingOption.isActive ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t text-md text-muted-foreground">
              <div>
                <Label className="text-md font-medium text-muted-foreground">تاريخ الإنشاء</Label>
                <p className="mt-1">
                  {viewingOption.createdAt ? new Date(viewingOption.createdAt).toLocaleDateString('ar-SA') : '-'}
                </p>
              </div>
              <div>
                <Label className="text-md font-medium text-muted-foreground">تاريخ التحديث</Label>
                <p className="mt-1">
                  {viewingOption.updatedAt ? new Date(viewingOption.updatedAt).toLocaleDateString('ar-SA') : '-'}
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </div>
  );
}
