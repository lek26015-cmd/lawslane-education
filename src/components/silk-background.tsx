import { cn } from '@/lib/utils';

const palettes = {
  // hero พื้นเข้ม (slate-900)
  dark: {
    top: '#002f4b',
    topOpacity: 0.7,
    a: ['#1e3a8a', '#0369a1', '#1e40af'],
    aOpacity: 0.65,
    b: ['#0c4a6e', '#38bdf8'],
    bOpacity: 0.5,
    shine: '#7dd3fc',
    shineOpacity: 0.2,
  },
  // พื้นหลังทั้งหน้าที่เป็นสีอ่อน (slate-50) — จางพอให้การ์ดสีขาวยังเด่น
  light: {
    top: '#f0f9ff',
    topOpacity: 0.9,
    a: ['#dbeafe', '#bae6fd', '#e0f2fe'],
    aOpacity: 0.7,
    b: ['#e0f2fe', '#93c5fd'],
    bOpacity: 0.45,
    shine: '#ffffff',
    shineOpacity: 0.6,
  },
} as const;

/**
 * พื้นหลังคลื่นผ้าไหมโทนกรมท่า/ฟ้า
 * วางเป็นลูกคนแรกของกล่องที่เป็น `relative overflow-hidden` (หรือ fixed) แล้วให้เนื้อหาอยู่ `relative z-10`
 * ใช้ CSS blur กับ SVG ทั้งก้อน (ลื่นกว่า feGaussianBlur บนมือถือ) และขยายเกินกรอบไว้ซ่อนขอบที่เบลอ
 */
export function SilkBackground({ className, variant = 'dark' }: { className?: string; variant?: keyof typeof palettes }) {
  const p = palettes[variant];
  const id = `silk-${variant}`;
  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <svg
        className="absolute -left-[10%] -top-[10%] h-[120%] w-[120%] blur-2xl md:blur-3xl"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`${id}-a`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={p.a[0]} />
            <stop offset="0.55" stopColor={p.a[1]} />
            <stop offset="1" stopColor={p.a[2]} />
          </linearGradient>
          <linearGradient id={`${id}-b`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={p.b[0]} />
            <stop offset="1" stopColor={p.b[1]} />
          </linearGradient>
        </defs>
        <path d="M0 360 C 260 220 480 500 800 360 S 1240 180 1440 300 L1440 0 L0 0Z" fill={p.top} opacity={p.topOpacity} />
        <path d="M0 560 C 280 400 560 640 880 480 S 1260 320 1440 420 L1440 800 L0 800Z" fill={`url(#${id}-a)`} opacity={p.aOpacity} />
        <path d="M0 690 C 340 580 660 770 1000 600 S 1320 560 1440 620 L1440 800 L0 800Z" fill={`url(#${id}-b)`} opacity={p.bOpacity} />
        <path d="M620 440 C 820 380 1020 470 1240 380" stroke={p.shine} strokeWidth="40" fill="none" opacity={p.shineOpacity} />
      </svg>
    </div>
  );
}
