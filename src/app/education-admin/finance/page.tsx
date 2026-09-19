'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    CreditCard,
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Calendar,
    Download,
    Search,
    BookOpen,
    GraduationCap,
    FileText,
    Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface OrderData {
    id: string;
    customer: string;
    email: string;
    items: string[];
    type: string;
    amount: number;
    status: string;
    date: string;
}

export default function FinancePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [approvingId, setApprovingId] = useState<string | null>(null);

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/education/orders?all=true');
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    setOrders(data.map((o: any) => ({
                        id: o.id || '',
                        customer: o.userName || o.customer || 'ไม่ระบุ',
                        email: o.userEmail || o.email || '',
                        items: o.items?.map((i: any) => i.title || i.name || '') || [],
                        type: o.type || o.items?.[0]?.type || 'OTHER',
                        amount: o.totalAmount || o.amount || 0,
                        status: o.status || 'PENDING',
                        date: o.createdAt || '',
                    })));
                }
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const approveOrder = async (orderId: string) => {
        setApprovingId(orderId);
        try {
            const response = await fetch(`/api/education/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'PAID' }),
            });
            if (response.ok) {
                await fetchOrders();
            }
        } catch (error) {
            console.error('Error approving order:', error);
        } finally {
            setApprovingId(null);
        }
    };

    const completedOrders = orders.filter(o => o.status === 'PAID' || o.status === 'COMPLETED');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.amount, 0);
    const totalOrders = orders.length;

    // Revenue by type
    const bookRevenue = completedOrders.filter(o => o.type === 'BOOK').reduce((s, o) => s + o.amount, 0);
    const courseRevenue = completedOrders.filter(o => o.type === 'COURSE').reduce((s, o) => s + o.amount, 0);
    const examRevenue = completedOrders.filter(o => o.type === 'EXAM').reduce((s, o) => s + o.amount, 0);

    const calcPercent = (val: number) => totalRevenue > 0 ? Math.round((val / totalRevenue) * 100) : 0;

    const filteredOrders = orders.filter(o =>
        searchQuery === '' ||
        o.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.items.some(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED': case 'PAID':
                return <Badge className="bg-emerald-100 text-emerald-700 border-0">สำเร็จ</Badge>;
            case 'PENDING':
                return <Badge className="bg-amber-100 text-amber-700 border-0">รอดำเนินการ</Badge>;
            case 'SHIPPING':
                return <Badge className="bg-sky-100 text-sky-700 border-0">กำลังจัดส่ง</Badge>;
            case 'REJECTED': case 'FAILED': case 'CANCELLED':
                return <Badge className="bg-red-100 text-red-700 border-0">ล้มเหลว</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatCurrency = (amount: number) => `฿${amount.toLocaleString()}`;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

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
                        {new Date().toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                    </Button>
                    <Button variant="outline" className="gap-2" disabled>
                        <Download className="w-4 h-4" />
                        ส่งออก
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">รายได้รวมทั้งหมด</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">{formatCurrency(totalRevenue)}</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">คำสั่งซื้อทั้งหมด</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">{totalOrders}</p>
                            </div>
                            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-sky-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">คำสั่งซื้อสำเร็จ</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">{completedOrders.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">ยอดเฉลี่ยต่อคำสั่งซื้อ</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                    {formatCurrency(completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">รายการธุรกรรมล่าสุด</CardTitle>
                            <CardDescription>ประวัติการชำระเงินทั้งหมด</CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="ค้นหาธุรกรรม..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>ไม่พบรายการธุรกรรม</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>ลูกค้า</TableHead>
                                    <TableHead>รายการ</TableHead>
                                    <TableHead>จำนวนเงิน</TableHead>
                                    <TableHead>สถานะ</TableHead>
                                    <TableHead>วันที่</TableHead>
                                    <TableHead className="text-right">ดำเนินการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.slice(0, 50).map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono text-sm text-slate-500">
                                            {order.id.substring(0, 8)}...
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-slate-900">{order.customer}</p>
                                                <p className="text-xs text-slate-400">{order.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-600">
                                            {order.items.join(', ').substring(0, 40) || '-'}
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            {formatCurrency(order.amount)}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                                        <TableCell className="text-sm text-slate-500">
                                            {order.date ? new Date(order.date).toLocaleDateString('th-TH') : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {order.status === 'PENDING' && (
                                                <Button
                                                    size="sm"
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                    disabled={approvingId === order.id}
                                                    onClick={() => approveOrder(order.id)}
                                                >
                                                    {approvingId === order.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        'อนุมัติ'
                                                    )}
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Revenue by Product Type — real data */}
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
                                <p className="text-2xl font-bold text-slate-900">{formatCurrency(bookRevenue)}</p>
                                <p className="text-xs text-slate-500">{calcPercent(bookRevenue)}% ของรายได้ทั้งหมด</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <GraduationCap className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-purple-600 font-medium">คอร์สเรียน</p>
                                <p className="text-2xl font-bold text-slate-900">{formatCurrency(courseRevenue)}</p>
                                <p className="text-xs text-slate-500">{calcPercent(courseRevenue)}% ของรายได้ทั้งหมด</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-600 font-medium">ข้อสอบ</p>
                                <p className="text-2xl font-bold text-slate-900">{formatCurrency(examRevenue)}</p>
                                <p className="text-xs text-slate-500">{calcPercent(examRevenue)}% ของรายได้ทั้งหมด</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
