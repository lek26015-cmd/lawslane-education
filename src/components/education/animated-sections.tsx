'use client';

import Link from "next/link";
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Clock, Target, Award, FileText, Quote } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious
} from "@/components/ui/carousel";
import { CourseCard } from "./course-card";
import { ReactNode } from 'react';

// Image paths from public folder
const profileLawyer = "/images/profile-lawyer.jpg";
const educationHero = "/images/education-hero.png";
const lawlanesHero = "/images/Lawlanes-Hero-cover.jpg";

// Feature Cards with Framer Motion Animation
export function FeatureCardsAnimated() {
    const features = [
        { icon: FileText, title: "ข้อสอบครบทุกวิชา", desc: "แพ่ง วิแพ่ง อาญา วิอาญา และอื่นๆ" },
        { icon: Clock, title: "จับเวลาเสมือนจริง", desc: "ฝึกบริหารเวลาให้ชินก่อนสอบจริง" },
        { icon: Target, title: "ธงคำตอบละเอียด", desc: "เทียบแนววินิจฉัยทันทีหลังส่งข้อสอบ" },
        { icon: Award, title: "ประวัติการสอบ", desc: "ดูพัฒนาการและจุดอ่อนของตัวเอง" }
    ];

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
        <motion.section
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
        >
            {features.map((feature, idx) => (
                <motion.div
                    key={idx}
                    variants={itemVariants}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white border rounded-xl p-6 text-center cursor-pointer shadow-sm hover:shadow-lg"
                >
                    <motion.div
                        className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <feature.icon className="w-6 h-6 text-slate-600" />
                    </motion.div>
                    <h3 className="font-bold text-lg mb-1 text-slate-900">{feature.title}</h3>
                    <p className="text-sm text-slate-600">{feature.desc}</p>
                </motion.div>
            ))}
        </motion.section>
    );
}

// Testimonials with Framer Motion Animation
export function TestimonialsAnimated() {
    const testimonials = [
        {
            quote: "ข้อสอบครบทุกวิชา พร้อมธงคำตอบละเอียดมาก ช่วยให้เข้าใจแนวการเขียนวินิจฉัยได้ดีขึ้น ทำให้สอบใบอนุญาตผ่านรอบแรก",
            name: "คุณกานต์",
            role: "สอบผ่านใบอนุญาตว่าความ 2025",
            initial: "ก"
        },
        {
            quote: "เหมาะมากสำหรับนักศึกษาที่ต้องการฝึกทำข้อสอบก่อนสอบปลายภาค ข้อสอบดีช่วยทบทวนความรู้ได้ดี",
            name: "คุณปิยะ",
            role: "นักศึกษานิติศาสตร์ ปี 3",
            initial: "ป"
        },
        {
            quote: "ใช้ฝึกเตรียมสอบเนติบัณฑิต ข้อสอบอัตนัยช่วยให้ฝึกเขียนคำตอบได้จริง ไม่ใช่แค่ท่องจำ ธงคำตอบอธิบายละเอียดมาก",
            name: "คุณวรรณ",
            role: "เตรียมสอบเนติบัณฑิต",
            initial: "ว"
        }
    ];

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 }
        }
    };

    return (
        <section className="py-8">
            <motion.h2
                className="text-2xl font-bold text-center mb-8 text-slate-900"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                รีวิวจากผู้ใช้งานจริง
            </motion.h2>
            <motion.div
                className="grid md:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
            >
                {testimonials.map((t, idx) => (
                    <motion.div
                        key={idx}
                        variants={cardVariants}
                        whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                        className="bg-white border rounded-2xl p-6 transition-shadow"
                    >
                        <motion.div
                            initial={{ rotate: 0 }}
                            whileHover={{ rotate: -5 }}
                        >
                            <Quote className="w-8 h-8 text-indigo-200 mb-4" />
                        </motion.div>
                        <p className="text-slate-600 mb-4">"{t.quote}"</p>
                        <div className="flex items-center gap-3">
                            <motion.div
                                className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium"
                                whileHover={{ scale: 1.1 }}
                            >
                                {t.initial}
                            </motion.div>
                            <div>
                                <p className="font-medium text-slate-900">{t.name}</p>
                                <p className="text-sm text-slate-500">{t.role}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}

// Exam Categories with Framer Motion Animation
export function ExamCategoriesAnimated() {
    const categories = [
        { name: "กฎหมายแพ่ง", count: "25 ชุด", href: "/exams?category=civil", colors: "from-blue-50 to-blue-100 border-blue-200 hover:border-blue-400", iconBg: "bg-blue-500", textColor: "text-blue-900", countColor: "text-blue-600" },
        { name: "วิ.แพ่ง", count: "18 ชุด", href: "/exams?category=civil-procedure", colors: "from-green-50 to-green-100 border-green-200 hover:border-green-400", iconBg: "bg-green-500", textColor: "text-green-900", countColor: "text-green-600" },
        { name: "กฎหมายอาญา", count: "22 ชุด", href: "/exams?category=criminal", colors: "from-red-50 to-red-100 border-red-200 hover:border-red-400", iconBg: "bg-red-500", textColor: "text-red-900", countColor: "text-red-600" },
        { name: "วิ.อาญา", count: "20 ชุด", href: "/exams?category=criminal-procedure", colors: "from-purple-50 to-purple-100 border-purple-200 hover:border-purple-400", iconBg: "bg-purple-500", textColor: "text-purple-900", countColor: "text-purple-600" }
    ];

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.4 }
        }
    };

    return (
        <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-30px" }}
        >
            {categories.map((cat, idx) => (
                <motion.div key={idx} variants={itemVariants}>
                    <Link href={cat.href} className="group block">
                        <motion.div
                            className={`bg-gradient-to-br ${cat.colors} border rounded-xl p-4 transition-all`}
                            whileHover={{ scale: 1.05, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex items-center gap-3">
                                <motion.div
                                    className={`w-10 h-10 ${cat.iconBg} rounded-lg flex items-center justify-center text-white`}
                                    whileHover={{ rotate: 10 }}
                                >
                                    <FileText className="w-5 h-5" />
                                </motion.div>
                                <div>
                                    <h3 className={`font-bold ${cat.textColor}`}>{cat.name}</h3>
                                    <p className={`text-xs ${cat.countColor}`}>{cat.count}ข้อสอบ</p>
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                </motion.div>
            ))}
        </motion.div>
    );
}

// Sample Exams with Animation
export function SampleExamsAnimated() {
    const exams = [
        {
            id: 1,
            title: "คอร์สติวสอบใบอนุญาตว่าความ ภาคทฤษฎี รุ่น 61",
            description: "ปูพื้นฐานกฎหมายวิธีพิจารณาความแพ่งและอาญา พร้อมเทคนิคการเขียนตอบข้อสอบอัตนัยให้ได้คะแนนดี เจาะลึกธงคำตอบจากสนามสอบจริง",
            thumbnail: educationHero,
            instructorName: "อ.ทิวา (ทนายความอาวุโส)",
            instructorImage: profileLawyer,
            badge: "แนะนำ",
            category: "ตั๋วทนาย",
            href: "/exams/1"
        },
        {
            id: 2,
            title: "ตะลุยโจทย์ข้อสอบเนติบัณฑิต ขาแพ่ง-อาญา",
            description: "รวมข้อสอบเก่ากว่า 10 ปี พร้อมเฉลยละเอียดและฎีกาที่น่าสนใจ อัพเดทล่าสุดปี 2568 เน้นจุดที่ออกสอบบ่อย",
            thumbnail: lawlanesHero,
            instructorName: "อ.ณัฐ (เนติบัณฑิตไทย)",
            instructorImage: profileLawyer,
            badge: "ขายดี",
            rating: "4.9/5",
            category: "เนติบัณฑิต",
            href: "/exams/2"
        },
        {
            id: 3,
            title: "สรุปหลักกฎหมายแพ่งและพาณิชย์ สำหรับนักศึกษาปี 1-4",
            description: "เข้าใจง่าย ใช้สอบได้จริง ครอบคลุมเนื้อหาสำคัญทั้งบรรพ 1-6 พร้อมตัวอย่างประกอบและการเขียนตอบข้อสอบ",
            thumbnail: educationHero,
            instructorName: "พี่บิว (เกียรตินิยมอันดับ 1)",
            instructorImage: profileLawyer,
            badge: "PREMIUM",
            rating: "HOT",
            category: "กฎหมายแพ่ง",
            href: "/exams/3"
        },
        {
            id: 4,
            title: "ติวเข้มวิ.แพ่ง ภาคบังคับคดีและอุทธรณ์-ฎีกา",
            description: "เจาะลึกกระบวนพิจารณาในชั้นบังคับคดีและชั้นศาลสูง พร้อมตัวอย่างคำร้องคำขอที่สำคัญ",
            thumbnail: lawlanesHero,
            instructorName: "อ.สมชาย (ผู้เชี่ยวชาญ)",
            instructorImage: profileLawyer,
            category: "วิ.แพ่ง",
            href: "/exams/4"
        }
    ];

    return (
        <motion.div
            className="w-full px-4 md:px-12 relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-4 pb-4">
                    {exams.map((exam) => (
                        <CarouselItem key={exam.id} className="pl-4 basis-[85%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/5">
                            <div className="h-full py-2">
                                <CourseCard
                                    href={exam.href}
                                    course={{
                                        id: exam.id.toString(),
                                        title: exam.title,
                                        description: exam.description,
                                        coverUrl: exam.thumbnail,
                                        category: exam.category,
                                        rating: parseFloat(exam.rating || "0"),
                                        instructor: {
                                            id: "1",
                                            name: exam.instructorName,
                                            avatarUrl: exam.instructorImage
                                        },
                                        totalDurationMinutes: 0,
                                        price: 0,
                                        level: 'Beginner',
                                        modules: [],
                                        createdAt: new Date(),
                                        updatedAt: new Date(),
                                        isPublished: true,
                                        studentCount: 0
                                    } as any}
                                />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="-left-4 lg:-left-12 h-12 w-12 bg-white shadow-lg border-0 text-slate-800 hover:bg-slate-50 hover:text-primary" />
                <CarouselNext className="-right-4 lg:-right-12 h-12 w-12 bg-white shadow-lg border-0 text-slate-800 hover:bg-slate-50 hover:text-primary" />
            </Carousel>
        </motion.div>
    );
}
