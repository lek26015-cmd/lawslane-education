'use client';

import React from 'react';

export function TurnstileWidget({
    siteKey = '',
    onSuccess = (_token: string) => { },
    className = ''
}: {
    siteKey?: string;
    onSuccess?: (token: string) => void;
    className?: string;
}) {
    // Stub component - Cloudflare Turnstile will be configured later
    React.useEffect(() => {
        // Auto-success for development
        onSuccess('dev-token');
    }, [onSuccess]);

    return (
        <div className={className}>
            {/* Turnstile widget placeholder */}
        </div>
    );
}
