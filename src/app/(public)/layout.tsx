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
            {/* Header — Lawslane Navy */}
            <header className="sticky top-0 z-50 w-full border-b border-sky-800/40 bg-[#0c4a6e]/95 backdrop-blur-md">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
                        <BrandLogo variant="dark" showSubtitle={false} />
                    </Link>
                    <div className="flex items-center gap-4">
                        <EducationNavigation />
                        <EducationHeaderActions />
                    </div>
                </div>
            </header>

            <main className="min-h-screen bg-slate-50/60 relative">
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

                <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-8">
                    <PageAnimationWrapper>
                        {children}
                    </PageAnimationWrapper>
                </div>
            </main>

            {/* Ad Banner — shows on all public pages */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4">
                <GoogleAd variant="banner" />
            </div>

            {/* Footer — Wittaya Style */}
            <footer className="bg-slate-900 text-slate-400 mt-16 font-extralight">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Brand */}
                        <div>
                            <div className="mb-3">
                                <BrandLogo variant="dark" showSubtitle={false} />
                            </div>
                            <p className="text-xs text-slate-500 font-extralight leading-relaxed">
                                เตรียมสอบทนายความอย่างมั่นใจ<br />
                                ด้วยหนังสือและระบบฝึกฝนข้อสอบจาก Lawslane
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="font-normal text-slate-300 text-sm mb-3">ลิงก์ด่วน</h3>
                            <ul className="space-y-1.5 text-xs">
                                <li><Link href="/exams" className="hover:text-white transition-colors">คลังข้อสอบ</Link></li>
                                <li><Link href="/books" className="hover:text-white transition-colors">หนังสือเตรียมสอบ</Link></li>
                                <li><Link href="/my-learning" className="hover:text-white transition-colors">การเรียนรู้ของฉัน</Link></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h3 className="font-normal text-slate-300 text-sm mb-3">ติดต่อเรา</h3>
                            <ul className="space-y-1.5 text-xs">
                                <li><a href="https://lawslane.com" target="_blank" rel="noopener" className="hover:text-white transition-colors">เว็บไซต์ Lawslane หลัก</a></li>
                                <li><a href="https://www.facebook.com/lawslane" target="_blank" rel="noopener" className="hover:text-white transition-colors">Facebook</a></li>
                                <li><a href="https://lin.ee/CZzSmHr" target="_blank" rel="noopener" className="hover:text-white transition-colors">LINE Official</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 mt-8 pt-5 text-center text-[11px] text-slate-600">
                        <p>© {new Date().getFullYear()} Lawslane Wittaya. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            <CartSheet />
            <FloatingCartButton />
        </CartProvider>
    );
}
