import { Inter } from 'next/font/google';
import { EducationToasterWrapper } from '@/components/education/education-toaster-wrapper';
import Link from 'next/link';
import Image from 'next/image';
import "./globals.css";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { CartProvider } from '@/context/cart-context';
import { CartSheet } from '@/components/education/cart-sheet';
import { FloatingCartButton } from '@/components/education/floating-cart-button';
import { EducationHeaderActions } from '@/components/education/header-actions';
import EducationNavigation from '@/components/education/education-nav';
import { PageAnimationWrapper } from '@/components/education/page-animation';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Lawslane Education | หนังสือและคลังข้อสอบทนาย',
  description: 'เตรียมสอบทนายด้วยหนังสือและระบบทดสอบจาก Lawslane',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={`min-h-screen bg-slate-50 overflow-x-hidden ${inter.className}`}>
        <FirebaseClientProvider>
          <CartProvider>
            {/* Simple Header for Education Portal */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
              <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 md:gap-3 text-primary">
                  <Image
                    src="/images/logo-lawslane-transparent-color.png"
                    alt="Lawslane Logo"
                    width={40}
                    height={40}
                    className="h-8 md:h-10 w-auto"
                    priority
                  />
                  <div className="hidden sm:flex flex-col" style={{ lineHeight: '1.1' }}>
                    <span className="font-bold text-base md:text-xl">Lawslane</span>
                    <span className="font-bold text-base md:text-xl">Education</span>
                  </div>
                </Link>
                <div className="flex items-center gap-2 md:gap-6">
                  <EducationNavigation />
                  <EducationHeaderActions />
                </div>
              </div>
            </header>

            <main className="container mx-auto px-4 py-8 min-h-screen overflow-x-hidden">
              <PageAnimationWrapper>
                {children}
              </PageAnimationWrapper>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 mt-16">
              <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Brand */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Image
                        src="/images/logo-lawslane-transparent-white.png"
                        alt="Lawslane Logo"
                        width={32}
                        height={32}
                        className="h-8 w-auto"
                      />
                      <div className="flex flex-col" style={{ lineHeight: '1.1' }}>
                        <span className="font-bold text-lg text-white">Lawslane</span>
                        <span className="font-bold text-lg text-white">Education</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400">
                      เตรียมสอบทนายความอย่างมั่นใจ<br />
                      ด้วยหนังสือและระบบฝึกฝนข้อสอบจาก Lawslane
                    </p>
                  </div>

                  {/* Quick Links */}
                  <div>
                    <h3 className="font-semibold text-white mb-4">ลิงก์ด่วน</h3>
                    <ul className="space-y-2 text-sm">
                      <li><Link href="/exams" className="hover:text-white transition-colors">คลังข้อสอบ</Link></li>
                      <li><Link href="/books" className="hover:text-white transition-colors">หนังสือเตรียมสอบ</Link></li>
                      <li><Link href="/my-learning" className="hover:text-white transition-colors">การเรียนรู้ของฉัน</Link></li>
                    </ul>
                  </div>

                  {/* Contact / Main Site */}
                  <div>
                    <h3 className="font-semibold text-white mb-4">ติดต่อเรา</h3>
                    <ul className="space-y-2 text-sm">
                      <li><a href="https://lawslane.com" target="_blank" rel="noopener" className="hover:text-white transition-colors">เว็บไซต์ Lawslane หลัก</a></li>
                      <li><a href="https://www.facebook.com/lawslane" target="_blank" rel="noopener" className="hover:text-white transition-colors">Facebook</a></li>
                      <li><a href="https://lin.ee/CZzSmHr" target="_blank" rel="noopener" className="hover:text-white transition-colors">LINE Official</a></li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-slate-800 mt-8 pt-6 text-center text-sm text-slate-500">
                  <p>© {new Date().getFullYear()} Lawslane Education. All rights reserved.</p>
                </div>
              </div>
            </footer>


            <EducationToasterWrapper />
            <CartSheet />
            <FloatingCartButton />
          </CartProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
