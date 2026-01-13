'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminAuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const AUTH_KEY = 'education_admin_auth';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if already logged in
        const stored = localStorage.getItem(AUTH_KEY);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                // Check if token is still valid (within 24 hours)
                if (data.timestamp && Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem(AUTH_KEY);
                }
            } catch {
                localStorage.removeItem(AUTH_KEY);
            }
        }
        setIsLoading(false);
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
                    localStorage.setItem(AUTH_KEY, JSON.stringify({
                        email,
                        timestamp: Date.now()
                    }));
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
        localStorage.removeItem(AUTH_KEY);
        setIsAuthenticated(false);
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
