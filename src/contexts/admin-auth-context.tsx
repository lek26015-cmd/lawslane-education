'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminAuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // The session is an httpOnly cookie set by the server, so ask the
        // server whether it's valid instead of reading anything client-side.
        const checkSession = async () => {
            try {
                const response = await fetch('/api/admin/session');
                const data = await response.json();
                setIsAuthenticated(!!data.authenticated);
            } catch {
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkSession();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setIsAuthenticated(true);
                    return true;
                }
            }
            return false;
        } catch {
            return false;
        }
    };

    const logout = () => {
        fetch('/api/admin/logout', { method: 'POST' }).finally(() => {
            setIsAuthenticated(false);
        });
    };

    return (
        <AdminAuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within AdminAuthProvider');
    }
    return context;
}
