'use client';

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from '@/context/cart-context';
import { Badge } from "@/components/ui/badge";

export function FloatingCartButton() {
    const { setIsOpen, totalItems } = useCart();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || totalItems === 0) return null;

    return (
        <Button
            className="fixed bottom-6 right-6 z-[100] rounded-full w-16 h-16 shadow-xl bg-indigo-600 hover:bg-indigo-700 text-white p-0 flex items-center justify-center transition-transform hover:scale-105"
            onClick={() => setIsOpen(true)}
        >
            <ShoppingCart className="w-8 h-8" />
            {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 h-7 w-7 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 border-2 border-white text-sm font-bold shadow-sm">
                    {totalItems}
                </Badge>
            )}
        </Button>
    );
}
