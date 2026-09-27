import Link from "next/link";
import Image from "next/image";
import interpreterHero from "@/pic/lawslane-interpreter.webp";

import { Button } from "@/components/ui/button";
import { GoogleAd } from '@/components/google-ad';
import { Target, ChevronRight, Briefcase, Languages, ArrowRight, Check } from "lucide-react";
import { RecommendedBooksSection } from '@/components/education/recommended-books';
import {
  FeatureCardsAnimated,
  TestimonialsAnimated,
  ExamCategoriesAnimated,
} from '@/components/education/animated-sections';
import { SampleExamsList } from '@/components/education/sample-exams-list';
import { LatestArticlesSection } from '@/components/education/latest-articles';
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
    <div className="flex flex-col gap-12">
      {/* Hero — แบบเว็บหลัก lawslane.com: slate-900 เต็มความกว้างจอ ขอบล่างโค้ง ชิดใต้ header
          (ยืดออกนอกกล่อง max-w-6xl ของ layout ด้วย w-screen + translate · main ใน layout ตัดส่วนเกินแนวนอน) */}
      <HeroFadeIn>
        <section className="relative left-1/2 w-screen -translate-x-1/2 -mt-8 bg-slate-900 text-white rounded-b-[40px] md:rounded-b-[80px] overflow-hidden">
          <div className="relative mx-auto max-w-6xl px-4 md:px-6 pt-8 md:pt-12 lg:pt-20 lg:flex lg:items-end lg:justify-between lg:gap-8">
            {/* มือถือ/ไอแพด: รูปอยู่บนข้อความ ขอบล่างจางเข้าพื้น (แบบ hero มือถือของเว็บหลัก) */}
            <div className="lg:hidden relative mx-auto w-[260px] h-[260px] sm:w-[340px] sm:h-[340px] pointer-events-none">
              <Image
                src="/images/lawslane-education-catoon.png"
                alt="Lawslane Wittaya"
                fill
                className="object-contain object-bottom opacity-90"
                priority
                quality={100}
                unoptimized
              />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-900 to-transparent" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto lg:mx-0 space-y-6 text-center lg:text-left -mt-6 lg:mt-0 pb-14 md:pb-20 lg:pb-24">
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tighter leading-tight">
                ฝึกทำข้อสอบกฎหมาย<br />
                <span className="text-blue-200">จนกว่าจะมั่นใจ</span>
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                ข้อสอบครบทุกวิชา ทั้ง <strong className="text-white font-semibold">แพ่ง วิแพ่ง อาญา วิอาญา</strong> พร้อมธงคำตอบละเอียด
                เหมาะกับนักศึกษา<strong className="text-white font-semibold">ปี 1 ถึงเตรียมสอบเนติบัณฑิต</strong>
              </p>

              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {['กฎหมายแพ่ง', 'วิธีพิจารณาความแพ่ง', 'กฎหมายอาญา', 'วิธีพิจารณาความอาญา', 'ข้อสอบทนาย'].map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-white/10 border border-white/15 rounded-full text-xs md:text-sm text-gray-200">{tag}</span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 justify-center lg:justify-start">
                <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-gray-100 text-base md:text-lg font-bold px-8 rounded-xl">
                  <Link href="/exams">เริ่มทำข้อสอบเลย</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white text-base md:text-lg font-semibold px-8 rounded-xl">
                  <Link href="/books">ดูหนังสือประกอบ</Link>
                </Button>
              </div>
            </div>

            <div className="hidden lg:block relative shrink-0 w-[440px] h-[460px] pointer-events-none">
              <Image
                src="/images/lawslane-education-catoon.png"
                alt="Lawslane Wittaya"
                fill
                className="object-contain object-bottom opacity-90"
                priority
                quality={100}
                unoptimized
              />
            </div>
          </div>
        </section>
      </HeroFadeIn>

      {/* เหมาะสำหรับ — ชิปมีเครื่องหมายถูก แบบ section ค้นหาทนายของเว็บหลัก */}
      <SectionFadeIn delay={0.1}>
        <section className="text-center space-y-5">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0B3979]">เหมาะสำหรับ</h2>
          <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-4 text-left">
            {['นักศึกษานิติศาสตร์ ปี 1-4', 'เตรียมสอบใบอนุญาตว่าความ', 'เตรียมสอบเนติบัณฑิต'].map((item) => (
              <div key={item} className="flex items-center gap-3 bg-white px-5 py-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-slate-700 font-medium">{item}</span>
              </div>
            ))}
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
              <h2 className="text-2xl md:text-3xl font-bold text-[#0B3979]">ข้อสอบยอดนิยม</h2>
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

      {/* Testimonials Section */}
      <TestimonialsAnimated />

      {/* Recommended Books Section */}
      <SectionFadeIn delay={0.2}>
        <RecommendedBooksSection />
      </SectionFadeIn>

      {/* แบนเนอร์ล่ามกฎหมาย — บริการในเครือบนเว็บหลัก (slate-900 แบบ hero lawslane.com) */}
      <SectionFadeIn delay={0.2}>
        <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white md:flex md:items-end md:justify-between md:gap-8">
          <div className="md:hidden relative h-60">
            <Image src={interpreterHero} alt="" fill sizes="100vw" className="object-contain object-top opacity-80" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900 to-transparent" />
          </div>
          <div className="relative px-6 pb-10 -mt-6 text-center md:mt-0 md:py-14 md:pl-12 md:text-left">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">Lawslane</p>
            <h2 className="mt-2 text-2xl md:text-4xl font-bold">ล่ามและนักแปลกฎหมาย</h2>
            <p className="mt-3 text-gray-300 max-w-xl mx-auto lg:mx-0">
              ล่ามสำหรับงานศาล สถานีตำรวจ คุยกับทนาย และแปลเอกสารกฎหมาย ดูราคาชัดเจนก่อนจอง
            </p>
            <a
              href="https://lawslane.com/th/interpreters"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 h-11 font-bold text-slate-900 hover:bg-slate-100 transition-colors"
            >
              ค้นหาล่าม <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <Image src={interpreterHero} alt="" sizes="260px" className="hidden md:block w-56 lg:w-64 h-auto mr-8" />
        </section>
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

      {/* บทความล่าสุด — ส่วนท้ายหน้าแรก */}
      <SectionFadeIn delay={0.2}>
        <LatestArticlesSection />
      </SectionFadeIn>


      
      
    </div>
  );
}
