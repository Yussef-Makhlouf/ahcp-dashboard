"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { 
  Syringe, 
  Bug, 
  Stethoscope, 
  TestTube, 
  House,
  Calendar,
  User,
  MapPin,
  Phone,
  Hash,
  Activity,
  Shield,
  Droplets,
  Thermometer,
  Heart,
  Wind,
  Weight,
  Pill,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
 
} from 'lucide-react';

interface VisitDetailsProps {
  visit: any;
  serviceType: string;
}

export function VisitDetails({ visit, serviceType }: VisitDetailsProps) {
  // Safety check
  if (!visit) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <p className="text-muted-foreground">لا توجد بيانات للزيارة</p>
        </CardContent>
      </Card>
    );
  }
  const getServiceIcon = () => {
    switch (serviceType) {
      case 'vaccination': return <Syringe className="h-5 w-5 text-blue-600" />;
      case 'parasiteControl': return <Bug className="h-5 w-5 text-green-600" />;
      case 'mobileClinic': return <Stethoscope className="h-5 w-5 text-purple-600" />;
      case 'laboratory': return <TestTube className="h-5 w-5 text-orange-600" />;
      case 'equineHealth': return <House className="h-5 w-5 text-red-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getServiceName = () => {
    switch (serviceType) {
      case 'vaccination': return 'التطعيمات';
      case 'parasiteControl': return 'مكافحة الطفيليات';
      case 'mobileClinic': return 'العيادة المتنقلة';
      case 'laboratory': return 'المختبر';
      case 'equineHealth': return 'صحة الخيول';
      default: return 'خدمة غير محددة';
    }
  };

  const renderBasicInfo = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-500" />
          <span className="font-semibold">التاريخ:</span>
          <span>{formatDate(visit.date)}</span>
        </div>
        {visit.serialNo && (
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-purple-500" />
            <span className="font-semibold">الرقم التسلسلي:</span>
            <span className="font-mono">{visit.serialNo}</span>
          </div>
        )}
        {visit.supervisor && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-green-500" />
            <span className="font-semibold">المشرف:</span>
            <span>{visit.supervisor}</span>
          </div>
        )}
        {visit.vehicleNo && (
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-orange-500" />
            <span className="font-semibold">رقم المركبة:</span>
            <span className="font-mono">{visit.vehicleNo}</span>
          </div>
        )}
      </div>
      <div className="space-y-3">
        {visit.farmLocation && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-red-500" />
            <span className="font-semibold">موقع المزرعة:</span>
            <span>{visit.farmLocation}</span>
          </div>
        )}
        {visit.holdingCode && (
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-indigo-500" />
            <span className="font-semibold">رمز الحيازة:</span>
            <span className="font-mono">
              {typeof visit.holdingCode === 'object' 
                ? `${visit.holdingCode.code} - ${visit.holdingCode.village}`
                : visit.holdingCode
              }
            </span>
          </div>
        )}
        {visit.coordinates && (visit.coordinates.latitude || visit.coordinates.longitude) && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-teal-500" />
            <span className="font-semibold">الإحداثيات:</span>
            <span className="font-mono text-xs">
              {visit.coordinates.latitude}, {visit.coordinates.longitude}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const renderVaccinationDetails = () => (
    <div className="space-y-4">
      {visit.vaccineType && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Syringe className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-blue-800">معلومات اللقاح</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">نوع اللقاح:</span> {visit.vaccineType}</div>
            {visit.vaccineCategory && <div><span className="font-medium">فئة اللقاح:</span> {visit.vaccineCategory}</div>}
            {visit.vaccineBatch && <div><span className="font-medium">رقم الدفعة:</span> <span className="font-mono">{visit.vaccineBatch}</span></div>}
            {visit.vaccineManufacturer && <div><span className="font-medium">الشركة المصنعة:</span> {visit.vaccineManufacturer}</div>}
            {visit.expiryDate && <div><span className="font-medium">تاريخ الانتهاء:</span> {formatDate(visit.expiryDate)}</div>}
          </div>
        </div>
      )}

      {/* معلومات التعامل مع الحيوانات */}
      {visit.animalsHandling && (
        <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-cyan-600" />
            <span className="font-semibold text-cyan-800">معلومات التعامل</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">طريقة التعامل:</span> {visit.animalsHandling}
          </div>
        </div>
      )}

      {/* العمالة المستخدمة */}
      {visit.labours && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-amber-600" />
            <span className="font-semibold text-amber-800">العمالة المستخدمة</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">عدد العمال:</span> {visit.labours}
          </div>
        </div>
      )}

      {/* إمكانية الوصول للموقع */}
      {visit.reachableLocation !== undefined && (
        <div className="p-3 bg-lime-50 border border-lime-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-lime-600" />
            <span className="font-semibold text-lime-800">إمكانية الوصول للموقع</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant={visit.reachableLocation ? 'default' : 'destructive'}>
              {visit.reachableLocation ? 'موقع يمكن الوصول إليه' : 'موقع صعب الوصول'}
            </Badge>
          </div>
        </div>
      )}

      {renderHerdCounts()}
    </div>
  );

  const renderParasiteControlDetails = () => (
    <div className="space-y-4">
      {visit.insecticide && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Bug className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-green-800">معلومات المبيد الحشري</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {visit.insecticide.type && <div><span className="font-medium">نوع المبيد:</span> {visit.insecticide.type}</div>}
            {visit.insecticide.method && <div><span className="font-medium">طريقة الاستخدام:</span> {visit.insecticide.method}</div>}
            {visit.insecticide.volume && <div><span className="font-medium">حجم المبيد:</span> {visit.insecticide.volume} لتر</div>}
            {visit.insecticide.status && (
              <div className="flex items-center gap-2">
                <span className="font-medium">حالة الرش:</span>
                <Badge variant={visit.insecticide.status === 'مكتمل' || visit.insecticide.status === 'Completed' ? 'default' : 'secondary'}>
                  {visit.insecticide.status}
                </Badge>
              </div>
            )}
            {visit.insecticide.category && <div><span className="font-medium">فئة المبيد:</span> {visit.insecticide.category}</div>}
          </div>
        </div>
      )}

      {/* حالة مكافحة الطفيليات */}
      {visit.parasiteControlStatus && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-teal-600" />
            <span className="font-semibold text-teal-800">حالة مكافحة الطفيليات</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant={visit.parasiteControlStatus === 'مكتمل' || visit.parasiteControlStatus === 'Completed' ? 'default' : 'secondary'}>
              {visit.parasiteControlStatus}
            </Badge>
          </div>
        </div>
      )}

      {/* حجم مكافحة الطفيليات */}
      {visit.parasiteControlVolume && (
        <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="h-4 w-4 text-cyan-600" />
            <span className="font-semibold text-cyan-800">حجم مكافحة الطفيليات</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">الحجم الإجمالي:</span> {visit.parasiteControlVolume} لتر
          </div>
        </div>
      )}
      
      {/* معلومات الحظيرة */}
      {(visit.animalBarnSize || visit.animalBarnSizeSqM) && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-yellow-600" />
            <span className="font-semibold text-yellow-800">معلومات الحظيرة</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">مساحة الحظيرة:</span> {visit.animalBarnSize || visit.animalBarnSizeSqM} م²
          </div>
        </div>
      )}

      {/* مواقع التكاثر */}
      {visit.breedingSites && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="h-4 w-4 text-purple-600" />
            <span className="font-semibold text-purple-800">مواقع التكاثر للطفيليات</span>
          </div>
          <div className="text-sm">
            {typeof visit.breedingSites === 'string' 
              ? visit.breedingSites 
              : Array.isArray(visit.breedingSites)
                ? visit.breedingSites.map((site: any, index: number) => (
                    <div key={index} className="mb-1 p-2 bg-white rounded border border-purple-100">
                      {typeof site === 'string' ? site : 
                        `${site.type || ''} ${site.area ? `- المساحة: ${site.area} م²` : ''} ${site.treatment ? `- المعالجة: ${site.treatment}` : ''}`
                      }
                    </div>
                  ))
                : 'غير محدد'
            }
          </div>
        </div>
      )}

      {/* حالة القطيع الصحية */}
      {visit.herdHealthStatus && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-rose-600" />
            <span className="font-semibold text-rose-800">الحالة الصحية للقطيع</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant={
              visit.herdHealthStatus === 'Healthy' || visit.herdHealthStatus === 'سليم' 
                ? 'default' 
                : visit.herdHealthStatus === 'Sick' || visit.herdHealthStatus === 'مريض'
                ? 'destructive'
                : 'secondary'
            }>
              {visit.herdHealthStatus === 'Healthy' ? 'سليم' : 
               visit.herdHealthStatus === 'Sick' ? 'مريض' :
               visit.herdHealthStatus === 'Sporadic cases' ? 'حالات متفرقة' :
               visit.herdHealthStatus}
            </Badge>
          </div>
        </div>
      )}

      {/* الامتثال للتعليمات */}
      {visit.complyingToInstructions && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-indigo-600" />
            <span className="font-semibold text-indigo-800">الامتثال للتعليمات</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant={
              visit.complyingToInstructions === 'Comply' || visit.complyingToInstructions === 'ملتزم'
                ? 'default' 
                : visit.complyingToInstructions === 'Not Comply' || visit.complyingToInstructions === 'غير ملتزم'
                ? 'destructive'
                : 'secondary'
            }>
              {visit.complyingToInstructions === 'Comply' ? 'ملتزم' : 
               visit.complyingToInstructions === 'Not Comply' ? 'غير ملتزم' :
               visit.complyingToInstructions === 'Partially Comply' ? 'ملتزم جزئياً' :
               visit.complyingToInstructions}
            </Badge>
          </div>
        </div>
      )}

      {renderHerdCounts()}
    </div>
  );

  const renderMobileClinicDetails = () => (
    <div className="space-y-4">
      {visit.diagnosis && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope className="h-4 w-4 text-purple-600" />
            <span className="font-semibold text-purple-800">التشخيص والعلاج</span>
          </div>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">التشخيص:</span> {visit.diagnosis}</div>
            {visit.interventionCategory && <div><span className="font-medium">فئة التدخل:</span> {visit.interventionCategory}</div>}
            {visit.treatment && <div><span className="font-medium">العلاج:</span> {visit.treatment}</div>}
          </div>
        </div>
      )}
      
      {visit.medication && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Pill className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-blue-800">معلومات الدواء</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {visit.medication.name && <div><span className="font-medium">اسم الدواء:</span> {visit.medication.name}</div>}
            {visit.medication.dosage && <div><span className="font-medium">الجرعة:</span> {visit.medication.dosage}</div>}
            {visit.medication.quantity && <div><span className="font-medium">الكمية:</span> {visit.medication.quantity}</div>}
            {visit.medication.route && <div><span className="font-medium">طريقة الإعطاء:</span> {visit.medication.route}</div>}
            {visit.medication.frequency && <div><span className="font-medium">التكرار:</span> {visit.medication.frequency}</div>}
            {visit.medication.duration && <div><span className="font-medium">المدة:</span> {visit.medication.duration}</div>}
          </div>
        </div>
      )}

      {renderAnimalCounts()}
    </div>
  );

  const renderLaboratoryDetails = () => (
    <div className="space-y-4">
      {visit.sampleCode && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TestTube className="h-4 w-4 text-orange-600" />
            <span className="font-semibold text-orange-800">معلومات العينة</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">رمز العينة:</span> <span className="font-mono">{visit.sampleCode}</span></div>
            {visit.sampleType && <div><span className="font-medium">نوع العينة:</span> {visit.sampleType}</div>}
            {visit.sampleNumber && <div><span className="font-medium">رقم العينة:</span> <span className="font-mono">{visit.sampleNumber}</span></div>}
            {visit.collector && <div><span className="font-medium">جامع العينة:</span> {visit.collector}</div>}
            {visit.collectionDate && <div><span className="font-medium">تاريخ جمع العينة:</span> {formatDate(visit.collectionDate)}</div>}
            {visit.testDate && <div><span className="font-medium">تاريخ الفحص:</span> {formatDate(visit.testDate)}</div>}
          </div>
        </div>
      )}

      {/* نتائج الفحص المفصلة */}
      {(visit.positiveCases !== undefined || visit.negativeCases !== undefined) && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-gray-600" />
            <span className="font-semibold text-gray-800">نتائج الفحص</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span>الحالات الإيجابية: <span className="font-bold text-red-600">{visit.positiveCases || 0}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>الحالات السلبية: <span className="font-bold text-green-600">{visit.negativeCases || 0}</span></span>
            </div>
          </div>
          {(visit.positiveCases || 0) + (visit.negativeCases || 0) > 0 && (
            <div className="text-xs text-gray-600 border-t pt-2">
              إجمالي العينات المفحوصة: {(visit.positiveCases || 0) + (visit.negativeCases || 0)} | 
              نسبة النتائج الإيجابية: {(((visit.positiveCases || 0) / ((visit.positiveCases || 0) + (visit.negativeCases || 0))) * 100).toFixed(1)}%
            </div>
          )}
        </div>
      )}

      {/* نتائج الفحص النصية */}
      {visit.testResults && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-blue-800">نتائج الفحص التفصيلية</span>
          </div>
          <div className="text-sm">
            {visit.testResults}
          </div>
        </div>
      )}

      {/* أنواع أخرى من العينات */}
      {visit.otherSpecies && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TestTube className="h-4 w-4 text-purple-600" />
            <span className="font-semibold text-purple-800">أنواع أخرى من العينات</span>
          </div>
          <div className="text-sm">
            {visit.otherSpecies}
          </div>
        </div>
      )}

      {renderAnimalCounts()}
    </div>
  );

  const renderEquineHealthDetails = () => (
    <div className="space-y-4">
      {visit.horseCount && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <House className="h-4 w-4 text-red-600" />
            <span className="font-semibold text-red-800">معلومات الخيول</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">عدد الخيول:</span> {visit.horseCount}
          </div>
        </div>
      )}

      {visit.horseDetails && visit.horseDetails.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800">تفاصيل الخيول:</h4>
          {visit.horseDetails.map((horse: any, index: number) => (
            <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                {horse.horseId && <div><span className="font-medium">معرف الحصان:</span> {horse.horseId}</div>}
                {horse.breed && <div><span className="font-medium">السلالة:</span> {horse.breed}</div>}
                {horse.age && <div><span className="font-medium">العمر:</span> {horse.age}</div>}
                {horse.gender && <div><span className="font-medium">الجنس:</span> {horse.gender}</div>}
                {horse.color && <div><span className="font-medium">اللون:</span> {horse.color}</div>}
                {horse.healthStatus && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">الحالة الصحية:</span>
                    <Badge variant={horse.healthStatus === 'سليم' ? 'default' : 'destructive'}>
                      {horse.healthStatus}
                    </Badge>
                  </div>
                )}
              </div>
              
              {(horse.weight || horse.temperature || horse.heartRate || horse.respiratoryRate) && (
                <div className="mt-3 pt-3 border-t border-blue-300">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {horse.weight && (
                      <div className="flex items-center gap-1">
                        <Weight className="h-3 w-3 text-blue-600" />
                        <span>الوزن: {horse.weight} كغ</span>
                      </div>
                    )}
                    {horse.temperature && (
                      <div className="flex items-center gap-1">
                        <Thermometer className="h-3 w-3 text-red-600" />
                        <span>الحرارة: {horse.temperature}°</span>
                      </div>
                    )}
                    {horse.heartRate && (
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-pink-600" />
                        <span>النبض: {horse.heartRate}</span>
                      </div>
                    )}
                    {horse.respiratoryRate && (
                      <div className="flex items-center gap-1">
                        <Wind className="h-3 w-3 text-cyan-600" />
                        <span>التنفس: {horse.respiratoryRate}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {visit.diagnosis && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope className="h-4 w-4 text-purple-600" />
            <span className="font-semibold text-purple-800">التشخيص والعلاج</span>
          </div>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">التشخيص:</span> {visit.diagnosis}</div>
            {visit.interventionCategory && <div><span className="font-medium">فئة التدخل:</span> {visit.interventionCategory}</div>}
            {visit.treatment && <div><span className="font-medium">العلاج:</span> {visit.treatment}</div>}
          </div>
        </div>
      )}

      {visit.medication && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Pill className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-green-800">معلومات الدواء</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {visit.medication.name && <div><span className="font-medium">اسم الدواء:</span> {visit.medication.name}</div>}
            {visit.medication.dosage && <div><span className="font-medium">الجرعة:</span> {visit.medication.dosage}</div>}
            {visit.medication.quantity && <div><span className="font-medium">الكمية:</span> {visit.medication.quantity}</div>}
            {visit.medication.route && <div><span className="font-medium">طريقة الإعطاء:</span> {visit.medication.route}</div>}
          </div>
        </div>
      )}

      {(visit.vaccinationStatus || visit.dewormingStatus) && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-yellow-600" />
            <span className="font-semibold text-yellow-800">حالة التطعيم والتدويد</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {visit.vaccinationStatus && (
              <div className="flex items-center gap-2">
                <span className="font-medium">حالة التطعيم:</span>
                <Badge variant={visit.vaccinationStatus === 'محدث' ? 'default' : 'secondary'}>
                  {visit.vaccinationStatus}
                </Badge>
              </div>
            )}
            {visit.dewormingStatus && (
              <div className="flex items-center gap-2">
                <span className="font-medium">حالة التدويد:</span>
                <Badge variant={visit.dewormingStatus === 'محدث' ? 'default' : 'secondary'}>
                  {visit.dewormingStatus}
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderHerdCounts = () => {
    if (!visit.herdCounts) return null;
    
    const animals = ['sheep', 'goats', 'camel', 'cattle', 'horse'];
    const arabicNames = {
      sheep: 'أغنام',
      goats: 'ماعز', 
      camel: 'إبل',
      cattle: 'أبقار',
      horse: 'خيول'
    };

    const hasAnyCounts = animals.some(animal => {
      const counts = visit.herdCounts[animal];
      return counts && (counts.total || counts.young || counts.female || counts.treated || counts.vaccinated);
    });

    if (!hasAnyCounts) return null;

    // حساب الإجماليات
    let totalAnimals = 0;
    let totalYoung = 0;
    let totalFemale = 0;
    let totalTreated = 0;
    let totalVaccinated = 0;

    animals.forEach(animal => {
      const counts = visit.herdCounts[animal];
      if (counts) {
        totalAnimals += counts.total || 0;
        totalYoung += counts.young || 0;
        totalFemale += counts.female || 0;
        totalTreated += counts.treated || 0;
        totalVaccinated += counts.vaccinated || 0;
      }
    });

    return (
      <div className="p-3 bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-300 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-5 w-5 text-blue-600" />
          <span className="font-bold text-gray-800">إحصائيات القطيع التفصيلية</span>
        </div>

        {/* ملخص الإجماليات */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4 p-3 bg-white rounded-lg border-2 border-blue-200">
          <div className="text-center">
            <div className="text-xs text-gray-600">الإجمالي</div>
            <div className="text-lg font-bold text-blue-600">{totalAnimals}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600">الصغار</div>
            <div className="text-lg font-bold text-green-600">{totalYoung}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600">الإناث</div>
            <div className="text-lg font-bold text-pink-600">{totalFemale}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600">المعالج</div>
            <div className="text-lg font-bold text-purple-600">{totalTreated}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600">المطعم</div>
            <div className="text-lg font-bold text-orange-600">{totalVaccinated}</div>
          </div>
        </div>

        {/* تفاصيل كل نوع */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {animals.map(animal => {
            const counts = visit.herdCounts[animal];
            if (!counts || (!counts.total && !counts.young && !counts.female && !counts.treated && !counts.vaccinated)) return null;
            
            return (
              <div key={animal} className="bg-white p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
                <div className="font-bold text-sm mb-2 text-blue-700 border-b pb-1">
                  {arabicNames[animal as keyof typeof arabicNames]}
                </div>
                <div className="text-xs space-y-1.5">
                  {counts.total !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">المجموع:</span>
                      <span className="font-mono font-semibold">{counts.total}</span>
                    </div>
                  )}
                  {counts.young !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">الصغار:</span>
                      <span className="font-mono font-semibold text-green-600">{counts.young}</span>
                    </div>
                  )}
                  {counts.female !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">الإناث:</span>
                      <span className="font-mono font-semibold text-pink-600">{counts.female}</span>
                    </div>
                  )}
                  {counts.treated !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">المعالج:</span>
                      <span className="font-mono font-semibold text-purple-600">{counts.treated}</span>
                    </div>
                  )}
                  {counts.vaccinated !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">المطعم:</span>
                      <span className="font-mono font-semibold text-orange-600">{counts.vaccinated}</span>
                    </div>
                  )}
                </div>
                {/* نسبة مئوية */}
                {counts.total > 0 && (
                  <div className="mt-2 pt-2 border-t text-xs text-gray-500">
                    {totalAnimals > 0 && (
                      <div>نسبة من الإجمالي: {((counts.total / totalAnimals) * 100).toFixed(1)}%</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAnimalCounts = () => {
    if (!visit.animalCounts) return null;
    
    return (
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-4 w-4 text-gray-600" />
          <span className="font-semibold text-gray-800">أعداد الحيوانات</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 text-sm">
          {visit.animalCounts.sheep && <div>أغنام: <span className="font-mono">{visit.animalCounts.sheep}</span></div>}
          {visit.animalCounts.goats && <div>ماعز: <span className="font-mono">{visit.animalCounts.goats}</span></div>}
          {visit.animalCounts.camel && <div>إبل: <span className="font-mono">{visit.animalCounts.camel}</span></div>}
          {visit.animalCounts.cattle && <div>أبقار: <span className="font-mono">{visit.animalCounts.cattle}</span></div>}
          {visit.animalCounts.horse && <div>خيول: <span className="font-mono">{visit.animalCounts.horse}</span></div>}
        </div>
      </div>
    );
  };

  const renderRequestInfo = () => {
    if (!visit.request) return null;
    
    const getStatusBadge = (situation: string) => {
      switch (situation) {
        case 'مكتمل':
        case 'Completed':
          return <Badge className="bg-green-100 text-green-800">مكتمل</Badge>;
        case 'معلق':
        case 'Pending':
          return <Badge className="bg-yellow-100 text-yellow-800">معلق</Badge>;
        case 'قيد التنفيذ':
        case 'In Progress':
          return <Badge className="bg-blue-100 text-blue-800">قيد التنفيذ</Badge>;
        case 'ملغي':
        case 'Cancelled':
          return <Badge className="bg-red-100 text-red-800">ملغي</Badge>;
        default:
          return <Badge variant="outline">{situation}</Badge>;
      }
    };
    
    return (
      <div className="p-3 bg-indigo-50 border-2 border-indigo-200 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-5 w-5 text-indigo-600" />
          <span className="font-bold text-indigo-800">معلومات الطلب والمتابعة</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {visit.request.date && (
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-indigo-500 mt-0.5" />
              <div>
                <span className="font-medium text-gray-700">تاريخ الطلب:</span>
                <div className="text-gray-900">{formatDate(visit.request.date)}</div>
              </div>
            </div>
          )}
          {visit.request.situation && (
            <div className="flex items-start gap-2">
              <Activity className="h-4 w-4 text-indigo-500 mt-0.5" />
              <div>
                <span className="font-medium text-gray-700">حالة الطلب:</span>
                <div className="mt-1">{getStatusBadge(visit.request.situation)}</div>
              </div>
            </div>
          )}
          {visit.request.fulfillingDate && (
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-indigo-500 mt-0.5" />
              <div>
                <span className="font-medium text-gray-700">تاريخ التنفيذ:</span>
                <div className="text-gray-900">{formatDate(visit.request.fulfillingDate)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFollowUp = () => {
    if (!visit.followUpRequired && !visit.followUpDate) return null;
    
    const isOverdue = visit.followUpDate && new Date(visit.followUpDate) < new Date();
    
    return (
      <div className={`p-3 border-2 rounded-lg ${isOverdue ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-300'}`}>
        <div className="flex items-center gap-2 mb-3">
          <Clock className={`h-5 w-5 ${isOverdue ? 'text-red-600' : 'text-yellow-600'}`} />
          <span className={`font-bold ${isOverdue ? 'text-red-800' : 'text-yellow-800'}`}>
            {isOverdue ? '⚠️ متابعة متأخرة' : 'متابعة مطلوبة'}
          </span>
        </div>
        <div className="space-y-2 text-sm">
          {visit.followUpRequired && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">حالة المتابعة:</span>
              <Badge variant={isOverdue ? 'destructive' : 'default'}>
                {isOverdue ? 'متأخرة' : 'نشطة'}
              </Badge>
            </div>
          )}
          {visit.followUpDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-700">موعد المتابعة:</span>
              <span className={`font-mono ${isOverdue ? 'text-red-700 font-bold' : 'text-gray-900'}`}>
                {formatDate(visit.followUpDate)}
              </span>
            </div>
          )}
          {isOverdue && (
            <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-800">
              <AlertTriangle className="h-3 w-3 inline ml-1" />
              هذه المتابعة تجاوزت موعدها المحدد
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getServiceIcon()}
          {getServiceName()} - {visit?.date ? formatDate(visit.date) : 'تاريخ غير محدد'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderBasicInfo()}
        
        {serviceType === 'vaccination' && renderVaccinationDetails()}
        {serviceType === 'parasiteControl' && renderParasiteControlDetails()}
        {serviceType === 'mobileClinic' && renderMobileClinicDetails()}
        {serviceType === 'laboratory' && renderLaboratoryDetails()}
        {serviceType === 'equineHealth' && renderEquineHealthDetails()}
        
        {renderRequestInfo()}
        {renderFollowUp()}
        
        {visit.notes && (
          <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-300 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-gray-700" />
              <span className="font-bold text-gray-800">ملاحظات إضافية</span>
            </div>
            <div className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200 whitespace-pre-wrap leading-relaxed">
              {visit.notes}
            </div>
          </div>
        )}

        {/* ملخص سريع للزيارة */}
        <div className="mt-4 pt-4 border-t-2 border-dashed">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="font-semibold text-blue-700">التاريخ</div>
              <div className="text-gray-600 mt-1">{formatDate(visit.date)}</div>
            </div>
            {visit.supervisor && (
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="font-semibold text-green-700">المشرف</div>
                <div className="text-gray-600 mt-1 truncate">{visit.supervisor}</div>
              </div>
            )}
            {visit.serialNo && (
              <div className="text-center p-2 bg-purple-50 rounded">
                <div className="font-semibold text-purple-700">الرقم التسلسلي</div>
                <div className="text-gray-600 mt-1 font-mono">{visit.serialNo}</div>
              </div>
            )}
            {visit.vehicleNo && (
              <div className="text-center p-2 bg-orange-50 rounded">
                <div className="font-semibold text-orange-700">رقم المركبة</div>
                <div className="text-gray-600 mt-1 font-mono">{visit.vehicleNo}</div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
