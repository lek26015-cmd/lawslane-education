import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Target, ChevronRight } from "lucide-react";
import { ArticlesSection } from "@/components/education/articles-section";
import { RecommendedBooksSection } from '@/components/education/recommended-books';
import {
  FeatureCardsAnimated,
  TestimonialsAnimated,
  ExamCategoriesAnimated,
} from '@/components/education/animated-sections';
import { SampleExamsList } from '@/components/education/sample-exams-list';
import { HeroFadeIn, SectionFadeIn } from '@/components/education/fade-in';

export default function EducationPage() {
  return (
    <div className="flex flex-col gap-12 overflow-x-hidden" key="education-page-v5-cache-buster">
      {/* Hero Section - Exam Focused */}
      <HeroFadeIn>
        <section
          className="relative overflow-hidden rounded-3xl text-white p-6 md:p-12 lg:p-20"
          style={{ background: 'linear-gradient(to bottom right, #581c87, #312e81, #0f172a)' }}
        >
          <div className="relative z-20 max-w-2xl space-y-6 mx-auto lg:mx-0 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight">
              ฝึกทำข้อสอบ<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-200">
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
              <span className="px-3 py-1 bg-amber-500/30 rounded-full text-xs md:text-sm text-amber-200">ข้อสอบทนาย</span>
            </div>

            <div className="flex flex-wrap gap-3 md:gap-4 pt-4 justify-center lg:justify-start">
              <Link href="/exams">
                <Button
                  size="lg"
                  className="bg-white !text-purple-900 border border-white hover:bg-slate-100 font-bold rounded-full px-6 md:px-8 h-10 md:h-12 text-sm md:text-base shadow-lg relative z-10"
                  style={{ color: '#4c1d95' }}
                >
                  เริ่มทำข้อสอบเลย
                </Button>
              </Link>
              <Link href="/books">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/20 hover:text-white rounded-full px-6 md:px-8 h-10 md:h-12 text-sm md:text-base backdrop-blur-sm relative z-10 font-medium">
                  ดูหนังสือประกอบ
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image - Absolute Positioned - Hidden on small mobile */}
          <div className="hidden md:flex absolute bottom-0 right-4 lg:right-8 h-[95%] w-auto z-10 items-end pointer-events-none">
            <img
              src="/images/lawslane-education-catoon.png"
              alt="Lawlanes Education"
              className="w-full h-auto object-contain drop-shadow-2xl"
            />
          </div>

          {/* Background decoration elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
            <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
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

      {/* Exam CTA - Big Card */}
      <SectionFadeIn delay={0.1}>
        <Link href="/exams" className="group block relative no-underline">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-20">
              {/* Text Content */}
              <div className="flex-1 space-y-6 text-center md:text-left">
                <div className="space-y-4">
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
                    วัดระดับความพร้อมก่อนลงสนามจริงด้วย<br />
                    <span className="text-[#4c1d95] font-extrabold">Skill Score by Lawslane</span>
                  </h3>
                  <p className="text-lg text-slate-500 font-light leading-relaxed max-w-2xl mx-auto md:mx-0">
                    ระบบทดสอบวัดระดับความรู้กฎหมายที่ช่วยวิเคราะห์จุดแข็ง (Strengths) และจุดอ่อน (Gaps)
                    ของคุณได้อย่างแม่นยำ พร้อมระบบจับเวลาเสมือนจริง เพื่อเตรียมความพร้อมให้มั่นใจที่สุดก่อนสอบจริง
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    size="lg"
                    className="rounded-full bg-[#4c1d95] hover:bg-[#3b1775] text-white font-bold text-lg px-10 h-14 shadow-lg shadow-indigo-900/20"
                    style={{ backgroundColor: '#4c1d95', color: '#ffffff' }}
                  >
                    เลือกแบบทดสอบ
                  </Button>
                </div>
              </div>

              {/* Illustration */}
              <div className="flex-1 w-full max-w-lg lg:max-w-xl">
                <div className="relative aspect-[4/3] w-full">
                  {/* Decorative elements */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-100 rounded-full blur-2xl opacity-60" />
                  <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-teal-100 rounded-full blur-2xl opacity-60" />

                  <div className="relative h-full w-full bg-slate-50 rounded-2xl border border-slate-100 p-2 shadow-sm group-hover:-translate-y-2 transition-transform duration-500">
                    <img
                      src="/images/lawslane-education-catoon.png"
                      alt="Skill Score Dashboard"
                      className="w-full h-full object-contain drop-shadow-md rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </SectionFadeIn>

      {/* Exam Categories Section */}
      <SectionFadeIn delay={0.15}>
        <ExamCategoriesAnimated />
      </SectionFadeIn>

      {/* Popular Exams Section (List View) */}
      <SectionFadeIn delay={0.2}>
        <div className="space-y-6">
          <div className="flex justify-between items-center px-4 md:px-0">
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-indigo-600" />
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

      {/* Articles from Main Site */}
      <ArticlesSection />
    </div>
  );
}
