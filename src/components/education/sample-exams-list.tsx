'use client';

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Star } from "lucide-react";
const educationHero = "/images/education-hero.png";
const lawlanesHero = "/images/Lawlanes-Hero-cover.jpg";

// Sample Exams as List
export function SampleExamsList() {
    const exams = [
        {
            id: 1,
            title: "ข้อสอบกฎหมายแพ่ง: นิติกรรมและสัญญา",
            description: "ทดสอบความเข้าใจเรื่องนิติกรรม สัญญา และผลของสัญญา",
            thumbnail: educationHero,
            instructorName: "ทีมวิชาการ",
            badge: "ฟรี",
            category: "ปี 1",
            rating: "easy",
            href: "/education/exams/exam-1"
        },
        {
            id: 2,
            title: "ข้อสอบกฎหมายแพ่ง: ทรัพย์สินและที่ดิน",
            description: "เน้นเรื่องกรรมสิทธิ์ ครอบครอง ภาระจำยอม และสิทธิเหนือที่ดิน",
            thumbnail: lawlanesHero,
            instructorName: "ทีมวิชาการ",
            badge: "฿99",
            rating: "medium",
            category: "ปี 2",
            href: "/education/exams/exam-2"
        },
        {
            id: 4,
            title: "ข้อสอบวิธีพิจารณาความแพ่ง: การดำเนินคดี",
            description: "ขั้นตอนการฟ้องคดี การส่งหมาย พยานหลักฐาน และการบังคับคดี",
            thumbnail: educationHero,
            instructorName: "อ.สมชาย",
            badge: "฿150",
            rating: "hard",
            category: "ปี 3",
            href: "/education/exams/exam-4"
        },
        {
            id: 6,
            title: "จำลองสอบใบอนุญาตว่าความ (ภาคทฤษฎี) ชุดที่ 1",
            description: "ข้อสอบเสมือนจริง 100 ข้อ จำกัดเวลา 4 ชั่วโมง",
            thumbnail: lawlanesHero,
            instructorName: "สภาทนายความ",
            badge: "ฟรี",
            rating: "hard",
            category: "ใบอนุญาต",
            href: "/education/exams/exam-6"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map((exam, idx) => (
                <Link
                    key={exam.id}
                    href={exam.href}
                    className="group flex gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                >
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
                        <Image
                            src={exam.thumbnail}
                            alt={exam.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {exam.badge && (
                            <div className="absolute top-0 left-0 bg-indigo-600 text-[10px] text-white px-2 py-0.5 font-bold">
                                {exam.badge}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                {exam.category}
                            </span>
                            <div className="flex items-center text-[10px] text-amber-500 font-bold">
                                <Star className="w-3 h-3 fill-current mr-0.5" />
                                {exam.rating}
                            </div>
                        </div>
                        <h3 className="font-bold text-slate-900 leading-tight mb-1 group-hover:text-indigo-700 transition-colors line-clamp-2">
                            {exam.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                            {exam.description}
                        </p>
                        <div className="flex items-center text-xs text-slate-400">
                            <span>สอนโดย {exam.instructorName}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-center text-slate-300 group-hover:text-indigo-500 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </div>
                </Link>
            ))}
        </div>
    );
}
