'use client';

import { useEffect, ReactNode } from 'react';

interface CopyProtectionProps {
    children: ReactNode;
    /** Show watermark overlay */
    showWatermark?: boolean;
    /** Watermark text */
    watermarkText?: string;
    /** Block right-click context menu */
    blockContextMenu?: boolean;
    /** Block text selection */
    blockSelection?: boolean;
    /** Block keyboard shortcuts (Ctrl+C, Ctrl+A, Ctrl+P, PrintScreen) */
    blockShortcuts?: boolean;
}

/**
 * CopyProtection wrapper component
 * 
 * ป้องกันการ copy ข้อสอบ ด้วยหลายชั้น:
 * 1. ปิด text selection (CSS user-select: none)
 * 2. ปิด right-click context menu
 * 3. ปิด keyboard shortcuts (Ctrl+C, Ctrl+A, Ctrl+P, Cmd+C, etc.)
 * 4. ปิด drag & drop
 * 5. แสดง watermark ซ้อนทับ (optional)
 * 
 * Usage:
 *   <CopyProtection watermarkText="Lawslane © 2024">
 *     <p>ข้อสอบที่ต้องการป้องกัน</p>
 *   </CopyProtection>
 */
export function CopyProtection({
    children,
    showWatermark = true,
    watermarkText = '© Lawslane Wittaya',
    blockContextMenu = true,
    blockSelection = true,
    blockShortcuts = true,
}: CopyProtectionProps) {

    useEffect(() => {
        if (!blockShortcuts) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

            // Block: Ctrl+C (copy), Ctrl+A (select all), Ctrl+P (print), Ctrl+S (save)
            if (ctrlKey && ['c', 'a', 'p', 's', 'u'].includes(e.key.toLowerCase())) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // Block: PrintScreen
            if (e.key === 'PrintScreen') {
                e.preventDefault();
                return false;
            }

            // Block: F12 (DevTools)
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }

            // Block: Ctrl+Shift+I (DevTools), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect)
            if (ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) {
                e.preventDefault();
                return false;
            }
        };

        // Block copy event
        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            // Optionally replace clipboard with warning
            e.clipboardData?.setData('text/plain', '⚠️ การคัดลอกข้อสอบไม่ได้รับอนุญาต — Lawslane Wittaya');
            return false;
        };

        // Block drag
        const handleDragStart = (e: DragEvent) => {
            e.preventDefault();
            return false;
        };

        document.addEventListener('keydown', handleKeyDown, true);
        document.addEventListener('copy', handleCopy, true);
        document.addEventListener('dragstart', handleDragStart, true);

        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
            document.removeEventListener('copy', handleCopy, true);
            document.removeEventListener('dragstart', handleDragStart, true);
        };
    }, [blockShortcuts]);

    const handleContextMenu = (e: React.MouseEvent) => {
        if (blockContextMenu) {
            e.preventDefault();
            return false;
        }
    };

    return (
        <div
            onContextMenu={handleContextMenu}
            className="relative"
            style={{
                userSelect: blockSelection ? 'none' : 'auto',
                WebkitUserSelect: blockSelection ? 'none' : 'auto',
            }}
        >
            {children}

            {/* Watermark Overlay */}
            {showWatermark && (
                <div
                    className="pointer-events-none absolute inset-0 z-10 overflow-hidden select-none"
                    aria-hidden="true"
                >
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
                                `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'>
                                    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' 
                                        font-family='sans-serif' font-size='14' fill='rgba(0,0,0,0.03)' 
                                        transform='rotate(-30, 150, 100)'>
                                        ${watermarkText}
                                    </text>
                                </svg>`
                            )}")`,
                            backgroundRepeat: 'repeat',
                        }}
                    />
                </div>
            )}
        </div>
    );
}
