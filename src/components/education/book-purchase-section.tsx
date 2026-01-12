'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { ShoppingCart, CreditCard } from "lucide-react";
import { Book } from '@/lib/education-types';
import { useCart } from '@/context/cart-context';

interface BookPurchaseSectionProps {
    book: Book;
}

export function BookPurchaseSection({ book }: BookPurchaseSectionProps) {
    const { addItem, setIsOpen } = useCart();

    const handleAddToCart = () => {
        addItem(book);
    };

    const handleBuyNow = () => {
        addItem(book);
        setIsOpen(true);
    };

    return (
        <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
                <p className="text-sm text-slate-500 mb-1">ราคาจำหน่าย</p>
                <div className="text-4xl font-bold text-indigo-700">฿{book.price.toLocaleString()}</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    onClick={handleAddToCart}
                >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    ใส่ตะกร้า
                </Button>
                <Button
                    size="lg"
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
                    onClick={handleBuyNow}
                >
                    <CreditCard className="w-5 h-5 mr-2" />
                    ซื้อเลย
                </Button>
            </div>
        </div>
    );
}
