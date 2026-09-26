import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { GoogleAd } from '@/components/google-ad';
import { Target, ChevronRight, Briefcase, Languages, ArrowRight } from "lucide-react";
import { RecommendedBooksSection } from '@/components/education/recommended-books';
import {
  FeatureCardsAnimated,
  TestimonialsAnimated,
  ExamCategoriesAnimated,
} from '@/components/education/animated-sections';
import { SampleExamsList } from '@/components/education/sample-exams-list';
import { HeroFadeIn, SectionFadeIn } from '@/components/education/fade-in';
import type { Metadata } from 'next';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'หน้าแรก — คลังข้อสอบทนายความ หนังสือเตรียมสอบ',
  description: 'เตรียมสอบใบอนุญาตว่าความ สอบเนติบัณฑิต ด้วยข้อสอบกฎหมายจริงกว่า 2,000 ชุด หนังสือเตรียมสอบ และ AI ตรวจอัตนัย จาก Lawslane Wittaya',
  alternates: { canonical: '/' },
};

export default function EducationPage() {
  return (
    <div className="flex flex-col gap-12 overflow-x-hidden">
      {/* Hero Section - Exam Focused */}
      <HeroFadeIn>
        <section
          className="relative overflow-hidden rounded-3xl text-white p-6 md:p-12 lg:p-20 bg-[linear-gradient(135deg,#082a5a,#0B3979,#0B3979)]"
        >
          <div className="relative z-20 max-w-2xl space-y-6 mx-auto lg:mx-0 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight">
              ฝึกทำข้อสอบกฎหมาย<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-100">
                จนกว่าจะมั่นใจ
              </span>
            </h1>
            <p className="text-base md:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0">
              ข้อสอบครบทุกวิชา ทั้ง <strong className="text-white">แพ่ง วิแพ่ง อาญา วิอาญา</strong> พร้อมธงคำตอบละเอียด
              เหมาะกับนักศึกษา<strong className="text-white">ปี 1 ถึงเตรียมสอบเนติบัณฑิต</strong>
            </p>

            {/* Subject Tags */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs md:text-sm">กฎหมายแพ่ง</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs md:text-sm">วิธีพิจารณาความแพ่ง</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs md:text-sm">กฎหมายอาญา</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs md:text-sm">วิธีพิจารณาความอาญา</span>
               <span className="px-3 py-1 bg-blue-400/30 rounded-full text-xs md:text-sm text-blue-100">ข้อสอบทนาย</span>
            </div>

            <div className="flex flex-wrap gap-3 md:gap-4 pt-4 justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="bg-white text-[#0B3979] !text-blue-900 border border-white hover:bg-slate-100 font-bold rounded-full px-6 md:px-8 h-10 md:h-12 text-sm md:text-base shadow-lg relative z-10"
              >
                <Link href="/exams">
                  เริ่มทำข้อสอบเลย
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/20 hover:text-white rounded-full px-6 md:px-8 h-10 md:h-12 text-sm md:text-base backdrop-blur-sm relative z-10 font-medium">
                <Link href="/books">
                  ดูหนังสือประกอบ
                </Link>
              </Button>
            </div>
          </div>

          {/* Hero Image - Absolute Positioned - Hidden on small mobile */}
          <div className="hidden md:flex absolute bottom-0 right-4 lg:right-8 h-[95%] w-auto max-w-[50%] z-10 items-end pointer-events-none">
            <div className="relative w-[500px] h-full">
              <Image
                src="/images/lawslane-education-catoon.png"
                alt="Lawlanes Education"
                fill
                className="object-contain drop-shadow-2xl object-bottom"
                priority
                quality={100}
                unoptimized
              />
            </div>
          </div>

          {/* Background glow effects */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-15 pointer-events-none z-0">
            <div className="absolute top-20 right-20 w-64 h-64 bg-blue-300 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-[120px]" />
          </div>
        </section>
      </HeroFadeIn>

      {/* Target Audience Banner */}
      <SectionFadeIn delay={0.1}>
        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
            <span className="text-lg font-semibold text-slate-800">เหมาะสำหรับ:</span>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 bg-white rounded-full shadow-sm text-sm font-medium text-slate-700 border">นักศึกษานิติศาสตร์ ปี 1-4</span>
              <span className="px-4 py-2 bg-white rounded-full shadow-sm text-sm font-medium text-slate-700 border">เตรียมสอบใบอนุญาตว่าความ</span>
              <span className="px-4 py-2 bg-white rounded-full shadow-sm text-sm font-medium text-slate-700 border">เตรียมสอบเนติบัณฑิต</span>
            </div>
          </div>
        </section>
      </SectionFadeIn>

      {/* Feature Highlights - Exam System */}
      <FeatureCardsAnimated />

      {/* Ad Banner */}
      <GoogleAd variant="banner" className="my-2" />

      {/* Exam Categories Section */}
      <SectionFadeIn delay={0.15}>
        <ExamCategoriesAnimated />
      </SectionFadeIn>

      {/* Popular Exams Section (List View) */}
      <SectionFadeIn delay={0.2}>
        <div className="space-y-6">
          <div className="flex justify-between items-center px-4 md:px-0">
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-[#0B3979]" />
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">ข้อสอบยอดนิยม</h2>
            </div>
            <Link href="/exams">
              <Button variant="link" className="text-slate-600 hover:text-primary text-sm font-medium">
                ดูทั้งหมด <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <SampleExamsList />
        </div>
      </SectionFadeIn>

      {/* Sample Exams Section */}
      <section className="py-8">
      </section>

      {/* Testimonials Section */}
      <TestimonialsAnimated />

      {/* Recommended Books Section */}
      <SectionFadeIn delay={0.2}>
        <RecommendedBooksSection />
      </SectionFadeIn>

      {/* รับสมัครทนายและล่าม — ลิงก์ไปหน้าสมัครบนเว็บหลัก */}
      <SectionFadeIn delay={0.2}>
        <section className="rounded-3xl text-white p-6 md:p-12 bg-[linear-gradient(135deg,#082a5a,#0B3979,#0B3979)]">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-4xl font-bold">ร่วมงานกับ Lawslane</h2>
            <p className="mt-3 text-blue-100 md:text-lg max-w-2xl mx-auto">
              สอบผ่านแล้วหรือเป็นทนายความอยู่แล้ว? ใช้ความรู้กฎหมายหารายได้บนแพลตฟอร์มของเรา
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Briefcase,
                title: 'สมัครเป็นทนายความ',
                description: 'สร้างโปรไฟล์ทนาย รับเคสและลูกความใหม่ผ่าน Lawslane พร้อมระบบนัดหมายและแชทปรึกษาออนไลน์',
                href: 'https://lawslane.com/th/for-lawyers',
                cta: 'สมัครเป็นทนาย',
              },
              {
                icon: Languages,
                title: 'สมัครเป็นล่ามกฎหมาย',
                description: 'ใช้ภาษาต่างประเทศรับงานล่ามศาล สถานีตำรวจ และแปลเอกสารกฎหมาย ตั้งเรทราคาเอง รับงานได้ทั้งในพื้นที่และออนไลน์',
                href: 'https://lawslane.com/th/for-interpreters',
                cta: 'สมัครเป็นล่าม',
              },
            ].map(({ icon: Icon, title, description, href, cta }) => (
              <div key={href} className="rounded-2xl bg-white/10 border border-white/15 p-6 md:p-8 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-white text-[#0B3979] flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold">{title}</h3>
                <p className="mt-2 text-blue-100 flex-1">{description}</p>
                <a
                  href={href}
                  className="mt-6 inline-flex items-center justify-center gap-2 self-start rounded-full bg-white text-[#0B3979] font-bold px-6 h-11 hover:bg-slate-100 transition-colors"
                >
                  {cta} <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </section>
      </SectionFadeIn>



      
      
    </div>
  );
}
