'use client';

import React from 'react';
import { Users } from 'lucide-react';

export default function AdminUsersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">ผู้ใช้งาน</h1>
                <p className="text-slate-500">จัดการข้อมูลสมาชิกและสิทธิ์การใช้งาน</p>
            </div>

            <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">ส่วนจัดการผู้ใช้งาน</h3>
                <p className="text-slate-500">ฟีเจอร์นี้อยู่ระหว่างการพัฒนา</p>
            </div>
        </div>
    );
}
