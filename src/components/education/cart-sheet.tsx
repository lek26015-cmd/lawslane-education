'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"; // Added for Desktop View
import { Button } from "@/components/ui/button";
import { Plus, Minus, Trash2, ShoppingCart, ArrowRight, X } from "lucide-react";
import { useCart } from '@/context/cart-context';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function CartSheet() {
    const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalPrice } = useCart();
    const router = useRouter(); // Use router
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const EmptyCart = () => (
        <div className="flex flex-col items-center justify-center h-full space-y-4 text-center p-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-slate-400" />
            </div>
            <div>
                <p className="text-lg font-medium text-slate-900">ตะกร้าสินค้าว่างเปล่า</p>
                <p className="text-sm text-slate-500">เลือกหนังสือที่คุณสนใจเพื่อเริ่มการสั่งซื้อ</p>
            </div>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
                เลือกซื้อหนังสือ
            </Button>
        </div>
    );

    const CartItems = () => (
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {items.map(item => (
                <div key={item.id} className="flex gap-4 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                    <div className="relative w-16 h-24 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
                        <img
                            src={item.coverUrl}
                            alt={item.title}
                            className="object-cover w-full h-full"
                        />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                        <div>
                            <h4 className="font-medium text-slate-900 line-clamp-2 text-sm">{item.title}</h4>
                            <p className="text-xs text-slate-500 mt-1">฿{item.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 hover:bg-slate-200 rounded-md"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                    <Minus className="w-3 h-3" />
                                </Button>
                                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 hover:bg-slate-200 rounded-md"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                    <Plus className="w-3 h-3" />
                                </Button>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => removeItem(item.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const CartSummary = () => (
        <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
                <div className="flex justify-between text-slate-600">
                    <span>จำนวน ({items.reduce((sum, item) => sum + item.quantity, 0)} เล่ม)</span>
                    <span>฿{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                    <span>ค่าจัดส่ง</span>
                    <span className="text-green-600 font-medium">ฟรี</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>ยอดรวมสุทธิ</span>
                    <span className="text-indigo-700">฿{totalPrice.toLocaleString()}</span>
                </div>
            </div>
            <Button className="w-full h-12 text-lg font-bold bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                setIsOpen(false);
                router.push('/checkout');
            }}>
                ชำระเงิน <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
        </div>
    );

    // Desktop: Fixed Card (Chat-style)
    if (isDesktop) {
        if (!isOpen) return null;

        return (
            <div className="fixed bottom-24 right-6 z-[90] w-[400px] animate-in slide-in-from-bottom-5 fade-in duration-300">
                <Card className="shadow-2xl border-indigo-100 overflow-hidden flex flex-col max-h-[600px]">
                    <CardHeader className="bg-indigo-600 text-white p-4 flex flex-row items-center justify-between shrink-0">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5" /> ตะกร้าสินค้า
                        </CardTitle>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8" onClick={() => setIsOpen(false)}>
                            <X className="w-5 h-5" />
                        </Button>
                    </CardHeader>

                    <CardContent className="p-4 overflow-hidden flex flex-col flex-1 bg-slate-50">
                        {items.length === 0 ? <EmptyCart /> : (
                            <>
                                <CartItems />
                                <CartSummary />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Mobile: Full Sheet
    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent side="bottom" className="h-[90vh] flex flex-col rounded-t-[20px] p-0 overflow-hidden">
                <div className="p-4 border-b bg-white">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5" /> ตะกร้าสินค้า
                        </h2>
                        {/* Close button handled by Sheet primitive, or custom if needed */}
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col p-4 bg-slate-50">
                    {items.length === 0 ? <EmptyCart /> : (
                        <>
                            <CartItems />
                            <div className="mt-auto bg-white -mx-4 -mb-4 p-6 rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                                <CartSummary />
                            </div>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
