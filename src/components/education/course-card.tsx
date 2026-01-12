'use client';

import { Course } from "@/lib/education-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Star, PlayCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface CourseCardProps {
    course: Course;
    href?: string;
}

export function CourseCard({ course, href }: CourseCardProps) {
    return (
        <Link href={href || `/education/courses/${course.id}`} className="group block h-full">
            <div className="flex flex-col h-full bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                {/* Cover Image */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    <Image
                        src={course.coverUrl}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Badge Overlay */}
                    <div className="absolute top-3 left-3">
                        <div className="bg-[#FF6B2C] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                            <PlayCircle className="w-3 h-3 fill-white" />
                            ONLINE COURSE
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 flex flex-col gap-3">
                    {/* Category */}
                    <div className="text-xs font-bold text-[#FF6B2C] uppercase tracking-wide">
                        {course.category}
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-lg text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors -mt-1">
                        {course.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                        {course.description}
                    </p>

                    {/* Rating */}
                    {(course.rating || 0) > 0 && (
                        <div className="flex items-center gap-1">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-4 h-4 ${star <= Math.round(course.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-bold text-amber-500 ml-1">{course.rating}</span>
                        </div>
                    )}

                    {/* Instructor */}
                    <div className="flex items-center gap-2 mt-auto pt-2">
                        {course.instructor.avatarUrl ? (
                            <Image
                                src={course.instructor.avatarUrl}
                                alt={course.instructor.name}
                                width={24}
                                height={24}
                                className="rounded-full bg-slate-100"
                            />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                                {course.instructor.name.charAt(0)}
                            </div>
                        )}
                        <span className="text-xs text-slate-500 font-medium truncate">
                            {course.instructor.name}
                        </span>
                    </div>

                    {/* Footer: Duration & Price */}
                    <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-50">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{Math.round(course.totalDurationMinutes / 60)} ชั่วโมง</span>
                        </div>
                        <div className="font-bold">
                            {course.price === 0 ? (
                                <span className="text-green-600">ฟรี</span>
                            ) : (
                                <span className="text-green-600">฿{course.price.toLocaleString()}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
