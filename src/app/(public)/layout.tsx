import Link from 'next/link';
import { CartProvider } from '@/context/cart-context';
import { CartSheet } from '@/components/education/cart-sheet';
import { FloatingCartButton } from '@/components/education/floating-cart-button';
import { EducationHeaderActions } from '@/components/education/header-actions';
import EducationNavigation from '@/components/education/education-nav';
import { PageAnimationWrapper } from '@/components/education/page-animation';
import { BrandLogo } from '@/components/brand-logo';
import { GoogleAd } from '@/components/google-ad';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CartProvider>
            {/* Header — หน้าตาเดียวกับเว็บหลัก lawslane.com (พื้นขาว, h-20, ลิงก์ slate → กรมท่า) */}
            <header className="sticky top-0 z-50 w-full bg-white/95 text-slate-900 border-b border-slate-200 shadow-sm backdrop-blur-md">
                <div className="mx-auto max-w-6xl px-4 md:px-6 h-20 flex items-center justify-between gap-4">
                    <Link href="/" className="flex items-center shrink-0">
                        <BrandLogo variant="light" showSubtitle={false} />
                    </Link>
                    <div className="flex items-center gap-4">
                        <EducationNavigation />
                        <EducationHeaderActions />
                    </div>
                </div>
            </header>

            <main className="min-h-screen bg-slate-50 relative">
                {/* Crystal side decorations */}
                <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
                    {/* Left side */}
                    <img
                        src="/images/elements/lawslane-element-01.png"
                        alt=""
                        className="absolute top-[25%] -left-[100px] md:-left-[80px] w-[250px] h-[250px] md:w-[350px] md:h-[350px] object-contain opacity-[0.08] -rotate-12"
                    />
                    {/* Right side */}
                    <img
                        src="/images/elements/lawslane-element-02.png"
                        alt=""
                        className="absolute top-[55%] -right-[100px] md:-right-[80px] w-[250px] h-[250px] md:w-[350px] md:h-[350px] object-contain opacity-[0.08] rotate-12"
                    />
                </div>

                <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-6 py-8">
                    <PageAnimationWrapper>
                        {children}
                    </PageAnimationWrapper>
                </div>
            </main>

            {/* Ad Banner — shows on all public pages */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4">
                <GoogleAd variant="banner" />
            </div>

            {/* Footer — แบบเดียวกับเว็บหลัก (gray-900, 4 คอลัมน์, ไอคอนโซเชียล) */}
            <footer className="bg-gray-900 text-gray-300 mt-16">
                <div className="container mx-auto px-4 md:px-6 py-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="space-y-4">
                            <BrandLogo variant="dark" showSubtitle={false} />
                            <p className="text-sm text-gray-400 leading-relaxed">
                                เตรียมสอบทนายความอย่างมั่นใจ ด้วยหนังสือและระบบฝึกข้อสอบจาก Lawslane
                            </p>
                            <div className="flex gap-2">
                                <a href="https://www.facebook.com/lawslane" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-[#0B3979] flex items-center justify-center text-white text-sm font-bold transition-colors">f</a>
                                <a href="https://lin.ee/CZzSmHr" target="_blank" rel="noopener noreferrer" aria-label="LINE" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-[#06C755] flex items-center justify-center text-white text-[10px] font-bold transition-colors">LINE</a>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-white mb-4">เตรียมสอบ</h3>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/exams" className="hover:text-white transition-colors">คลังข้อสอบ</Link></li>
                                <li><Link href="/books" className="hover:text-white transition-colors">หนังสือเตรียมสอบ</Link></li>
                                <li><Link href="/articles" className="hover:text-white transition-colors">บทความ</Link></li>
                                <li><Link href="/my-learning" className="hover:text-white transition-colors">การเรียนรู้ของฉัน</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-white mb-4">Lawslane</h3>
                            <ul className="space-y-2 text-sm">
                                <li><a href="https://lawslane.com" className="hover:text-white transition-colors">เว็บไซต์หลัก Lawslane</a></li>
                                <li><a href="https://lawslane.com/th/lawyers" className="hover:text-white transition-colors">ค้นหาทนาย</a></li>
                                <li><a href="https://lawslane.com/th/law-search" className="hover:text-white transition-colors">ค้นหากฎหมาย</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-white mb-4">กฎหมาย</h3>
                            <ul className="space-y-2 text-sm">
                                <li><a href="https://lawslane.com/th/privacy" className="hover:text-white transition-colors">นโยบายความเป็นส่วนตัว</a></li>
                                <li><a href="https://lawslane.com/th/terms" className="hover:text-white transition-colors">ข้อกำหนดการใช้งาน</a></li>
                                <li><a href="https://lawslane.com/th/help" className="hover:text-white transition-colors">ศูนย์ช่วยเหลือ</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-10 pt-6 text-center text-[10px] uppercase tracking-widest text-gray-500">
                        <p>© {new Date().getFullYear()} Lawslane. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            <CartSheet />
            <FloatingCartButton />
        </CartProvider>
    );
}
