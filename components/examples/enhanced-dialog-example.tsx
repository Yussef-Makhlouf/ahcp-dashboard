"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function EnhancedDialogExample() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>فتح النموذج المحسن</Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>نموذج محسن</DialogTitle>
          <DialogDescription>
            هذا مثال على النموذج المحسن مع التصميم الحديث
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-4">
            <div className="form-group">
              <Label htmlFor="name" className="form-label">الاسم</Label>
              <Input
                id="name"
                placeholder="أدخل الاسم"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <Label htmlFor="email" className="form-label">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="أدخل البريد الإلكتروني"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <Label htmlFor="message" className="form-label">الرسالة</Label>
              <Textarea
                id="message"
                placeholder="أدخل رسالتك هنا"
                className="form-input"
                rows={3}
              />
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button onClick={() => setOpen(false)}>
            حفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Example with hidden title for accessibility
export function DialogWithHiddenTitle() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">نموذج بعنوان مخفي</Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-sm" hideTitle>
        <DialogBody className="text-center py-8">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-primary">تم بنجاح!</h3>
            <p className="text-secondary">تم حفظ البيانات بنجاح</p>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button onClick={() => setOpen(false)} className="w-full">
            موافق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
