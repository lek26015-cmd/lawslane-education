'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Copy, CreditCard, CheckCircle2, MessageCircle, AlertCircle } from "lucide-react";
import { Book } from '@/lib/education-types';
import Image from 'next/image';

interface BookOrderDialogProps {
    book: Book;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function BookOrderDialog({ book, trigger, open, onOpenChange }: BookOrderDialogProps) {
    const [step, setStep] = React.useState<'payment' | 'confirm'>('payment');

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add toast here
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{step === 'payment' ? 'สั่งซื้อหนังสือ' : 'แจ้งชำระเงิน'}</DialogTitle>
                    <DialogDescription>
                        {step === 'payment'
                            ? `ชำระเงินสำหรับ "${book.title}"`
                            : 'ยืนยันการสั่งซื้อเรียบร้อยแล้ว'}
                    </DialogDescription>
                </DialogHeader>

                {step === 'payment' ? (
                    <div className="space-y-6 py-2">
                        {/* Order Summary */}
                        <div className="bg-slate-50 p-4 rounded-lg flex items-start gap-4">
                            <div className="relative w-16 h-24 bg-slate-200 rounded flex-shrink-0 overflow-hidden">
                                <img
                                    src={book.coverUrl}
                                    alt={book.title}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900 line-clamp-1">{book.title}</h4>
                                <p className="text-sm text-slate-500 mb-2">โดย {book.author}</p>
                                <p className="text-lg font-bold text-indigo-700">฿{book.price.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Bank Details */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                <CreditCard className="w-4 h-4" /> ช่องทางการชำระเงิน (โอนเงิน)
                            </h4>
                            <div className="border rounded-xl p-4 space-y-3 bg-white shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#148F46] rounded-lg flex items-center justify-center text-white font-bold text-xs">
                                            KBANK
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">ธนาคารกสิกรไทย</p>
                                            <p className="text-sm text-slate-500">บจก. ลอว์เลนส์ เอ็ดดูเคชั่น</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <span className="font-mono text-lg font-bold text-slate-700 tracking-wider">
                                        012-3-45678-9
                                    </span>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-200" onClick={() => handleCopy('012-3-45678-9')}>
                                        <Copy className="w-4 h-4 text-slate-500" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 p-3 rounded-lg flex items-start gap-2 border border-amber-100">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700 leading-relaxed">
                                เมื่อโอนเงินแล้ว กรุณาเก็บหลักฐานการโอนเงิน (Slip) ไว้เพื่อแจ้งยืนยันการชำระเงินในขั้นตอนถัดไป
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="py-6 flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-slate-900">เหลืออีกหนึ่งขั้นตอน!</h3>
                            <p className="text-slate-600 max-w-xs mx-auto">
                                กรุณาส่งหลักฐานการโอนเงิน (Slip) มาที่ Line Official Account ของเราเพื่อรับสินค้า
                            </p>
                        </div>

                        <div className="w-full bg-slate-50 p-6 rounded-xl border border-slate-200 mt-4">
                            <p className="text-sm font-medium text-slate-700 mb-4">ช่องทางแจ้งชำระเงิน</p>
                            <Button className="w-full bg-[#06C755] hover:bg-[#05b54c] text-white font-bold h-12">
                                <MessageCircle className="w-5 h-5 mr-2" />
                                แจ้งโอนเงินผ่าน LINE OA
                            </Button>
                            <p className="text-xs text-slate-400 mt-3">
                                หรือแจ้งผ่าน Email: support@lawslane.com
                            </p>
                        </div>
                    </div>
                )}

                <DialogFooter className="sm:justify-between flex-row gap-2">
                    {step === 'payment' ? (
                        <>
                            <Button variant="outline" onClick={() => onOpenChange?.(false)}>ยกเลิก</Button>
                            <Button onClick={() => setStep('confirm')} className="bg-indigo-600 hover:bg-indigo-700">
                                แจ้งชำระเงิน
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline" className="w-full" onClick={() => onOpenChange?.(false)}>
                            ปิดหน้าต่าง
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
