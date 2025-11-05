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
import { dropdownListsApi, type DropdownOption, type CategoryInfo, CATEGORY_LABELS } from '@/lib/api/dropdown-lists';

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
      toast.error('Failed to load categories');
    }
  };

  const loadOptions = async () => {
    if (!selectedCategory) return;
    
    setLoading(true);
    try {
      // تحميل جميع الخيارات بدون حد (limit: 5000 لضمان تحميل الكل)
      const response = await dropdownListsApi.getAll({
        category: selectedCategory,
        search: searchQuery || undefined,
        limit: 5000 // تحميل جميع البيانات
      });
      
      const optionsData = Array.isArray(response.data) ? response.data : [];
      setOptions(optionsData);
      
      console.log(`✅ Loaded ${optionsData.length} options for category: ${selectedCategory}`);
    } catch (error) {
      console.error('Error loading options:', error);
      toast.error('فشل تحميل الخيارات');
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
      toast.error('Please enter Arabic name');
      return;
    }
    
    if (!formData.label.trim()) {
      toast.error('Please enter English name');
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
        toast.success('Option updated successfully');
      } else {
        await dropdownListsApi.create(dataToSave);
        toast.success('Option created successfully');
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadOptions();
      loadCategories(); // Refresh category counts
    } catch (error: any) {
      console.error('Error saving option:', error);
      toast.error(error.message || 'Failed to save option');
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
          ? `Option "${option.label}" activated successfully`
          : `Option "${option.label}" deactivated successfully`
      );
      
      loadOptions();
    } catch (error: any) {
      console.error('Error toggling option status:', error);
      toast.error(error.message || 'Failed to change option status');
    }
  };

  const handleDelete = async (option: DropdownOption) => {
    if (!confirm(`Are you sure you want to delete the option "${option.label || option.labelAr}"?`)) {
      return;
    }

    try {
      await dropdownListsApi.delete(option._id!);
      toast.success('Option deleted successfully');
      loadOptions();
      loadCategories(); // Refresh category counts
    } catch (error: any) {
      console.error('Error deleting option:', error);
      if (error.message?.includes('used in')) {
        toast.error('Cannot delete this option because it is used in records');
      } else {
        toast.error('Failed to delete option');
      }
    }
  };

  // Table columns
  const columns = [
    {
      accessorKey: 'labelAr',
      header: () => <div className="text-right font-bold">الاسم بالعربية</div>,
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2 text-right">
          <div className={`w-2 h-2 rounded-full ${row.original.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="font-bold text-primary">
            {row.original.labelAr}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'label',
      header: () => <div className="text-left font-bold" dir="ltr">الاسم بالإنجليزية</div>,
      cell: ({ row }: any) => (
        <div className="font-medium text-gray-700 text-left" dir="ltr">
          {row.original.label}
        </div>
      )
    },
    {
      accessorKey: 'value',
      header: () => <div className="text-center font-bold">القيمة المُولدة</div>,
      cell: ({ row }: any) => (
        <div className="flex justify-center">
          <code className="px-2 py-1 bg-primary/10 border border-primary/20 rounded text-sm font-mono text-primary">
            {row.original.value}
          </code>
        </div>
      )
    },
    {
      accessorKey: 'isActive',
      header: () => <div className="text-center font-bold">الحالة</div>,
      cell: ({ row }: any) => (
        <div className="flex justify-center">
          <Badge variant={row.original.isActive ? 'secondary' : 'destructive'} className="gap-1">
            {row.original.isActive ? (
              <><CheckCircle className="h-3 w-3" /> نشط</>
            ) : (
              <><XCircle className="h-3 w-3" /> معطل</>
            )}
          </Badge>
        </div>
      )
    },
    {
      id: 'actions',
      header: () => <div className="text-center font-bold">الإجراءات</div>,
      cell: ({ row }: any) => {
        const option = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            {/* View Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleView(option)}
              className="h-9 px-3 gap-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-300"
              title="عرض التفاصيل"
            >
              <Eye className="h-4 w-4" />
              <span className="text-xs font-medium">عرض</span>
            </Button>
            
            {/* Edit Button */}
            {allowEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(option)}
                className="h-9 px-3 gap-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 hover:border-green-300"
                title="تعديل الخيار"
              >
                <Edit className="h-4 w-4" />
                <span className="text-xs font-medium">تعديل</span>
              </Button>
            )}
            
            {/* Toggle Active Button */}
            {allowEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleActive(option)}
                className={`h-9 px-3 gap-2 ${
                  option.isActive 
                    ? 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800 hover:border-orange-300' 
                    : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 hover:border-green-300'
                }`}
                title={option.isActive ? 'إيقاف الخيار' : 'تفعيل الخيار'}
              >
                {option.isActive ? (
                  <>
                    <XCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">إيقاف</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">تفعيل</span>
                  </>
                )}
              </Button>
            )}
            
            {/* Delete Button */}
            {allowDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(option)}
                className="h-9 px-3 gap-2 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 hover:border-red-300"
                title="حذف الخيار"
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-xs font-medium">حذف</span>
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  const currentCategory = categories.find(cat => cat.category === selectedCategory);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-right">
          <h2 className="text-3xl font-bold bg-gradient-to-l from-primary to-primary/60 bg-clip-text text-transparent">إدارة القوائم المنسدلة</h2>
          <p className="text-muted-foreground mt-1">
            إدارة شاملة لجميع خيارات القوائم المنسدلة المستخدمة في النظام
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
            <Button onClick={handleCreate} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              إضافة خيار جديد
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-r-4 border-r-primary hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">إجمالي الفئات</p>
                <p className="text-2xl font-bold text-primary">{categories.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-r-4 border-r-blue-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">إجمالي الخيارات</p>
                <p className="text-2xl font-bold text-blue-600">{options.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-r-4 border-r-green-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">الخيارات النشطة</p>
                <p className="text-2xl font-bold text-green-600">{options.filter(o => o.isActive).length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-r-4 border-r-orange-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">الخيارات المعطلة</p>
                <p className="text-2xl font-bold text-orange-600">{options.filter(o => !o.isActive).length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Selection */}
      <Card className="border-t-4 border-t-primary">
        <CardHeader className="text-right">
          <CardTitle className="text-xl">اختيار الفئة</CardTitle>
          <CardDescription>
            اختر الفئة التي تريد إدارة خياراتها
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Label htmlFor="category-select" className="text-right block mb-2 font-semibold">الفئة</Label>
              <Select 
                value={selectedCategory} 
                onValueChange={(value) => {
                  if (value !== "no-categories") {
                    setSelectedCategory(value);
                  }
                }}
              >
                <SelectTrigger id="category-select">
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
                        <div className="flex items-center justify-between w-full gap-2">
                          <span className="font-medium">{CATEGORY_LABELS[cat.category as keyof typeof CATEGORY_LABELS]?.ar || cat.labelAr || cat.category}</span>
                          <Badge variant="secondary" className="mr-2">
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
                <div className="w-full text-right">
                  <Label className="font-semibold">إحصائيات الفئة</Label>
                  <div className="flex items-center gap-2 mt-2 justify-end">
                    <Badge variant="outline" className="gap-1 text-sm">
                      الإجمالي: {currentCategory.total || 0}
                    </Badge>
                    <Badge variant="secondary" className="gap-1 text-sm">
                      نشط: {options.filter(o => o.isActive).length}
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
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="text-right">
                <CardTitle className="text-xl">
                  {CATEGORY_LABELS[selectedCategory as keyof typeof CATEGORY_LABELS]?.ar || currentCategory?.labelAr || selectedCategory}
                </CardTitle>
                <CardDescription>
                  إدارة خيارات هذه الفئة
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-base px-3 py-1">
                {options.length} خيار
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث في الخيارات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 text-right"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Options Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">عرض:</span>
                    <Badge variant="secondary" className="text-base font-bold">
                      {options.length}
                    </Badge>
                    <span className="text-muted-foreground">خيار</span>
                  </div>
                  {options.filter(o => o.isActive).length !== options.length && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>•</span>
                      <span className="text-green-600 font-semibold">{options.filter(o => o.isActive).length} نشط</span>
                      <span>•</span>
                      <span className="text-orange-600 font-semibold">{options.filter(o => !o.isActive).length} معطل</span>
                    </div>
                  )}
                </div>
                {options.length > 0 && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Search className="h-3 w-3" />
                    <span>استخدم البحث أعلاه لتصفية الخيارات</span>
                  </div>
                )}
              </div>
              
              {options.length === 0 && !loading ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <span className="text-3xl">📋</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">لا توجد خيارات</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      لم يتم إضافة أي خيارات لهذه الفئة بعد
                    </p>
                    <Button onClick={handleCreate} className="gap-2">
                      <Plus className="h-4 w-4" />
                      إضافة خيار جديد
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <DataTable
                  columns={columns}
                  data={options}
                  isLoading={loading}
                  enableSelection={false}
                  enableBulkDelete={false}
                  showPagination={true}
                  pageSize={500}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-md p-4">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl">
              {editingOption ? 'تعديل الخيار' : 'إضافة خيار جديد'}
            </DialogTitle>
            <DialogDescription>
              {editingOption ? 'قم بتعديل تفاصيل الخيار' : 'أدخل تفاصيل الخيار الجديد'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="option-name-ar" className="text-right font-semibold">الاسم بالعربية *</Label>
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
                className="text-right text-lg"
                dir="rtl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="option-name-en" className="text-right font-semibold">الاسم بالإنجليزية *</Label>
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
                className="text-left text-lg"
                dir="ltr"
              />
            </div>

   

            {formData.label && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                <div className="text-sm text-right">
                  <span className="font-semibold text-primary">معاينة القيمة المُولدة: </span>
                  <code className="bg-white px-3 py-1.5 rounded text-sm font-mono border border-primary/30">
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
            className="min-w-[100px]"
          >
            إلغاء
          </Button>
          <LoadingButton 
            loading={loading} 
            onClick={handleSave}
            disabled={!formData.labelAr.trim() || !formData.label.trim()}
            className="min-w-[100px] bg-primary hover:bg-primary/90"
          >
            {editingOption ? 'تحديث' : 'إضافة'}
          </LoadingButton>
        </div>
      </DialogContent>
    </Dialog>

    {/* View Dialog */}
    <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
      <DialogContent className="max-w-md p-6" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-xl font-bold">تفاصيل الخيار</DialogTitle>
        </DialogHeader>

        {viewingOption && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="text-right">
                <Label className="text-sm font-medium text-muted-foreground">الاسم بالعربية</Label>
                <p className="mt-1 text-xl font-bold text-primary">{viewingOption.labelAr}</p>
              </div>
              
              <div className="text-right">
                <Label className="text-sm font-medium text-muted-foreground">الاسم بالإنجليزية</Label>
                <p className="mt-1 text-lg font-medium">{viewingOption.label}</p>
              </div>
              
              <div className="text-right">
                <Label className="text-sm font-medium text-muted-foreground">القيمة المُولدة</Label>
                <code className="block mt-1 px-3 py-2 bg-primary/5 border border-primary/20 rounded text-sm font-mono">
                  {viewingOption.value}
                </code>
              </div>

              <div className="text-right">
                <Label className="text-sm font-medium text-muted-foreground">الفئة</Label>
                <p className="mt-1 font-medium">{CATEGORY_LABELS[viewingOption.category as keyof typeof CATEGORY_LABELS]?.ar || viewingOption.category}</p>
              </div>

              <div className="text-right">
                <Label className="text-sm font-medium text-muted-foreground">الحالة</Label>
                <div className="mt-1 flex items-center gap-2 justify-end">
                  <Badge variant={viewingOption.isActive ? 'secondary' : 'destructive'} className="text-sm px-3 py-1">
                    {viewingOption.isActive ? 'نشط ✓' : 'معطل ✗'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm text-muted-foreground">
              <div className="text-right">
                <Label className="text-xs font-medium text-muted-foreground">تاريخ الإنشاء</Label>
                <p className="mt-1 font-medium">
                  {viewingOption.createdAt ? new Date(viewingOption.createdAt).toLocaleDateString('ar-SA') : '-'}
                </p>
              </div>
              <div className="text-right">
                <Label className="text-xs font-medium text-muted-foreground">تاريخ التحديث</Label>
                <p className="mt-1 font-medium">
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
