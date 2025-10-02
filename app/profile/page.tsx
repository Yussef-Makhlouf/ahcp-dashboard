"use client";

import React, { useState, useEffect, useRef } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Camera,
  Save,
  Shield,
  Building,
  Upload,
  X,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useTranslation } from "@/lib/use-translation";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department?: string;
  joinDate: string;
  avatar?: string;
}

// Mock data based on user role
const getMockProfile = (role: string, section?: string): UserProfile => {
  const baseProfile = {
    id: "USR001",
    name: "إبراهيم أحمد",
    email: "ibrahim@ahcp.gov.eg",
    phone: "+201234567890",
    joinDate: "2020-03-15",
    avatar: "/placeholder-avatar.jpg",
  };

  switch (role) {
    case "super_admin":
      return {
        ...baseProfile,
        name: "إبراهيم أحمد",
        role: "مدير النظام",
        email: "ibrahim@ahcp.gov.eg",
      };
    case "section_supervisor":
      const departmentNames: { [key: string]: string } = {
        parasite_control: "مكافحة الطفيليات",
        vaccination: "التحصين",
        mobile_clinics: "العيادات المتنقلة",
        equine_health: "صحة الخيول",
        laboratories: "المختبرات",
      };
      return {
        ...baseProfile,
        name: "أحمد محمد",
        role: "مشرف قسم",
        department: departmentNames[section || ""] || "قسم غير محدد",
        email: "ahmed@ahcp.gov.eg",
      };
    case "field_worker":
      return {
        ...baseProfile,
        name: "محمد علي",
        role: "عامل ميداني",
        email: "mohamed@ahcp.gov.eg",
      };
    default:
      return {
        ...baseProfile,
        role: "مستخدم",
      };
  }
};

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize profile based on user data
  useEffect(() => {
    if (user) {
      const mockProfile = getMockProfile(user.role, user.section);
      setProfile(mockProfile);
      setEditedProfile(mockProfile);
    }
  }, [user]);


  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditing(false);
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (editedProfile) {
      setEditedProfile({ ...editedProfile, [field]: value });
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة صالح');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = () => {
    if (editedProfile) {
      const updatedProfile = { ...editedProfile };
      
      // If new image is selected, update avatar
      if (selectedImage && imagePreview) {
        updatedProfile.avatar = imagePreview;
      }
      
      setProfile(updatedProfile);
      // Update user in store
      updateUser({
        name: updatedProfile.name,
        email: updatedProfile.email,
        avatar: updatedProfile.avatar,
      });
      setIsEditing(false);
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  // Check if user can edit (only super_admin)
  const canEdit = user?.role === "super_admin";

  if (!user || !profile) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">جاري تحميل البيانات...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('profile.title')}</h1>
            <p className="text-muted-foreground mt-2">
              {canEdit ? t('profile.subtitle') : t('profile.subtitle')}
            </p>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={handleSaveProfile}>
                    <Save className="ml-2 h-4 w-4" />
                    {t('profile.updateProfile')}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  {t('profile.updateProfile')}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('profile.personalInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={imagePreview || profile.avatar} />
                  <AvatarFallback className="text-2xl">
                    {profile.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                
                {isEditing && canEdit && (
                  <div className="flex flex-col gap-2 mt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleImageUpload}
                      className="w-full"
                    >
                      <Upload className="ml-2 h-4 w-4" />
                      {selectedImage ? "تغيير الصورة" : "رفع صورة"}
                    </Button>
                    
                    {selectedImage && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground truncate max-w-20">
                          {selectedImage.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveImage}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <p className="text-muted-foreground text-lg">{profile.role}</p>
                  {profile.department && (
                    <div className="flex items-center gap-2 mt-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{profile.department}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      انضم في {new Date(profile.joinDate).toLocaleDateString("ar")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  البريد الإلكتروني
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    value={editedProfile?.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">{profile.email}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  رقم الهاتف
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={editedProfile?.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">{profile.phone}</div>
                )}
              </div>
            </div>

            {/* Role and Permissions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">الصلاحيات والصلاحية</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>المنصب</Label>
                  <div className="p-3 bg-muted rounded-md flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    {profile.role}
                  </div>
                </div>

                {profile.department && (
                  <div className="space-y-2">
                    <Label>القسم</Label>
                    <div className="p-3 bg-muted rounded-md flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      {profile.department}
                    </div>
                  </div>
                )}
              </div>

              {/* Permission Notice */}
              {!canEdit && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      يمكنك فقط عرض معلوماتك. للتعديل، يرجى التواصل مع مدير النظام.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
