import { Kanit } from 'next/font/google';
import { EducationToasterWrapper } from '@/components/education/education-toaster-wrapper';
import "./globals.css";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { GoogleAdSenseScript } from '@/components/google-ad';
import { OrganizationJsonLd, WebsiteJsonLd } from '@/components/seo/json-ld';

const kanit = Kanit({
  subsets: ['latin', 'thai'],
  weight: ['200', '300', '400', '500', '600'],
  variable: '--font-kanit',
});

import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://education.lawslane.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Lawslane Wittaya | คลังข้อสอบทนายความ สอบใบอนุญาตว่าความ',
    template: '%s | Lawslane Wittaya',
  },
  description: 'แหล่งรวมข้อสอบกฎหมายย้อนหลังทุกชั้นปี หนังสือเตรียมสอบตั๋วทนาย คอร์สเรียนกฎหมาย พร้อม AI ช่วยตรวจอัตนัย — เตรียมสอบใบอนุญาตว่าความอย่างมั่นใจ',
  keywords: [
    'ข้อสอบทนาย', 'สอบใบอนุญาตว่าความ', 'ข้อสอบกฎหมาย', 'เตรียมสอบตั๋วทนาย',
    'ข้อสอบเนติบัณฑิต', 'หนังสือกฎหมาย', 'คลังข้อสอบ', 'Lawslane', 'Wittaya',
    'สอบทนายความ', 'กฎหมายแพ่ง', 'กฎหมายอาญา', 'วิธีพิจารณาความ',
    'สำนักอบรมศึกษากฎหมาย', 'เนติบัณฑิตยสภา', 'สภาทนายความ',
  ],
  authors: [{ name: 'Lawslane', url: 'https://lawslane.com' }],
  creator: 'Lawslane',
  publisher: 'Lawslane Wittaya',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: SITE_URL,
    siteName: 'Lawslane Wittaya',
    title: 'Lawslane Wittaya | คลังข้อสอบทนายความ สอบใบอนุญาตว่าความ',
    description: 'แหล่งรวมข้อสอบกฎหมายย้อนหลังทุกชั้นปี หนังสือเตรียมสอบตั๋วทนาย พร้อม AI ช่วยตรวจอัตนัย',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lawslane Wittaya — คลังข้อสอบทนายความ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lawslane Wittaya | คลังข้อสอบทนายความ',
    description: 'แหล่งรวมข้อสอบกฎหมาย หนังสือเตรียมสอบตั๋วทนาย พร้อม AI ช่วยตรวจอัตนัย',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    // google: 'YOUR_GOOGLE_VERIFICATION_CODE', // TODO: ใส่เมื่อ verify กับ Google Search Console
  },
  other: {
    'theme-color': '#0284c7',
    'apple-mobile-web-app-title': 'Lawslane Wittaya',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <GoogleAdSenseScript />
      </head>
      <body className={`min-h-screen bg-slate-50 ${kanit.className}`}>
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        <FirebaseClientProvider>
          {children}
          <EducationToasterWrapper />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
