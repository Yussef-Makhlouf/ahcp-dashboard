"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { StatsCategoryCard } from "@/components/dashboard/stats-category-card";
import { DonutChart } from "@/components/dashboard/donut-chart";
import { useEffect, useState } from "react";
import { reportsApi } from "@/lib/api/reports";
import type { DashboardStats } from "@/lib/api/reports";
import { 
  Syringe, 
  Heart, 
  Bug, 
  FlaskConical,
  Users,
  MapPin,
  Home as HomeIcon
} from "lucide-react";

// Color scheme matching the image
const COLORS = {
  gold: '#D4AF37',
  darkBrown: '#8B4513',
  darkGreen: '#228B22',
  blue: '#3B82F6',
  red: '#EF4444',
  black: '#000000'
};

// Animal icon components
function AnimalIcon() {
  return (
    <div className="w-6 h-6 bg-amber-200 rounded flex items-center justify-center">
      <span className="text-xs">🐪🐑</span>
    </div>
  );
}

function VaccinatedAnimalsIcon() {
  return (
    <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
      <Syringe className="w-4 h-4 text-green-600" />
    </div>
  );
}

function TreatedAnimalsIcon() {
  return (
    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
      <Heart className="w-4 h-4 text-blue-600" />
    </div>
  );
}

function ParasiteControlIcon() {
  return (
    <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center">
      <Bug className="w-4 h-4 text-red-600" />
    </div>
  );
}

function LabTestedIcon() {
  return (
    <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
      <FlaskConical className="w-4 h-4 text-purple-600" />
    </div>
  );
}

// Category icons
const CategoryIcons = {
  vaccination: <Syringe className="w-8 h-8 text-white" />,
  treatment: <Heart className="w-8 h-8 text-white" />,
  parasiteControl: <Bug className="w-8 h-8 text-white" />,
  laboratory: <FlaskConical className="w-8 h-8 text-white" />
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const stats = await reportsApi.getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      const stats = await reportsApi.getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <div className="space-y-8 p-6">
            {/* Header Skeleton */}
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded-lg w-80 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-96"></div>
            </div>
            
            {/* Stats Cards Skeleton */}
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-white rounded-xl shadow-sm border"></div>
                </div>
              ))}
            </div>
            
            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-96 bg-white rounded-xl shadow-sm border"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Prepare data for charts
  const servedHerdsData = dashboardStats?.comparativeStats?.servedHerds ? [
    { name: 'Vaccinated Herds', value: dashboardStats.comparativeStats.servedHerds.vaccinated, percentage: 34 },
    { name: 'Treated Herds', value: dashboardStats.comparativeStats.servedHerds.treated, percentage: 26 },
    { name: 'Sprayed Herds', value: dashboardStats.comparativeStats.servedHerds.sprayed, percentage: 40 }
  ] : [
    { name: 'Vaccinated Herds', value: 12, percentage: 34 },
    { name: 'Treated Herds', value: 9, percentage: 26 },
    { name: 'Sprayed Herds', value: 14, percentage: 40 }
  ];

  const servedAnimalsData = dashboardStats?.comparativeStats?.servedAnimals ? [
    { name: 'Vaccination', value: dashboardStats.comparativeStats.servedAnimals.vaccination, percentage: 35 },
    { name: 'Treatment', value: dashboardStats.comparativeStats.servedAnimals.treatment, percentage: 23 },
    { name: 'Parasite Control', value: dashboardStats.comparativeStats.servedAnimals.parasiteControl, percentage: 42 }
  ] : [
    { name: 'Vaccination', value: 35, percentage: 35 },
    { name: 'Treatment', value: 23, percentage: 23 },
    { name: 'Parasite Control', value: 42, percentage: 42 }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="space-y-8 p-6">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Main Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Comprehensive animal health statistics and analytics</p>
            </div>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
            >
              <div className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </span>
            </button>
          </div>

          {/* Total Stats Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">Total Stats</h2>
            </div>
          
          {/* Vaccination Stats */}
          <StatsCategoryCard
            title=""
            color={COLORS.gold}
            stats={{
              servedOwners: dashboardStats?.vaccination?.servedOwners || 0,
              visitedVillages: dashboardStats?.vaccination?.visitedVillages || 0,
              visitedHerds: dashboardStats?.vaccination?.visitedHerds || 0,
              animals: dashboardStats?.vaccination?.vaccinatedAnimals || 0
            }}
            icon={<VaccinatedAnimalsIcon />}
            animalLabel="Vaccinated Animals"
            categoryIcon={CategoryIcons.vaccination}
          />

          {/* Treatment Stats */}
          <StatsCategoryCard
            title=""
            color={COLORS.blue}
            stats={{
              servedOwners: dashboardStats?.mobileClinic?.servedOwners || 0,
              visitedVillages: dashboardStats?.mobileClinic?.visitedVillages || 0,
              visitedHerds: dashboardStats?.mobileClinic?.visitedHerds || 0,
              animals: dashboardStats?.mobileClinic?.treatedAnimals || 0
            }}
            icon={<TreatedAnimalsIcon />}
            animalLabel="Treated Animals"
            categoryIcon={CategoryIcons.treatment}
          />

          {/* Parasite Control Stats */}
          <StatsCategoryCard
            title=""
            color={COLORS.red}
            stats={{
              servedOwners: dashboardStats?.parasiteControl?.servedOwners || 0,
              visitedVillages: dashboardStats?.parasiteControl?.visitedVillages || 0,
              visitedHerds: dashboardStats?.parasiteControl?.visitedHerds || 0,
              animals: dashboardStats?.parasiteControl?.treatedAnimals || 0
            }}
            icon={<ParasiteControlIcon />}
            animalLabel="Treated Animals"
            categoryIcon={CategoryIcons.parasiteControl}
          />

          {/* Lab Analysis Stats */}
          <StatsCategoryCard
            title=""
            color={COLORS.black}
            stats={{
              servedOwners: dashboardStats?.laboratory?.servedOwners || 0,
              visitedVillages: dashboardStats?.laboratory?.visitedVillages || 0,
              visitedHerds: dashboardStats?.laboratory?.sampledHerds || 0,
              animals: dashboardStats?.laboratory?.testedAnimals || 0
            }}
            icon={<LabTestedIcon />}
            animalLabel="Tested Animals"
            categoryIcon={CategoryIcons.laboratory}
          />
        </div>

        {/* Enhanced Comparative Stats Section */}
        <div className="space-y-8">
          <div className="flex items-center space-x-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">Comparative Stats</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="transform hover:scale-105 transition-transform duration-300">
              <DonutChart
                title="Number of Served Herds"
                data={servedHerdsData}
                colors={[COLORS.gold, COLORS.darkBrown, COLORS.darkGreen]}
              />
            </div>
            
            <div className="transform hover:scale-105 transition-transform duration-300">
              <DonutChart
                title="Number of Served Animals"
                data={servedAnimalsData}
                colors={[COLORS.gold, COLORS.darkBrown, COLORS.darkGreen]}
              />
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {dashboardStats?.overview?.totalClients?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600 font-medium">Total Clients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {dashboardStats?.overview?.totalAnimals?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600 font-medium">Total Animals</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {dashboardStats?.overview?.totalRecords?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600 font-medium">Total Records</div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </MainLayout>
  );
}