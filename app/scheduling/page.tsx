"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Bell,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScheduleDialog } from "./components/schedule-dialog";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { ar } from "date-fns/locale";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { cn } from "@/lib/utils";

interface ScheduleEvent {
  id: string;
  title: string;
  type: "vaccination" | "parasite_control" | "clinic" | "lab" | "meeting" | "other";
  date: Date;
  time: string;
  duration: number; // in minutes
  location: string;
  village?: string;
  assignedTo: string[];
  clientName?: string;
  clientPhone?: string;
  animalCount?: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  priority: "high" | "medium" | "low";
  notes?: string;
  reminder?: boolean;
}

// Mock data
const mockEvents: ScheduleEvent[] = [
  {
    id: "SCH001",
    title: "حملة تحصين - قرية النور",
    type: "vaccination",
    date: new Date(2025, 8, 29),
    time: "09:00",
    duration: 180,
    location: "قرية النور",
    village: "قرية النور",
    assignedTo: ["د. محمد علي", "د. سارة محمود"],
    animalCount: 150,
    status: "scheduled",
    priority: "high",
    reminder: true,
  },
  {
    id: "SCH002",
    title: "مكافحة طفيليات - مزرعة أحمد",
    type: "parasite_control",
    date: new Date(2025, 8, 29),
    time: "14:00",
    duration: 120,
    location: "مزرعة أحمد عبدالله",
    clientName: "أحمد عبدالله",
    clientPhone: "+201015987654",
    assignedTo: ["د. أحمد حسن"],
    animalCount: 80,
    status: "in_progress",
    priority: "medium",
  },
  {
    id: "SCH003",
    title: "عيادة متنقلة - قرية السلام",
    type: "clinic",
    date: new Date(2025, 8, 30),
    time: "10:00",
    duration: 240,
    location: "قرية السلام",
    village: "قرية السلام",
    assignedTo: ["د. فاطمة عبدالله", "د. خالد إبراهيم"],
    status: "scheduled",
    priority: "high",
    reminder: true,
  },
  {
    id: "SCH004",
    title: "جمع عينات للفحص المخبري",
    type: "lab",
    date: new Date(2025, 8, 30),
    time: "08:00",
    duration: 90,
    location: "قرية الأمل",
    village: "قرية الأمل",
    assignedTo: ["د. محمد علي"],
    animalCount: 30,
    status: "scheduled",
    priority: "medium",
  },
  {
    id: "SCH005",
    title: "اجتماع فريق العمل",
    type: "meeting",
    date: new Date(2025, 9, 1),
    time: "16:00",
    duration: 60,
    location: "المكتب الرئيسي",
    assignedTo: ["جميع الأطباء"],
    status: "scheduled",
    priority: "low",
  },
];

const eventTypeColors = {
  vaccination: "bg-blue-100 text-blue-800 border-blue-200",
  parasite_control: "bg-orange-100 text-orange-800 border-orange-200",
  clinic: "bg-green-100 text-green-800 border-green-200",
  lab: "bg-purple-100 text-purple-800 border-purple-200",
  meeting: "bg-gray-100 text-gray-800 border-gray-200",
  other: "bg-pink-100 text-pink-800 border-pink-200",
};

const eventTypeIcons = {
  vaccination: "💉",
  parasite_control: "🦟",
  clinic: "🏥",
  lab: "🔬",
  meeting: "👥",
  other: "📌",
};

const eventTypeLabels = {
  vaccination: "تحصين",
  parasite_control: "مكافحة طفيليات",
  clinic: "عيادة متنقلة",
  lab: "مختبر",
  meeting: "اجتماع",
  other: "أخرى",
};

export default function SchedulingPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState(mockEvents);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
  const [filterType, setFilterType] = useState<string>("all");
  const { checkPermission } = usePermissions();

  // Get week days
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 6 }); // Saturday
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 6 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Filter events
  const filteredEvents = filterType === "all" 
    ? events 
    : events.filter(event => event.type === filterType);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => isSameDay(event.date, date));
  };

  // Get today's events
  const todayEvents = getEventsForDate(new Date());
  const upcomingEvents = filteredEvents
    .filter(event => event.date > new Date() && event.status === "scheduled")
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const handleSaveEvent = (eventData: any) => {
    if (selectedEvent) {
      setEvents(events.map(e => e.id === selectedEvent.id ? { ...eventData, id: selectedEvent.id } : e));
    } else {
      const newEvent = {
        ...eventData,
        id: `SCH${String(events.length + 1).padStart(3, '0')}`,
      };
      setEvents([...events, newEvent]);
    }
    setSelectedEvent(undefined);
  };

  const handleStatusChange = (eventId: string, newStatus: string) => {
    setEvents(events.map(e => 
      e.id === eventId ? { ...e, status: newStatus as any } : e
    ));
  };

  // Calculate statistics
  const totalEvents = events.length;
  const completedEvents = events.filter(e => e.status === "completed").length;
  const inProgressEvents = events.filter(e => e.status === "in_progress").length;
  const cancelledEvents = events.filter(e => e.status === "cancelled").length;
  const completionRate = totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">الجدولة والمواعيد</h1>
            <p className="text-muted-foreground mt-2">
              إدارة وتنظيم المواعيد والزيارات الميدانية
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="ml-2 h-4 w-4" />
              تصفية
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="ml-2 h-4 w-4" />
              التذكيرات
            </Button>
            {checkPermission({ module: 'scheduling', action: 'create' }) && (
              <Button onClick={() => {
                setSelectedEvent(undefined);
                setIsDialogOpen(true);
              }}>
                <Plus className="ml-2 h-4 w-4" />
                إضافة موعد جديد
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                إجمالي المواعيد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEvents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                قيد التنفيذ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{inProgressEvents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                مكتملة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedEvents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                ملغاة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{cancelledEvents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                معدل الإنجاز
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate.toFixed(0)}%</div>
              <Progress value={completionRate} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>التقويم</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">
                      {format(weekStart, "d MMM", { locale: ar })} - {format(weekEnd, "d MMM yyyy", { locale: ar })}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="day">يومي</TabsTrigger>
                    <TabsTrigger value="week">أسبوعي</TabsTrigger>
                    <TabsTrigger value="month">شهري</TabsTrigger>
                  </TabsList>

                  <TabsContent value="week" className="space-y-4">
                    <div className="grid grid-cols-7 gap-2">
                      {weekDays.map((day) => {
                        const dayEvents = getEventsForDate(day);
                        const isCurrentDay = isToday(day);
                        
                        return (
                          <div
                            key={day.toISOString()}
                            className={cn(
                              "border rounded-lg p-2 min-h-[150px]",
                              isCurrentDay && "bg-blue-50 border-blue-300",
                              isSameDay(day, selectedDate) && "ring-2 ring-primary"
                            )}
                          >
                            <div className="text-center mb-2">
                              <div className="text-xs text-muted-foreground">
                                {format(day, "EEEE", { locale: ar })}
                              </div>
                              <div className={cn(
                                "text-lg font-bold",
                                isCurrentDay && "text-blue-600"
                              )}>
                                {format(day, "d")}
                              </div>
                            </div>
                            <ScrollArea className="h-[100px]">
                              <div className="space-y-1">
                                {dayEvents.map((event) => (
                                  <div
                                    key={event.id}
                                    className={cn(
                                      "text-xs p-1 rounded border cursor-pointer hover:opacity-80",
                                      eventTypeColors[event.type]
                                    )}
                                    onClick={() => {
                                      setSelectedEvent(event);
                                      setIsDialogOpen(true);
                                    }}
                                  >
                                    <div className="flex items-center gap-1">
                                      <span>{eventTypeIcons[event.type]}</span>
                                      <span className="truncate">{event.time}</span>
                                    </div>
                                    <div className="truncate font-medium">
                                      {event.title}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="day">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="rounded-md border"
                    />
                    <div className="mt-4 space-y-2">
                      {getEventsForDate(selectedDate).map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow",
                            eventTypeColors[event.type]
                          )}
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsDialogOpen(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{eventTypeIcons[event.type]}</span>
                              <div>
                                <div className="font-medium">{event.title}</div>
                                <div className="text-sm opacity-80">
                                  {event.time} - {event.location}
                                </div>
                              </div>
                            </div>
                            <Badge variant={
                              event.status === "completed" ? "default" :
                              event.status === "in_progress" ? "secondary" :
                              event.status === "cancelled" ? "destructive" :
                              "outline"
                            }>
                              {event.status === "scheduled" && "مجدول"}
                              {event.status === "in_progress" && "قيد التنفيذ"}
                              {event.status === "completed" && "مكتمل"}
                              {event.status === "cancelled" && "ملغي"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {getEventsForDate(selectedDate).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          لا توجد مواعيد في هذا اليوم
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="month">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="rounded-md border w-full"
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">جدول اليوم</CardTitle>
                <CardDescription>
                  {format(new Date(), "EEEE, d MMMM yyyy", { locale: ar })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {todayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsDialogOpen(true);
                        }}
                      >
                        <div className="text-2xl">{eventTypeIcons[event.type]}</div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{event.title}</div>
                          <div className="text-xs text-muted-foreground">
                            <Clock className="inline h-3 w-3 ml-1" />
                            {event.time}
                            <MapPin className="inline h-3 w-3 mr-2 ml-1" />
                            {event.location}
                          </div>
                        </div>
                        {event.status === "in_progress" && (
                          <Badge variant="secondary" className="text-xs">
                            جاري
                          </Badge>
                        )}
                      </div>
                    ))}
                    {todayEvents.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        لا توجد مواعيد اليوم
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">المواعيد القادمة</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px]">
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="border-r-4 pr-3 cursor-pointer hover:bg-muted rounded-lg p-2"
                        style={{ borderColor: eventTypeColors[event.type].split(" ")[0].replace("bg-", "#").replace("-100", "") }}
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsDialogOpen(true);
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-xs">
                            {eventTypeLabels[event.type]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(event.date, "d MMM", { locale: ar })}
                          </span>
                        </div>
                        <div className="font-medium text-sm">{event.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {event.time} - {event.location}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => {
                    setSelectedEvent(undefined);
                    setIsDialogOpen(true);
                  }}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  جدولة موعد جديد
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Bell className="ml-2 h-4 w-4" />
                  إعداد تذكير
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="ml-2 h-4 w-4" />
                  عرض جدول الفريق
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Schedule Dialog */}
        <ScheduleDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          event={selectedEvent}
          onSave={handleSaveEvent}
        />
      </div>
    </MainLayout>
  );
}
