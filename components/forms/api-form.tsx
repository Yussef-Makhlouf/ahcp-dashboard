"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'date' | 'file' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: z.ZodSchema<any>;
  disabled?: boolean;
  description?: string;
  multiple?: boolean; // for select and file inputs
  accept?: string; // for file inputs
}

interface ApiFormProps<T> {
  // API functions
  createItem?: (data: any) => Promise<T>;
  updateItem?: (id: string | number, data: any) => Promise<T>;
  
  // Form configuration
  fields: FormField[];
  title: string;
  queryKey: string;
  
  // Form state
  isOpen: boolean;
  onClose: () => void;
  editData?: T | null;
  
  // Optional props
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  submitButtonText?: string;
  cancelButtonText?: string;
  
  // Custom validation schema
  validationSchema?: z.ZodSchema<any>;
}

export function ApiForm<T extends { id?: string | number; _id?: string }>({
  createItem,
  updateItem,
  fields,
  title,
  queryKey,
  isOpen,
  onClose,
  editData,
  onSuccess,
  onError,
  submitButtonText = "حفظ",
  cancelButtonText = "إلغاء",
  validationSchema
}: ApiFormProps<T>) {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>({});
  const queryClient = useQueryClient();
  const isEditing = !!editData;

  // Create dynamic validation schema if not provided
  const defaultSchema = z.object(
    fields.reduce((acc, field) => {
      let fieldSchema: z.ZodSchema<any> = z.any();
      
      switch (field.type) {
        case 'email':
          fieldSchema = z.string().email('البريد الإلكتروني غير صحيح');
          break;
        case 'number':
          fieldSchema = z.number().min(0, 'يجب أن يكون الرقم أكبر من أو يساوي 0');
          break;
        case 'text':
        case 'textarea':
          fieldSchema = z.string();
          break;
        case 'date':
          fieldSchema = z.date();
          break;
        case 'select':
          fieldSchema = z.string();
          break;
        case 'checkbox':
          fieldSchema = z.boolean();
          break;
        default:
          fieldSchema = z.any();
      }
      
      if (field.required) {
        fieldSchema = fieldSchema.refine(val => val !== undefined && val !== null && val !== '', {
          message: `${field.label} مطلوب`
        });
      } else {
        fieldSchema = fieldSchema.optional();
      }
      
      if (field.validation) {
        fieldSchema = field.validation;
      }
      
      acc[field.name] = fieldSchema;
      return acc;
    }, {} as Record<string, z.ZodSchema<any>>)
  );

  const schema = validationSchema || defaultSchema;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: editData || {}
  });

  // Reset form when editData changes
  useEffect(() => {
    if (editData) {
      reset(editData);
    } else {
      reset({});
    }
    setUploadedFiles({});
  }, [editData, reset]);

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      
      // Add regular form data
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          if (data[key] instanceof Date) {
            formData.append(key, data[key].toISOString());
          } else {
            formData.append(key, data[key].toString());
          }
        }
      });
      
      // Add uploaded files
      Object.keys(uploadedFiles).forEach(fieldName => {
        uploadedFiles[fieldName].forEach(file => {
          formData.append(fieldName, file);
        });
      });
      
      if (isEditing && updateItem) {
        const id = editData!.id || editData!._id!;
        return updateItem(id, formData);
      } else if (createItem) {
        return createItem(formData);
      }
      throw new Error('No API function provided');
    },
    onSuccess: (data) => {
      toast.success(isEditing ? 'تم التحديث بنجاح' : 'تم الإنشاء بنجاح');
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      onSuccess?.(data);
      onClose();
      reset();
      setUploadedFiles({});
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'حدث خطأ';
      toast.error(message);
      onError?.(error);
    }
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  const handleFileChange = (fieldName: string, files: FileList | null) => {
    if (files) {
      setUploadedFiles(prev => ({
        ...prev,
        [fieldName]: Array.from(files)
      }));
    }
  };

  const renderField = (field: FormField) => {
    const error = errors[field.name];
    
    return (
      <div key={field.name} className="space-y-2">
        <Label htmlFor={field.name} className="text-right">
          {field.label}
          {field.required && <span className="text-red-500 mr-1">*</span>}
        </Label>
        
        <Controller
          name={field.name}
          control={control}
          render={({ field: { onChange, value, ...fieldProps } }) => {
            switch (field.type) {
              case 'textarea':
                return (
                  <Textarea
                    {...fieldProps}
                    value={value || ''}
                    onChange={onChange}
                    placeholder={field.placeholder}
                    disabled={field.disabled || isSubmitting}
                    className={error ? 'border-red-500' : ''}
                  />
                );
                
              case 'select':
                return (
                  <Select
                    value={value || ''}
                    onValueChange={onChange}
                    disabled={field.disabled || isSubmitting}
                  >
                    <SelectTrigger className={error ? 'border-red-500' : ''}>
                      <SelectValue placeholder={field.placeholder || `اختر ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
                
              case 'date':
                return (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-right ${error ? 'border-red-500' : ''}`}
                        disabled={field.disabled || isSubmitting}
                      >
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {value ? format(new Date(value), 'PPP', { locale: ar }) : field.placeholder || 'اختر التاريخ'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={value ? new Date(value) : undefined}
                        onSelect={onChange}
                        disabled={field.disabled || isSubmitting}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                );
                
              case 'file':
                return (
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept={field.accept}
                      multiple={field.multiple}
                      onChange={(e) => handleFileChange(field.name, e.target.files)}
                      disabled={field.disabled || isSubmitting}
                      className={error ? 'border-red-500' : ''}
                    />
                    {uploadedFiles[field.name] && (
                      <div className="flex flex-wrap gap-2">
                        {uploadedFiles[field.name].map((file, index) => (
                          <Badge key={index} variant="secondary">
                            {file.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
                
              case 'checkbox':
                return (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...fieldProps}
                      checked={value || false}
                      onChange={(e) => onChange(e.target.checked)}
                      disabled={field.disabled || isSubmitting}
                      className="rounded"
                    />
                    <span className="text-sm">{field.description}</span>
                  </div>
                );
                
              case 'number':
                return (
                  <Input
                    {...fieldProps}
                    type="number"
                    value={value || ''}
                    onChange={(e) => onChange(Number(e.target.value))}
                    placeholder={field.placeholder}
                    disabled={field.disabled || isSubmitting}
                    className={error ? 'border-red-500' : ''}
                  />
                );
                
              default:
                return (
                  <Input
                    {...fieldProps}
                    type={field.type}
                    value={value || ''}
                    onChange={onChange}
                    placeholder={field.placeholder}
                    disabled={field.disabled || isSubmitting}
                    className={error ? 'border-red-500' : ''}
                  />
                );
            }
          }}
        />
        
        {field.description && field.type !== 'checkbox' && (
          <p className="text-sm text-gray-500">{field.description}</p>
        )}
        
        {error && (
          <p className="text-sm text-red-500">{error.message as string}</p>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right">
            {isEditing ? `تعديل ${title}` : `إضافة ${title} جديد`}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 py-4">
            {fields.map(renderField)}
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              {cancelButtonText}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'جاري الحفظ...' : submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ApiForm;
