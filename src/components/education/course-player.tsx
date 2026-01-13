'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlayCircle, CheckCircle, ChevronLeft, ChevronRight, Menu, BookOpen, MessageSquare, Download, Lock, Award } from 'lucide-react';
import { Course } from '@/lib/education-types';

interface CoursePlayerProps {
    course: Course;
    initialLessonId?: string;
}

export function CoursePlayer({ course, initialLessonId }: CoursePlayerProps) {
    const router = useRouter();

    // Flatten lessons for easier navigation
    const allLessons = course.modules.flatMap(m => m.lessons);

    const [activeLessonId, setActiveLessonId] = useState<string>(
        initialLessonId || allLessons[0]?.id || ''
    );
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Demo state for completion
    const [progress, setProgress] = useState(10); // 10% default

    const activeLesson = allLessons.find(l => l.id === activeLessonId) || allLessons[0];
    const activeModule = course.modules.find(m => m.lessons.some(l => l.id === activeLessonId));

    const activeLessonIndex = allLessons.findIndex(l => l.id === activeLessonId);
    const hasNext = activeLessonIndex < allLessons.length - 1;
    const hasPrev = activeLessonIndex > 0;

    const handleNext = () => {
        if (hasNext) {
            setActiveLessonId(allLessons[activeLessonIndex + 1].id);
        }
    };

    const handlePrev = () => {
        if (hasPrev) {
            setActiveLessonId(allLessons[activeLessonIndex - 1].id);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col h-[100dvh] bg-slate-50">
            {/* Top Bar */}
            <header className="flex-shrink-0 bg-white border-b h-16 flex items-center justify-between px-4 z-40 shadow-sm relative">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/my-learning')} className="text-slate-500 hover:text-slate-900">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="font-bold text-slate-900 text-sm md:text-base line-clamp-1">{course.title}</h1>
                        <p className="text-xs text-slate-500 line-clamp-1">
                            {activeModule?.title} • {activeLesson?.title}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Demo Control */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-slate-400 hover:text-indigo-600 hidden lg:flex"
                        onClick={() => setProgress(progress === 100 ? 10 : 100)}
                    >
                        [DEMO: Toggle 100%]
                    </Button>

                    {progress === 100 && (
                        <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white animate-in fade-in"
                            onClick={() => router.push(`/certificates/${course.id}`)}
                        >
                            <Award className="w-4 h-4 mr-2" />
                            รับใบประกาศ
                        </Button>
                    )}

                    <div className="hidden md:flex items-center text-xs text-slate-500 mr-4">
                        <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden mr-2">
                            <div
                                className={`h-full w-[${progress}%] transition-all duration-1000 ${progress === 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        {progress}% สำเร็จ
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="hidden md:flex"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? 'ซ่อนเมนู' : 'แสดงเมนู'}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <Menu className="w-5 h-5" />
                    </Button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Center Content (Player) */}
                <main className={`flex-1 flex flex-col overflow-y-auto transition-all duration-300 ${isSidebarOpen ? 'md:mr-80' : ''}`}>
                    <div className="flex-shrink-0 bg-black aspect-video md:max-h-[70vh] w-full relative flex items-center justify-center">
                        {/* Video Mockup */}
                        {activeLesson ? (
                            <div className="w-full h-full relative group">
                                <img
                                    src={`https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1920`}
                                    alt="Video Placeholder"
                                    className="w-full h-full object-cover opacity-60"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                                        <PlayCircle className="w-12 h-12 text-white fill-white" />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                                    <h2 className="text-xl font-bold">{activeLesson.title}</h2>
                                    <p className="text-sm opacity-80 mt-1">{activeModule?.title}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-white">เลือกบทเรียนเพื่อเริ่มเรียน</div>
                        )}
                    </div>

                    {/* Content Tabs & Nav */}
                    <div className="bg-white border-b sticky top-0 z-30 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm">
                        <Button
                            variant="outline"
                            onClick={handlePrev}
                            disabled={!hasPrev}
                            className="gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" /> ก่อนหน้า
                        </Button>
                        <Button
                            onClick={handleNext}
                            disabled={!hasNext}
                            className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                        >
                            บทต่อไป <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full pb-20">
                        <Tabs defaultValue="description">
                            <TabsList>
                                <TabsTrigger value="description" className="gap-2"><BookOpen className="w-4 h-4" /> รายละเอียด</TabsTrigger>
                                <TabsTrigger value="qna" className="gap-2"><MessageSquare className="w-4 h-4" /> ถาม-ตอบ</TabsTrigger>
                                <TabsTrigger value="resources" className="gap-2"><Download className="w-4 h-4" /> เอกสารประกอบ</TabsTrigger>
                            </TabsList>
                            <TabsContent value="description" className="mt-6 space-y-4">
                                <h2 className="text-2xl font-bold text-slate-900">{activeLesson?.title}</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    ในบทเรียนนี้เราจะมาเรียนรู้เกี่ยวกับ... (Lorem ipsum description for demo)
                                </p>
                                <div className="p-4 bg-slate-50 border rounded-xl mt-4">
                                    <h4 className="font-semibold mb-2">สิ่งที่ได้เรียนรู้</h4>
                                    <ul className="list-disc list-inside text-slate-600 space-y-1">
                                        <li>ความเข้าใจพื้นฐาน</li>
                                        <li>เทคนิคการนำไปใช้</li>
                                        <li>กรณีศึกษาตัวอย่าง</li>
                                    </ul>
                                </div>
                            </TabsContent>
                            <TabsContent value="qna" className="mt-6">
                                <div className="text-center py-12 text-slate-500">
                                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>ยังไม่มีคำถามในบทเรียนนี้</p>
                                    <Button variant="link" className="text-indigo-600">ตั้งคำถามเป็นคนแรก</Button>
                                </div>
                            </TabsContent>
                            <TabsContent value="resources" className="mt-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                                                <Download className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">เอกสารประกอบการเรียน.pdf</p>
                                                <p className="text-xs text-slate-500">2.5 MB</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm">ดาวน์โหลด</Button>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>

                {/* Sidebar (Right) */}
                <aside className={`fixed inset-y-0 right-0 w-80 bg-white border-l transform transition-transform duration-300 z-30 pt-16 md:pt-16 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b bg-slate-50">
                            <h3 className="font-bold text-slate-900">เนื้อหาบทเรียน</h3>
                            <p className="text-xs text-slate-500 mt-1">{activeLessonIndex + 1} / {allLessons.length} บทเรียน ({Math.round(((activeLessonIndex + 1) / allLessons.length) * 100)}%)</p>
                        </div>
                        <ScrollArea className="flex-1">
                            {course.modules.map((module, mIdx) => (
                                <div key={module.id} className="border-b last:border-0">
                                    <div className="bg-slate-50/50 px-4 py-3 font-semibold text-sm text-slate-700 sticky top-0 z-10 backdrop-blur-sm">
                                        ส่วนที่ {mIdx + 1}: {module.title}
                                    </div>
                                    <div>
                                        {module.lessons.map((lesson) => {
                                            const isActive = lesson.id === activeLessonId;
                                            const isCompleted = progress === 100 || allLessons.findIndex(l => l.id === lesson.id) < activeLessonIndex;

                                            // Mock completion check for demo purposes
                                            const displayCompleted = isCompleted || (progress === 100);

                                            return (
                                                <button
                                                    key={lesson.id}
                                                    onClick={() => setActiveLessonId(lesson.id)}
                                                    className={`w-full text-left p-4 flex gap-3 transition-colors ${isActive ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
                                                >
                                                    <div className="mt-0.5">
                                                        {isActive ? (
                                                            <PlayCircle className="w-4 h-4 text-indigo-600" />
                                                        ) : displayCompleted ? (
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                        ) : lesson.isFreePreview ? (
                                                            <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                                                        ) : (
                                                            <Lock className="w-4 h-4 text-slate-300" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`text-sm ${isActive ? 'font-semibold text-indigo-900' : 'text-slate-600'}`}>
                                                            {lesson.title}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] text-slate-400">{lesson.durationMinutes} นาที</span>
                                                            {lesson.isFreePreview && <Badge variant="secondary" className="text-[10px] h-4 px-1">ดูฟรี</Badge>}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </ScrollArea>
                    </div>
                </aside>
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-20"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
