"use client";

import Image from "next/image";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Syringe, 
  Bug, 
  Truck, 
  Heart, 
  FlaskConical,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react";
import { useEffect, useState } from "react";
import { mockLogin } from "@/lib/store/auth-store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const stats = [
  {
    title: "إجمالي المربيين",
    value: "1,234",
    change: "+12%",
    trend: "up",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "التحصينات هذا الشهر",
    value: "456",
    change: "+8%",
    trend: "up",
    icon: Syringe,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "مكافحة الطفيليات",
    value: "789",
    change: "-3%",
    trend: "down",
    icon: Bug,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    title: "العيادات المتنقلة",
    value: "321",
    change: "+15%",
    trend: "up",
    icon: Truck,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
];

const monthlyData = [
  { month: "يناير", parasite: 65, vaccination: 45, clinic: 30 },
  { month: "فبراير", parasite: 78, vaccination: 52, clinic: 35 },
  { month: "مارس", parasite: 90, vaccination: 61, clinic: 42 },
  { month: "أبريل", parasite: 81, vaccination: 58, clinic: 38 },
  { month: "مايو", parasite: 95, vaccination: 70, clinic: 45 },
  { month: "يونيو", parasite: 88, vaccination: 65, clinic: 40 },
];

const animalDistribution = [
  { name: "أغنام", value: 450, color: "#3B82F6" },
  { name: "ماعز", value: 320, color: "#10B981" },
  { name: "إبل", value: 150, color: "#F59E0B" },
  { name: "أبقار", value: 180, color: "#8B5CF6" },
  { name: "خيول", value: 100, color: "#EF4444" },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Auto login for development
    mockLogin("super_admin");
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-2">
            مرحباً بك في نظام إدارة صحة الحيوان AHCP
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
            
            return (
              <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.bgColor} p-2 rounded-lg`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center text-xs mt-2">
                    <TrendIcon
                      className={`h-3 w-3 ml-1 ${
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    />
                    <span
                      className={
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }
                    >
                      {stat.change}
                    </span>
                    <span className="text-muted-foreground mr-2">
                      مقارنة بالشهر الماضي
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>النشاط الشهري</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="parasite" fill="#d99e1a" name="مكافحة طفيليات" />
                  <Bar dataKey="vaccination" fill="#3B82F6" name="تحصينات" />
                  <Bar dataKey="clinic" fill="#10B981" name="عيادات متنقلة" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Animal Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>توزيع الحيوانات</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={animalDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {animalDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              النشاط الأخير
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: "تحصين قطيع",
                  owner: "أحمد محمد",
                  time: "منذ 5 دقائق",
                  status: "success",
                },
                {
                  action: "مكافحة طفيليات",
                  owner: "فاطمة علي",
                  time: "منذ 15 دقيقة",
                  status: "success",
                },
                {
                  action: "فحص مخبري",
                  owner: "محمود سيد",
                  time: "منذ ساعة",
                  status: "pending",
                },
                {
                  action: "عيادة متنقلة",
                  owner: "سارة أحمد",
                  time: "منذ ساعتين",
                  status: "success",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        activity.status === "success"
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.owner}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
