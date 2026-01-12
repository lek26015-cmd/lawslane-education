
import { getCourseById } from "@/lib/education-data-admin";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayCircle, Clock, BookOpen, Star, CheckCircle, ChevronLeft, Lock } from "lucide-react";
import { CourseActionButtons } from "@/components/education/course-action-buttons";


export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const course = await getCourseById(id);

    if (!course) {
        notFound();
    }

    return (
        <div className="space-y-8">
            {/* Breadcrumb / Back */}
            <div className="container mx-auto px-4 md:px-6">
                <Link href="/courses" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    กลับหน้ารายการคอร์ส
                </Link>
            </div>

            {/* Hero Section */}
            <div className="bg-white border-b pb-12 pt-4">
                <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-3">
                            <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none">{course.category}</Badge>
                            <Badge variant="outline">{course.level}</Badge>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                            {course.title}
                        </h1>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            {course.description}
                        </p>

                        <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {Math.round(course.totalDurationMinutes / 60)} ชั่วโมง {course.totalDurationMinutes % 60} นาที
                            </div>
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                {course.totalLessons} บทเรียน
                            </div>
                            <div className="flex items-center gap-2 text-amber-500">
                                <Star className="w-4 h-4 fill-current" />
                                {course.rating} ({course.reviewCount} รีวิว)
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-100">
                                {course.instructor.avatarUrl ? (
                                    <Image src={course.instructor.avatarUrl} alt={course.instructor.name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-lg">
                                        {course.instructor.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="text-sm text-slate-500">สอนโดย</div>
                                <div className="font-semibold text-slate-900">{course.instructor.name}</div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Sticky Card */}
                    <div className="relative">
                        <div className="sticky top-24 bg-white border rounded-2xl shadow-xl overflow-hidden">
                            {/* Preview Video / Image */}
                            <div className="relative aspect-video bg-slate-900 cursor-pointer group">
                                <Image
                                    src={course.coverUrl}
                                    alt={course.title}
                                    fill
                                    className="object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <PlayCircle className="w-16 h-16 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="absolute bottom-4 left-0 right-0 text-center text-white font-medium text-sm">
                                    ดูตัวอย่างคอร์สเรียน
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="text-3xl font-bold text-slate-900">
                                    ฿{course.price.toLocaleString()}
                                </div>

                                <CourseActionButtons course={course} />

                                <div className="space-y-3 text-sm text-slate-600">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span>เข้าเรียนได้ตลอดชีพ</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span>เรียนจบรับใบประกาศนียบัตร</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span>รองรับทั้งคอมฯ Tablet และมือถือ</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Content Stuff */}
            <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 pb-20">
                <div className="lg:col-span-2">
                    <Tabs defaultValue="curriculum" className="w-full">
                        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent space-x-8">
                            <TabsTrigger
                                value="curriculum"
                                className="rounded-none border-b-2 border-transparent px-4 py-3 font-medium text-slate-500 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 bg-transparent shadow-none"
                            >
                                เนื้อหาบทเรียน
                            </TabsTrigger>
                            <TabsTrigger
                                value="description"
                                className="rounded-none border-b-2 border-transparent px-4 py-3 font-medium text-slate-500 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 bg-transparent shadow-none"
                            >
                                รายละเอียด
                            </TabsTrigger>
                            <TabsTrigger
                                value="instructor"
                                className="rounded-none border-b-2 border-transparent px-4 py-3 font-medium text-slate-500 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 bg-transparent shadow-none"
                            >
                                ผู้สอน
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-8">
                            <TabsContent value="curriculum" className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-slate-900">หลักสูตร ({course.totalLessons} บทเรียน)</h3>
                                    <span className="text-sm text-slate-500">ความยาวรวม {Math.round(course.totalDurationMinutes / 60)} ชม. {course.totalDurationMinutes % 60} นาที</span>
                                </div>

                                {course.modules.length > 0 ? (
                                    course.modules.map((module, index) => (
                                        <div key={module.id} className="border rounded-xl overflow-hidden">
                                            <div className="bg-slate-50 px-6 py-4 border-b flex items-center justify-between">
                                                <h4 className="font-semibold text-slate-900">
                                                    ส่วนที่ {index + 1}: {module.title}
                                                </h4>
                                                <span className="text-xs text-slate-500">{module.lessons.length} บทเรียน</span>
                                            </div>
                                            <div className="divide-y">
                                                {module.lessons.map(lesson => (
                                                    <div key={lesson.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer">
                                                        <div className="flex items-center gap-3">
                                                            {lesson.isFreePreview ? (
                                                                <PlayCircle className="w-5 h-5 text-indigo-600" />
                                                            ) : (
                                                                <Lock className="w-4 h-4 text-slate-400" />
                                                            )}
                                                            <span className={`text-sm ${lesson.isFreePreview ? 'text-indigo-700 font-medium' : 'text-slate-600'}`}>
                                                                {lesson.title}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            {lesson.isFreePreview && (
                                                                <Badge variant="secondary" className="text-xs bg-indigo-50 text-indigo-600 border-indigo-100">ดูฟรี</Badge>
                                                            )}
                                                            <span className="text-xs text-slate-400">{lesson.durationMinutes} นาที</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-slate-50 rounded-xl border-dashed border">
                                        ยังไม่มีข้อมูลหลักสูตร
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="description" className="prose prose-slate max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: course.longDescription || course.description }} />
                            </TabsContent>

                            <TabsContent value="instructor">
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-6">
                                            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                                                {course.instructor.avatarUrl ? (
                                                    <Image src={course.instructor.avatarUrl} alt={course.instructor.name} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-2xl">
                                                        {course.instructor.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900">{course.instructor.name}</h3>
                                                    <p className="text-indigo-600">{course.instructor.bio}</p>
                                                </div>
                                                <p className="text-slate-600 text-sm">
                                                    ผู้เชี่ยวชาญด้านกฎหมายที่มีประสบการณ์สอนมายาวนาน เน้นการสอนที่เข้าใจง่าย นำไปใช้ได้จริง และมีเทคนิคการจดจำที่เป็นเอกลักษณ์
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
