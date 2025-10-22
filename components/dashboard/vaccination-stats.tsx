"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { vaccinationApi } from "@/lib/api/vaccination";
import { Skeleton } from "@/components/ui/skeleton";

interface VaccinationStatsProps {
  startDate?: string;
  endDate?: string;
}

export function VaccinationStats({ startDate, endDate }: VaccinationStatsProps) {
  // Fetch comprehensive statistics
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['vaccination-stats', startDate, endDate],
    queryFn: () => vaccinationApi.getStatistics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch detailed statistics for charts
  const { data: detailedStats, isLoading: detailedLoading, error: detailedError } = useQuery({
    queryKey: ['vaccination-detailed-stats', startDate, endDate],
    queryFn: () => vaccinationApi.getDetailedStatistics({ startDate, endDate }),
    staleTime: 5 * 60 * 1000,
  });

  // Calculate percentage for progress bars
  const calculatePercentage = (count: number) => {
    const totalVaccinated = (detailedStats as any)?.sheepVaccinated + 
                          (detailedStats as any)?.goatsVaccinated + 
                          (detailedStats as any)?.cattleVaccinated + 
                          (detailedStats as any)?.camelVaccinated || 1;
    return Math.min(Math.round((count / totalVaccinated) * 100), 100);
  };

  // Debug: Log the data to console
  console.log('📊 Vaccination Stats Data:', { 
    stats, 
    detailedStats, 
    statsError, 
    detailedError,
    statsLoading, 
    detailedLoading 
  });

  if (statsLoading || detailedLoading) {
    return <VaccinationStatsSkeleton />;
  }

  if (statsError || detailedError) {
    console.error('❌ Error loading vaccination statistics:', { statsError, detailedError });
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Department Dashboard - Vaccination
          </h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">خطأ في تحميل البيانات</h3>
          <p className="text-red-600">
            تعذر تحميل إحصائيات التطعيمات. يرجى المحاولة مرة أخرى.
          </p>
        </div>
      </div>
    );
  }

  const data = stats || {};
  const detailed = detailedStats || {};

  return (
    <div className="space-y-8">
      {/* Main Title */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Department Dashboard - Vaccination
        </h1>
      </div>

      {/* Dashboard Content */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Vaccine Type Statistics - Left Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Vaccinated animals by vaccine type
          </h2>
          <div className="space-y-6">
            <VaccineTypeBar
              label="PPR Vaccine"
              percentage={calculatePercentage((detailed as any).pprVaccinated || 0)}
              count={(detailed as any).pprVaccinated || 0}
              unit="Animals"
            />
            <VaccineTypeBar
              label="FMD Vaccine"
              percentage={calculatePercentage((detailed as any).fmdVaccinated || 0)}
              count={(detailed as any).fmdVaccinated || 0}
              unit="Animals"
            />
            <VaccineTypeBar
              label="ET Vaccine"
              percentage={calculatePercentage((detailed as any).etVaccinated || 0)}
              count={(detailed as any).etVaccinated || 0}
              unit="Animals"
            />
            <VaccineTypeBar
              label="HS Vaccine"
              percentage={calculatePercentage((detailed as any).hsVaccinated || 0)}
              count={(detailed as any).hsVaccinated || 0}
              unit="Animals"
            />
            <VaccineTypeBar
              label="SG Pox Vaccine"
              percentage={calculatePercentage((detailed as any).sgPoxVaccinated || 0)}
              count={(detailed as any).sgPoxVaccinated || 0}
              unit="Animals"
            />
          </div>
        </div>

        {/* Species Statistics - Right Section */}
        <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-blue-600 text-center mb-6">
            Number of Vaccine Doses Given According to Animal Species
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <SpeciesCard
              species="Sheep"
              count={(detailed as any).sheepVaccinated || 0}
              icon="🐑"
            />
            <SpeciesCard
              species="Goat"
              count={(detailed as any).goatsVaccinated || 0}
              icon="🐐"
            />
            <SpeciesCard
              species="Cow"
              count={(detailed as any).cattleVaccinated || 0}
              icon="🐄"
            />
            <SpeciesCard
              species="Camel"
              count={(detailed as any).camelVaccinated || 0}
              icon="🐪"
            />
          </div>
        </div>
      </div>

 
    </div>
  );
}

// Vaccine Type Bar Component
function VaccineTypeBar({ 
  label, 
  percentage, 
  count, 
  unit 
}: { 
  label: string; 
  percentage: number; 
  count: number; 
  unit: string; 
}) {
  // Ensure percentage is at least 2% for visibility, but not more than 100%
  const displayPercentage = Math.max(2, Math.min(percentage, 100));
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-medium text-gray-800">{label}</span>
      </div>
      <div className="relative">
        <div className="h-8 bg-gray-200 rounded-full overflow-hidden flex">
          {/* Golden yellow segment */}
          <div 
            className="bg-yellow-400 h-full flex items-center justify-center"
            style={{ width: `${displayPercentage}%` }}
          >
            <span className="text-xs font-semibold text-gray-800">({displayPercentage}%)</span>
          </div>
          {/* Dark green segment */}
          <div 
            className="bg-green-600 h-full flex items-center justify-center flex-1"
            style={{ width: `${100 - displayPercentage}%` }}
          >
            <span className="text-sm font-bold text-white">({count.toLocaleString()} {unit})</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Species Card Component
function SpeciesCard({ 
  species, 
  count, 
  icon 
}: { 
  species: string; 
  count: number; 
  icon: string; 
}) {
  return (
    <div className="text-center p-4">
      <div className="text-6xl mb-3">{icon}</div>
      <div className="text-3xl font-bold text-gray-800 mb-1">{count.toLocaleString()}</div>
      <div className="text-sm text-gray-600">{species}</div>
    </div>
  );
}

// Loading Skeleton
function VaccinationStatsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <Skeleton className="h-12 w-96 mx-auto" />
      </div>
      
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
          <Skeleton className="h-6 w-64 mx-auto mb-6" />
          <div className="grid grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center p-4">
                <Skeleton className="h-16 w-16 mx-auto mb-3" />
                <Skeleton className="h-8 w-16 mx-auto mb-1" />
                <Skeleton className="h-4 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <Skeleton className="h-6 w-full" />
      </div>
    </div>
  );
}
