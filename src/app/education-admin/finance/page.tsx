'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    CreditCard,
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingCart,
    Calendar,
    Download,
    Filter,
    Search,
    ArrowUpRight,
    ArrowDownRight,
    BookOpen,
    GraduationCap,
    FileText,
    Clock
} from 'lucide-react';
import { Input } from '@/components/ui/input';

// Data will come from Firestore orders collection once orders are placed
const EMPTY_STATS = {
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalOrders: 0,
    monthlyOrders: 0,
    averageOrderValue: 0,
    revenueChange: 0,
    ordersChange: 0,
};

export default function FinancePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [transactions, setTransactions] = useState<any[]>([]);

    const filteredTransactions = transactions.filter(t =>
        t.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.items.some((item: string) => item.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'BOOK': return <BookOpen className="w-4 h-4" />;
            case 'COURSE': return <GraduationCap className="w-4 h-4" />;
            case 'EXAM': return <FileText className="w-4 h-4" />;
            default: return <ShoppingCart className="w-4 h-4" />;
        }
    };

    const getTypeBadgeColor = (type: string) => {
        switch (type) {
            case 'BOOK': return 'bg-amber-100 text-amber-700';
            case 'COURSE': return 'bg-purple-100 text-purple-700';
            case 'EXAM': return 'bg-blue-100 text-blue-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-emerald-100 text-emerald-700 border-0">สำเร็จ</Badge>;
            case 'pending':
                return <Badge className="bg-amber-100 text-amber-700 border-0">รอดำเนินการ</Badge>;
            case 'failed':
                return <Badge className="bg-red-100 text-red-700 border-0">ล้มเหลว</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">การเงิน</h1>
                    <p className="text-slate-500">รายงานยอดขายและประวัติการชำระเงิน</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        มกราคม 2026
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        ส่งออก
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">รายได้รวมทั้งหมด</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    ฿{EMPTY_STATS.totalRevenue.toLocaleString()}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">รายได้เดือนนี้</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    ฿{EMPTY_STATS.monthlyRevenue.toLocaleString()}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                    <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                                    <span className="text-xs text-emerald-600 font-medium">
                                        +{EMPTY_STATS.revenueChange}%
                                    </span>
                                    <span className="text-xs text-slate-400">vs เดือนก่อน</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">คำสั่งซื้อทั้งหมด</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {EMPTY_STATS.totalOrders}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">ยอดเฉลี่ยต่อคำสั่งซื้อ</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    ฿{EMPTY_STATS.averageOrderValue.toLocaleString()}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Chart & Recent Transactions */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Monthly Revenue */}
                <Card className="lg:col-span-1 border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">รายได้รายเดือน</CardTitle>
                        <CardDescription>6 เดือนล่าสุด</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {([] as { month: string; revenue: number; orders: number }[]).map((data, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                                <div className="w-12 text-sm text-slate-500 font-medium">{data.month}</div>
                                <div className="flex-1">
                                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                            style={{ width: `${(data.revenue / 35000) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="w-20 text-right text-sm font-medium text-slate-700">
                                    ฿{(data.revenue / 1000).toFixed(1)}k
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Transactions Table */}
                <Card className="lg:col-span-2 border-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">รายการธุรกรรมล่าสุด</CardTitle>
                            <CardDescription>ประวัติการชำระเงินทั้งหมด</CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="ค้นหาธุรกรรม..."
                                className="pl-9 h-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {filteredTransactions.map((txn) => (
                                <div
                                    key={txn.id}
                                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeBadgeColor(txn.type)}`}>
                                        {getTypeIcon(txn.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-900 truncate">
                                                {txn.customer}
                                            </span>
                                            <span className="text-xs text-slate-400">{txn.id}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 truncate">
                                            {txn.items.join(', ')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900">฿{txn.amount.toLocaleString()}</p>
                                        <p className="text-xs text-slate-400">
                                            {txn.date.toLocaleDateString('th-TH')}
                                        </p>
                                    </div>
                                    <div className="w-24">
                                        {getStatusBadge(txn.status)}
                                    </div>
                                </div>
                            ))}

                            {filteredTransactions.length === 0 && (
                                <div className="text-center py-8 text-slate-500">
                                    ไม่พบรายการธุรกรรม
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex justify-center">
                            <Button variant="outline" className="gap-2">
                                ดูทั้งหมด
                                <ArrowUpRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue by Product Type */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">รายได้แยกตามประเภทสินค้า</CardTitle>
                    <CardDescription>สัดส่วนรายได้จากแต่ละประเภท</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-amber-600 font-medium">หนังสือ</p>
                                <p className="text-2xl font-bold text-slate-900">฿42,500</p>
                                <p className="text-xs text-slate-500">34% ของรายได้ทั้งหมด</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <GraduationCap className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-purple-600 font-medium">คอร์สเรียน</p>
                                <p className="text-2xl font-bold text-slate-900">฿65,000</p>
                                <p className="text-xs text-slate-500">52% ของรายได้ทั้งหมด</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-600 font-medium">ข้อสอบ</p>
                                <p className="text-2xl font-bold text-slate-900">฿18,250</p>
                                <p className="text-xs text-slate-500">14% ของรายได้ทั้งหมด</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
