'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Truck,
    Package,
    Search,
    Filter,
    MoreHorizontal,
    MapPin,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    Printer,
    ArrowRight
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Copy } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// Mock Data
const MOCK_SHIPMENTS = [
    {
        id: 'ORD-2024-001',
        customer: 'สมชาย รักเรียน',
        items: [
            { name: 'คู่มือเตรียมสอบใบอนุญาตว่าความ', quantity: 1 },
            { name: 'รวมข้อสอบตั๋วทนาย 10 ปี', quantity: 1 }
        ],
        address: '123 ถ.สุขุมวิท แขวงคลองตันเหนือ เขตวัฒนา กทม. 10110',
        status: 'pending', // pending, shipping, delivered, returned
        date: '2024-01-14',
        courier: null,
        trackingNo: null,
    },
    {
        id: 'ORD-2024-002',
        customer: 'วิภา สุขใจ',
        items: [
            { name: 'หนังสือสรุปกฎหมายแพ่ง', quantity: 1 }
        ],
        address: '456 ถ.พหลโยธิน แขวงสามเสนใน เขตพญาไท กทม. 10400',
        status: 'shipping',
        date: '2024-01-13',
        courier: 'Kerry Express',
        trackingNo: 'KEA123456789',
    },
    {
        id: 'ORD-2024-003',
        customer: 'กิตติ พัฒนา',
        items: [
            { name: 'เทคนิคการร่างฟ้อง', quantity: 1 }
        ],
        address: '789 ถ.ลาดพร้าว แขวงจอมพล เขตจตุจักร กทม. 10900',
        status: 'delivered',
        date: '2024-01-12',
        courier: 'Flash Express',
        trackingNo: 'TH0123456789',
    },
    {
        id: 'ORD-2024-004',
        customer: 'มานี มีใจ',
        items: [
            { name: 'ประมวลกฎหมายอาญา ฉบับพกพา', quantity: 2 }
        ],
        address: '101/1 หมู่ 5 ต.สุเทพ อ.เมือง จ.เชียงใหม่ 50200',
        status: 'pending',
        date: '2024-01-14',
        courier: null,
        trackingNo: null,
    },
    {
        id: 'ORD-2024-005',
        customer: 'ปิติ ยินดี',
        items: [
            { name: 'คู่มือสอบอัยการผู้ช่วย', quantity: 1 }
        ],
        address: '999 ถ.มิตรภาพ ต.ในเมือง อ.เมือง จ.ขอนแก่น 40000',
        status: 'returned',
        date: '2024-01-10',
        courier: 'Thailand Post',
        trackingNo: 'EF123456789TH',
    }
];

export default function ShippingPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedShipment, setSelectedShipment] = useState<typeof MOCK_SHIPMENTS[0] | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Open dialog when shipment is selected
    const handleSelectShipment = (shipment: typeof MOCK_SHIPMENTS[0]) => {
        setSelectedShipment(shipment);
        setIsDetailsOpen(true);
    };

    const filteredShipments = MOCK_SHIPMENTS.filter(shipment => {
        const matchesSearch =
            shipment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shipment.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shipment.trackingNo?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTab = activeTab === 'all' || shipment.status === activeTab;

        return matchesSearch && matchesTab;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-amber-100 text-amber-700 border-0 hover:bg-amber-200">รอดำเนินการ</Badge>;
            case 'shipping':
                return <Badge className="bg-blue-100 text-blue-700 border-0 hover:bg-blue-200">กำลังจัดส่ง</Badge>;
            case 'delivered':
                return <Badge className="bg-emerald-100 text-emerald-700 border-0 hover:bg-emerald-200">จัดส่งสำเร็จ</Badge>;
            case 'returned':
                return <Badge className="bg-red-100 text-red-700 border-0 hover:bg-red-200">ตีกลับ</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">การจัดส่งสินค้า</h1>
                    <p className="text-slate-500">จัดการรายการสั่งซื้อและสถานะการจัดส่ง</p>
                </div>
                <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Printer className="w-4 h-4" />
                    พิมพ์ใบจ่าหน้า (Batch Print)
                </Button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm bg-indigo-50">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-indigo-600">รอจัดส่ง</p>
                            <p className="text-2xl font-bold text-indigo-900">
                                {MOCK_SHIPMENTS.filter(s => s.status === 'pending').length}
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-sm">
                            <Clock className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-blue-50">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600">กำลังจัดส่ง</p>
                            <p className="text-2xl font-bold text-blue-900">
                                {MOCK_SHIPMENTS.filter(s => s.status === 'shipping').length}
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                            <Truck className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-emerald-50">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-emerald-600">สำเร็จแล้ว</p>
                            <p className="text-2xl font-bold text-emerald-900">
                                {MOCK_SHIPMENTS.filter(s => s.status === 'delivered').length}
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-red-50">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-600">ตีกลับ/ยกเลิก</p>
                            <p className="text-2xl font-bold text-red-900">
                                {MOCK_SHIPMENTS.filter(s => s.status === 'returned').length}
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-600 shadow-sm">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-md overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100 pb-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                            <TabsList className="grid w-full md:w-auto grid-cols-4 bg-slate-100">
                                <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
                                <TabsTrigger value="pending">รอจัดส่ง</TabsTrigger>
                                <TabsTrigger value="shipping">ระหว่างส่ง</TabsTrigger>
                                <TabsTrigger value="delivered">สำเร็จ</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="ค้นหา Order ID, ลูกค้า..."
                                className="pl-9 bg-slate-50 border-slate-200"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Order ID / ลูกค้า</th>
                                    <th className="px-6 py-4 font-semibold">สินค้า</th>
                                    <th className="px-6 py-4 font-semibold">ที่อยู่จัดส่ง</th>
                                    <th className="px-6 py-4 font-semibold">การจัดส่ง</th>
                                    <th className="px-6 py-4 font-semibold">สถานะ</th>
                                    <th className="px-6 py-4 font-semibold text-right">ดำเนินการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredShipments.length > 0 ? (
                                    filteredShipments.map((shipment) => (
                                        <tr
                                            key={shipment.id}
                                            className="bg-white hover:bg-slate-50/50 transition-colors cursor-pointer group"
                                            onClick={() => handleSelectShipment(shipment)}
                                        >
                                            <td className="px-6 py-4 align-top">
                                                <div className="font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors">{shipment.id}</div>
                                                <div className="text-slate-900 font-medium mt-1">{shipment.customer}</div>
                                                <div className="text-slate-400 text-xs mt-1">{shipment.date}</div>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <div className="space-y-1">
                                                    {shipment.items.map((item, idx) => (
                                                        <div key={idx} className="flex items-center text-slate-600">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></div>
                                                            <span className="truncate max-w-[180px]">{item.name}</span>
                                                            <span className="text-slate-400 text-xs ml-1">x{item.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 align-top max-w-[250px]">
                                                <div className="flex items-start gap-2 text-slate-600">
                                                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                                    <span className="text-xs leading-relaxed line-clamp-2">{shipment.address}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                {shipment.courier ? (
                                                    <div>
                                                        <div className="font-medium text-slate-900">{shipment.courier}</div>
                                                        <div className="text-slate-500 text-xs font-mono mt-1 bg-slate-100 px-2 py-0.5 rounded inline-block">
                                                            {shipment.trackingNo}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic text-xs">- ยังไม่ระบุ -</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                {getStatusBadge(shipment.status)}
                                            </td>
                                            <td className="px-6 py-4 align-top text-right" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="w-4 h-4 text-slate-400" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>จัดการคำสั่งซื้อ</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => window.print()}>
                                                            <Printer className="w-4 h-4 mr-2" />
                                                            พิมพ์ใบจ่าหน้า
                                                        </DropdownMenuItem>
                                                        {shipment.status === 'pending' && (
                                                            <DropdownMenuItem className="text-indigo-600" onClick={() => handleSelectShipment(shipment)}>
                                                                <Truck className="w-4 h-4 mr-2" />
                                                                ระบุเลขพัสดุ
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem onClick={() => handleSelectShipment(shipment)}>
                                                            รายละเอียด
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                            <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                            <p>ไม่พบรายการจัดส่งที่ค้นหา</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDetailsOpen} onOpenChange={(open) => {
                setIsDetailsOpen(open);
                if (!open) setTimeout(() => setSelectedShipment(null), 300);
            }}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>รายละเอียดคำสั่งซื้อ: {selectedShipment?.id}</DialogTitle>
                        <DialogDescription>
                            วันที่สั่งซื้อ: {selectedShipment?.date}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedShipment && (
                        <div className="space-y-6 py-4">
                            {/* Status & Tracking */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                <div>
                                    <Label className="text-xs text-slate-500">สถานะพัสดุ</Label>
                                    <div className="mt-1">{getStatusBadge(selectedShipment.status)}</div>
                                </div>
                                {selectedShipment.trackingNo && (
                                    <div className="text-right">
                                        <Label className="text-xs text-slate-500">เลขพัสดุ ({selectedShipment.courier})</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="font-mono font-medium text-slate-900">{selectedShipment.trackingNo}</span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-indigo-600">
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Customer Info */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs text-slate-500">ผู้รับ</Label>
                                    <p className="text-sm font-medium text-slate-900 mt-1">{selectedShipment.customer}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-slate-500">ที่อยู่จัดส่ง</Label>
                                    <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                                        {selectedShipment.address}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Items */}
                            <div>
                                <Label className="text-xs text-slate-500 mb-3 block">รายการสินค้า</Label>
                                <div className="space-y-3">
                                    {selectedShipment.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{item.name}</p>
                                                    <p className="text-xs text-slate-500">รหัสสินค้า: PRODUCT-{idx + 1}00</p>
                                                </div>
                                            </div>
                                            <div className="font-medium text-slate-600">x{item.quantity}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedShipment.status === 'pending' ? (
                                <div className="bg-indigo-50 p-4 rounded-lg flex items-start gap-3 mt-4">
                                    <Truck className="w-5 h-5 text-indigo-600 mt-0.5" />
                                    <div className="w-full">
                                        <h4 className="text-sm font-medium text-indigo-900">ยังไม่ได้ระบุเลขพัสดุ</h4>
                                        <p className="text-xs text-indigo-700 mt-1 mb-3">
                                            รายการนี้ยังรอการจัดส่ง กรุณาระบุขนส่งและเลขพัสดุเพื่ออัปเดตสถานะ
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <Input placeholder="ชื่อขนส่ง (เช่น Kerry, Flash)" className="bg-white" id="courier-input" />
                                            <Input placeholder="เลขพัสดุ (Tracking No.)" className="bg-white" id="tracking-input" />
                                        </div>

                                        <Button
                                            size="sm"
                                            className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white w-full md:w-auto"
                                            onClick={() => {
                                                const courier = (document.getElementById('courier-input') as HTMLInputElement).value;
                                                const tracking = (document.getElementById('tracking-input') as HTMLInputElement).value;

                                                if (courier && tracking) {
                                                    // In a real app, this would be an API call
                                                    const updatedShipment = {
                                                        ...selectedShipment,
                                                        status: 'shipping',
                                                        courier,
                                                        trackingNo: tracking
                                                    };

                                                    // Update local state to reflect change immediately in UI (mock)
                                                    setSelectedShipment(updatedShipment);

                                                    // Update mock data list (would be re-fetch in real app)
                                                    const index = MOCK_SHIPMENTS.findIndex(s => s.id === selectedShipment.id);
                                                    if (index !== -1) {
                                                        MOCK_SHIPMENTS[index] = updatedShipment;
                                                    }

                                                    alert(`บันทึกข้อมูลจัดส่งเรียบร้อย\nขนส่ง: ${courier}\nเลขพัสดุ: ${tracking}`);
                                                    setIsDetailsOpen(false);
                                                } else {
                                                    alert('กรุณาระบุชื่อขนส่งและเลขพัสดุให้ครบถ้วน');
                                                }
                                            }}
                                        >
                                            บันทึกข้อมูลการจัดส่ง
                                        </Button>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>ปิดหน้าต่าง</Button>
                        <Button onClick={() => window.print()} className="gap-2">
                            <Printer className="w-4 h-4" />
                            พิมพ์
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
