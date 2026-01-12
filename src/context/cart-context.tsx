'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Book, Course } from '@/lib/education-types';
import { useToast } from "@/hooks/use-toast";

export type ProductType = 'BOOK' | 'COURSE' | 'EXAM';

export interface CartItem {
    id: string;
    title: string;
    price: number;
    coverUrl: string;
    quantity: number;
    type: ProductType;
    // Original full object for reference if needed
    originalItem: Book | Course;
}

interface CartContextType {
    items: CartItem[];
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    addItem: (product: Book | Course, type?: ProductType) => void;
    removeItem: (id: string) => void;
    updateQuantity: (bookId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const { toast } = useToast();

    // Load from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('education_cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to local storage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('education_cart', JSON.stringify(items));
        }
    }, [items, isLoaded]);

    const addItem = (product: Book | Course, type: ProductType = 'BOOK') => {
        setItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                id: product.id,
                title: product.title,
                price: product.price,
                coverUrl: product.coverUrl,
                quantity: 1,
                type: type,
                originalItem: product
            }];
        });

        toast({
            title: "เพิ่มลงตะกร้าเรียบร้อย",
            description: `เพิ่ม "${product.title}" ลงในตะกร้าแล้ว`,
            duration: 1500,
        });
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(id);
            return;
        }
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => {
        setItems([]);
        setIsOpen(false);
    };

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            items,
            isOpen,
            setIsOpen,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            totalItems,
            totalPrice
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
