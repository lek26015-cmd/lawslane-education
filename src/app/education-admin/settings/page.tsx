'use client';

import React from 'react';
import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">ตั้งค่าระบบ</h1>
                <p className="text-slate-500">จัดการการตั้งค่าทั่วไปของระบบ Education</p>
            </div>

            <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center">
                <div className="w-16 h-16 bg-slate-50 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">ส่วนตั้งค่าระบบ</h3>
                <p className="text-slate-500">ฟีเจอร์นี้อยู่ระหว่างการพัฒนา</p>
            </div>
        </div>
    );
}
