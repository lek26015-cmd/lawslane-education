import { Prompt } from 'next/font/google';
import { EducationToasterWrapper } from '@/components/education/education-toaster-wrapper';
import "./globals.css";
import { FirebaseClientProvider } from '@/firebase/client-provider';

const prompt = Prompt({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-prompt',
});

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
      <body className={`min-h-screen bg-slate-50 ${prompt.className}`}>
        <FirebaseClientProvider>
          {children}
          <EducationToasterWrapper />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
