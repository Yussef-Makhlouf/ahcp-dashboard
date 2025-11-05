'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Filter, Download, Upload, MoreHorizontal, Grid3x3, List, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/button-modern';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/data-table/data-table';

import { toast } from 'sonner';

import { 
  dropdownListsApi, 
  DropdownOption, 
  CategoryInfo, 
  DROPDOWN_CATEGORIES, 
  CATEGORY_LABELS,
  CreateDropdownOptionRequest,
  UpdateDropdownOptionRequest
} from '@/lib/api/dropdown-lists';

interface DropdownListManagerProps {
  category?: string;
  title?: string;
  description?: string;
  allowCreate?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  showInactive?: boolean;
}

export function DropdownListManager({
  category,
  title,
  description,
  allowCreate = true,
  allowEdit = true,
  allowDelete = true,
  showInactive = true
}: DropdownListManagerProps) {
  // State management
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(category || '');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<DropdownOption | null>(null);
  const [viewingOption, setViewingOption] = useState<DropdownOption | null>(null);
  const [formData, setFormData] = useState<CreateDropdownOptionRequest>({
    category: selectedCategory,
    value: '',
    label: '',
    labelAr: ''
  });
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load options when category changes
  useEffect(() => {
    if (selectedCategory) {
      loadOptions();
    }
  }, [selectedCategory, searchQuery]);

  const loadCategories = async () => {
    try {
      const response = await dropdownListsApi.getCategories();
      
      // Ensure response.data is an array
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
      
      // Ensure response.data is an array
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
    setEditingOption(null);
    setFormData({
      category: selectedCategory,
      value: '',
      label: '',
      labelAr: ''
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (option: DropdownOption) => {
    setEditingOption(option);
    setFormData({
      category: option.category,
      value: option.value,
      label: option.label,
      labelAr: option.labelAr
    });
    setIsDialogOpen(true);
  };

  const handleView = (option: DropdownOption) => {
    setViewingOption(option);
    setIsViewDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      if (editingOption) {
        await dropdownListsApi.update(editingOption._id!, formData);
        toast.success('تم تحديث الخيار بنجاح');
      } else {
        await dropdownListsApi.create(formData);
        toast.success('تم إنشاء الخيار بنجاح');
      }
      
      setIsDialogOpen(false);
      loadOptions();
    } catch (error: any) {
      console.error('Error saving option:', error);
      toast.error(error.message || 'فشل في حفظ الخيار');
    } finally {
      setLoading(false);
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
    } catch (error: any) {
      console.error('Error deleting option:', error);
      if (error.message?.includes('used in')) {
        toast.error('لا يمكن حذف هذا الخيار لأنه مستخدم في السجلات');
      } else {
        toast.error('فشل في حذف الخيار');
      }
    }
  };


  const columns = [
    {
      accessorKey: 'value',
      header: 'القيمة',
      cell: ({ row }: any) => (
        <code className="px-2 py-1 bg-gray-100 rounded text-sm">
          {row.original.value}
        </code>
      )
    },
    {
      accessorKey: 'label',
      header: 'التسمية (إنجليزي)',
      cell: ({ row }: any) => row.original.label
    },
    {
      accessorKey: 'labelAr',
      header: 'التسمية (عربي)',
      cell: ({ row }: any) => row.original.labelAr
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const option = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleView(option)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            {allowEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(option)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            
            {allowDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(option)}
                className="text-red-600 hover:text-red-800"
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {title || 'إدارة القوائم المنسدلة'}
          </h2>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        
        {allowCreate && (
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            إضافة خيار جديد
          </Button>
        )}
      </div>

      {/* Category Selection & Stats */}
      {!category && (
        <Card>
          <CardHeader>
            <CardTitle>اختيار الفئة</CardTitle>
            <CardDescription>
              اختر الفئة التي تريد إدارة خياراتها
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>الفئة</Label>
                <Select value={selectedCategory} onValueChange={(value) => {
                  if (value !== "no-categories") {
                    setSelectedCategory(value);
                  }
                }}>
                  <SelectTrigger>
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
                          {cat.labelAr || cat.label || cat.category} ({cat.total || 0} خيار)
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {currentCategory && (
                <div className="flex items-center gap-4 pt-6">
                  <Badge variant="outline">
                    المجموع: {currentCategory.total}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في الخيارات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
          </div>
        </CardContent>
      </Card>

      {/* Options Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {currentCategory ? currentCategory.labelAr : 'الخيارات'}
          </CardTitle>
          <CardDescription>
            إدارة خيارات القائمة المنسدلة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={options}
            isLoading={loading}
         
          />
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingOption ? 'تعديل الخيار' : 'إضافة خيار جديد'}
            </DialogTitle>
            <DialogDescription>
              {editingOption ? 'قم بتعديل بيانات الخيار' : 'أدخل بيانات الخيار الجديد'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 p-4">
            <div className="flex flex-col gap-2 p-4" >
              <Label>اسم العنصر (عربي) *</Label>
              <Input
                value={formData.labelAr}
                onChange={(e) => {
                  const arabicName = e.target.value;
                  setFormData({ 
                    ...formData, 
                    labelAr: arabicName,
                    label: arabicName, // استخدام نفس الاسم للإنجليزي
                    value: arabicName.replace(/\s+/g, '_').toLowerCase() // تحويل للـ value
                  });
                }}
                placeholder="مثال: الحمى القلاعية"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                أدخل اسم العنصر فقط، سيتم إنشاء القيمة والتسمية تلقائياً
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <LoadingButton loading={loading} onClick={handleSave}>
              {editingOption ? 'تحديث' : 'إنشاء'}
            </LoadingButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>عرض تفاصيل الخيار</DialogTitle>
          </DialogHeader>

          {viewingOption && (
            <div className="space-y-4 ">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">اسم العنصر</Label>
                  <p className="mt-1 text-lg font-medium">{viewingOption.labelAr}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">القيمة المولدة</Label>
                  <code className="block mt-1 px-2 py-1 bg-gray-100 rounded text-sm">
                    {viewingOption.value}
                  </code>
                </div>
              </div>

              {viewingOption.usage && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">الاستخدام</Label>
                  <div className="mt-1">
                    {viewingOption.usage.used ? (
                      <Badge variant="outline">
                        مستخدم في {viewingOption.usage.count} سجل في {viewingOption.usage.model}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">غير مستخدم</Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">تاريخ الإنشاء</Label>
                  <p className="mt-1">
                    {viewingOption.createdAt ? new Date(viewingOption.createdAt).toLocaleDateString('ar-SA') : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">تاريخ التحديث</Label>
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
