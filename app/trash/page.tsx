'use client';

import { useState, useEffect } from 'react';
import { 
  Trash2, 
  RotateCcw, 
  AlertTriangle, 
  Calendar,
  User,
  Filter,
  Download,
  Loader2
} from 'lucide-react';
import {
  getTrashRecords,
  getTrashStats,
  restoreRecord,
  permanentlyDeleteRecord,
  emptyTrashByType,
  emptyAllTrash,
  TrashGroup,
  TrashStats
} from '@/lib/api/trash';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { MainLayout } from '@/components/layout/main-layout';

const TYPE_NAMES: Record<string, string> = {
  laboratory: 'المختبرات',
  vaccination: 'التطعيمات',
  parasite_control: 'مكافحة الطفيليات',
  mobile_clinic: 'العيادات المتنقلة',
  equine_health: 'صحة الخيول',
  client: 'المربين'
};

export default function TrashPage() {
  const [trashData, setTrashData] = useState<TrashGroup[]>([]);
  const [stats, setStats] = useState<TrashStats>({});
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: string;
    id: string;
    name: string;
  }>({ open: false, type: '', id: '', name: '' });
  const [emptyDialog, setEmptyDialog] = useState<{
    open: boolean;
    type: string;
  }>({ open: false, type: '' });

  // Load data
  useEffect(() => {
    loadData();
  }, [selectedType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [trashResponse, statsResponse] = await Promise.all([
        getTrashRecords({ type: selectedType === 'all' ? undefined : selectedType }),
        getTrashStats()
      ]);
      
      setTrashData(trashResponse.data);
      setStats(statsResponse.stats);
    } catch (error: any) {
      toast.error('فشل تحميل البيانات', {
        description: error.response?.data?.message || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Restore record
  const handleRestore = async (type: string, id: string, name: string) => {
    try {
      await restoreRecord(type, id);
      toast.success('تم الاسترجاع بنجاح', {
        description: `تم استرجاع ${name} بنجاح`
      });
      loadData();
    } catch (error: any) {
      toast.error('فشل الاسترجاع', {
        description: error.response?.data?.message || error.message
      });
    }
  };

  // Permanently delete
  const handlePermanentDelete = async () => {
    try {
      await permanentlyDeleteRecord(deleteDialog.type, deleteDialog.id);
      toast.success('تم الحذف نهائياً', {
        description: `تم حذف ${deleteDialog.name} نهائياً`
      });
      setDeleteDialog({ open: false, type: '', id: '', name: '' });
      loadData();
    } catch (error: any) {
      toast.error('فشل الحذف', {
        description: error.response?.data?.message || error.message
      });
    }
  };

  // Empty trash
  const handleEmptyTrash = async () => {
    try {
      if (emptyDialog.type === 'all') {
        await emptyAllTrash();
        toast.success('تم إفراغ السلة', {
          description: 'تم حذف جميع السجلات نهائياً'
        });
      } else {
        await emptyTrashByType(emptyDialog.type);
        toast.success('تم إفراغ السلة', {
          description: `تم حذف جميع سجلات ${TYPE_NAMES[emptyDialog.type]} نهائياً`
        });
      }
      setEmptyDialog({ open: false, type: '' });
      loadData();
    } catch (error: any) {
      toast.error('فشل إفراغ السلة', {
        description: error.response?.data?.message || error.message
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy - HH:mm', { locale: ar });
    } catch {
      return 'تاريخ غير صحيح';
    }
  };

  // Get record display name
  const getRecordName = (record: any, type: string) => {
    if (type === 'client') return record.name || 'غير محدد';
    if (record.serialNo) return `رقم ${record.serialNo}`;
    if (record.sampleCode) return `عينة ${record.sampleCode}`;
    return record._id?.slice(-6) || 'غير محدد';
  };

  const totalCount = Object.values(stats).reduce((sum, item) => sum + item.count, 0);

  return (
    <MainLayout>
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trash2 className="h-8 w-8" />
            سجل المحذوفات
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة السجلات المحذوفة مع إمكانية الاسترجاع أو الحذف النهائي
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={() => setEmptyDialog({ open: true, type: 'all' })}
          disabled={totalCount === 0}
        >
          <Trash2 className="ml-2 h-4 w-4" />
          إفراغ السلة بالكامل
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(stats).map(([key, value]) => (
          <Card key={key} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {value.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>تصفية حسب النوع</CardTitle>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                {Object.entries(TYPE_NAMES).map(([key, name]) => (
                  <SelectItem key={key} value={key}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Data */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : trashData.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">لا توجد سجلات محذوفة</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={trashData[0]?.type} dir="rtl">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${trashData.length}, 1fr)` }}>
            {trashData.map((group) => (
              <TabsTrigger key={group.type} value={group.type}>
                {group.typeName} ({group.count})
              </TabsTrigger>
            ))}
          </TabsList>

          {trashData.map((group) => (
            <TabsContent key={group.type} value={group.type} className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  إجمالي: {group.count} سجل محذوف
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEmptyDialog({ open: true, type: group.type })}
                  disabled={group.count === 0}
                >
                  <Trash2 className="ml-2 h-4 w-4" />
                  إفراغ سلة {group.typeName}
                </Button>
              </div>

              <div className="grid gap-4">
                {group.records.map((record) => (
                  <Card key={record._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">
                              {getRecordName(record, group.type)}
                            </h3>
                            <Badge variant="destructive">محذوف</Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>تاريخ الحذف: {formatDate(record.deletedAt)}</span>
                            </div>
                            {record.deletedBy && (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>حذف بواسطة: {record.deletedBy.name}</span>
                              </div>
                            )}
                          </div>

                          {/* Record Details */}
                          {group.type === 'client' && (
                            <div className="text-sm space-y-1 pt-2 border-t">
                              {record.nationalId && <p>الهوية: {record.nationalId}</p>}
                              {record.phone && <p>الهاتف: {record.phone}</p>}
                              {record.village && <p>القرية: {record.village}</p>}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestore(group.type, record._id, getRecordName(record, group.type))}
                          >
                            <RotateCcw className="ml-2 h-4 w-4" />
                            استرجاع
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteDialog({
                              open: true,
                              type: group.type,
                              id: record._id,
                              name: getRecordName(record, group.type)
                            })}
                          >
                            <Trash2 className="ml-2 h-4 w-4" />
                            حذف نهائي
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, type: '', id: '', name: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              تأكيد الحذف النهائي
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف "{deleteDialog.name}" نهائياً؟
              <br />
              <strong className="text-red-600">لا يمكن التراجع عن هذا الإجراء!</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handlePermanentDelete} className="bg-red-600 hover:bg-red-700">
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Empty Trash Dialog */}
      <AlertDialog open={emptyDialog.open} onOpenChange={(open) => !open && setEmptyDialog({ open: false, type: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              تأكيد إفراغ السلة
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              {emptyDialog.type === 'all' ? (
                <>
                  هل أنت متأكد من حذف جميع السجلات المحذوفة نهائياً؟
                  <br />
                  <strong className="text-red-600">سيتم حذف {totalCount} سجل نهائياً!</strong>
                </>
              ) : (
                <>
                  هل أنت متأكد من حذف جميع سجلات {TYPE_NAMES[emptyDialog.type]} المحذوفة نهائياً؟
                  <br />
                  <strong className="text-red-600">لا يمكن التراجع عن هذا الإجراء!</strong>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleEmptyTrash} className="bg-red-600 hover:bg-red-700">
              إفراغ السلة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </MainLayout>
  );
}
