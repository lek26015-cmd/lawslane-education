
'use client';

import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress"; // Added Progress
import { BookOpen, ShoppingBag, Clock, FileText, TrendingUp, AlertCircle, Sparkles, Award, PlayCircle, Trophy, Target, Calendar, CheckCircle2, XCircle, ArrowRight, User, Settings } from "lucide-react"; // Added TrendingUp, AlertCircle, Sparkles, Trophy, Target, Calendar, CheckCircle2, XCircle, ArrowRight, User, Settings
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useUser, useFirebase } from "@/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { ExamResult } from "@/lib/education-types"; // Added ExamResult type
import { PageHeader } from '@/components/education/page-header';
import { getAllArticles } from '@/lib/data';
import type { Article } from '@/lib/types';

interface SubjectPerformance {
    subject: string;
    totalScore: number;
    totalMaxScore: number;
    count: number;
}

export default function MyLearningPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const { auth, firestore } = useFirebase();
    const [isLoading, setIsLoading] = useState(true);
    const [examHistory, setExamHistory] = useState<any[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [ebooks, setEbooks] = useState<any[]>([]); // New E-Books state

    // Basic protection
    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    // Fetch Exam History and Articles
    useEffect(() => {
        async function fetchData() {
            if (!auth?.currentUser || !firestore) return;
            setIsLoading(true);


            try {
                // Use actual UID or fallback for dev/demo to match Checkout
                const userId = auth.currentUser?.uid || 'user-123';

                // Fetch Exam History from API (bypassing Client SDK rules)
                const token = await auth.currentUser.getIdToken();
                const response = await fetch('/api/education/student-history', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Fetch My E-Books/Courses
                const ebooksResponse = await fetch(`/api/education/my-ebooks?userId=${userId}`);
                if (ebooksResponse.ok) {
                    const ebooksData = await ebooksResponse.json();
                    setEbooks(ebooksData);
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch exam history');
                }

                const history = await response.json();

                // Map API response to match local state needs if necessary
                // The API already returns what we need, but dates might need conversion if we use them as Date objects
                // In rendering, we handle `seconds` (Firestore Timestamp) or standard dates.
                // Our API returns standard ISO string or Date for `createdAt`.
                // Let's adapt the rendering code later to handle standard Dates or just leave it as is if compatible.
                // Actually, the API returns `createdAt` as string (ISO) or null.
                // The existing render code expects `{ seconds: number }` (Firestore Timestamp). 
                // We should adapt the data here to match what the component expects OR update component.
                // Easiest is to adapt here:
                const adaptedHistory = history.map((item: any) => ({
                    ...item,
                    createdAt: item.createdAt ? { seconds: new Date(item.createdAt).getTime() / 1000 } : null
                }));

                setExamHistory(adaptedHistory);

                // Fetch Articles for Recommendations from API
                // In a real app, we would filter by the user's weak areas.
                // For now, we fetch recent articles to display as recommendations.
                // Articles are public, but to avoid permission issues, we use API.
                const articlesResponse = await fetch('/api/education/articles');
                if (articlesResponse.ok) {
                    const allArticles = await articlesResponse.json();
                    setArticles(allArticles.slice(0, 3)); // Get top 3
                } else {
                    console.error("Failed to fetch articles API");
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        if (auth?.currentUser && firestore) {
            fetchData();
        }
    }, [auth?.currentUser, firestore]);

    // Calculate Analytics
    const analytics = useMemo(() => {
        if (examHistory.length === 0) return { subjects: [] };

        const subjectScores: Record<string, { total: number, max: number }> = {};

        examHistory.forEach((exam: any) => {
            const result = exam.result;
            const questions = exam.questions || [];

            // Aggregate Subject Scores
            if (result && result.analysis) {
                result.analysis.forEach((ans: any) => {
                    const question = questions.find((q: any) => q.id === ans.questionId);
                    const subject = question?.subject || 'กฎหมายทั่วไป';

                    if (!subjectScores[subject]) subjectScores[subject] = { total: 0, max: 0 };

                    // Accumulate score
                    subjectScores[subject].total += ans.score || 0;
                    subjectScores[subject].max += 10; // Assuming 10 per question max score
                });
            }
        });

        const subjectList = Object.entries(subjectScores).map(([subject, stats]) => ({
            subject,
            percentage: stats.max > 0 ? (stats.total / stats.max) * 100 : 0
        }));

        return { subjects: subjectList };
    }, [examHistory]);

    if (isUserLoading || isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) return null;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
            {/* Beautiful Page Header */}
            <PageHeader
                title="การเรียนรู้ของฉัน"
                description="ติดตามสถานะการเรียน สมรรถนะ และประวัติการทำข้อสอบของคุณ"
                icon={Award}
                theme="indigo"
                backLink="/education"
                backLabel="กลับหน้าหลัก"
                badge={`${examHistory.length} ผลสอบ`}
            />

            {/* Analytics Dashboard */}
            {/**/}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Card */}
                <Card className="bg-white border-slate-200 shadow-sm h-full rounded-2xl overflow-hidden">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="w-5 h-5 text-indigo-600" />
                            ข้อมูลส่วนตัว
                        </CardTitle>
                        <Link href="/profile">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                                <Settings className="w-4 h-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center text-center pt-4 pb-6">
                        <div className="w-24 h-24 rounded-full bg-slate-100 mb-4 overflow-hidden border-4 border-white shadow-md relative group cursor-pointer">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-3xl font-bold">
                                    {user?.displayName?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                        <h3 className="font-bold text-xl text-slate-900 mb-1">{user?.displayName || 'Lawlanes Student'}</h3>
                        <p className="text-slate-500 text-sm mb-6">{user?.email}</p>

                        <div className="w-full grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-indigo-600">{examHistory.length}</p>
                                <p className="text-xs text-slate-500">ชุดข้อสอบ</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-indigo-600">{ebooks.length}</p>
                                <p className="text-xs text-slate-500">คอร์ส/หนังสือ</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Card */}
                <Card className="bg-white border-slate-200 shadow-sm md:col-span-2 rounded-2xl overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingUp className="w-5 h-5 text-indigo-600" />
                            สมรรถนะรายวิชา (Performance)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {analytics.subjects.map((sub) => (
                            <div key={sub.subject} className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-slate-700">{sub.subject}</span>
                                    <span className={sub.percentage >= 70 ? "text-green-600" : sub.percentage >= 50 ? "text-amber-600" : "text-red-600"}>
                                        {sub.percentage.toFixed(0)}%
                                    </span>
                                </div>
                                <Progress value={sub.percentage} className="h-2 bg-slate-100" />
                            </div>
                        ))}
                        {analytics.subjects.length === 0 && (
                            <div className="text-center text-slate-500 py-4">ยังไม่มีข้อมูลเพียงพอ</div>
                        )}
                    </CardContent>
                </Card>
            </div>
            {/**/}

            <Tabs defaultValue="exams" className="w-full space-y-6">
                <div className="border-b border-slate-200">
                    <TabsList className="bg-transparent h-auto p-0 flex flex-wrap gap-2">
                        <TabsTrigger
                            value="exams"
                            className="rounded-t-lg border-b-2 border-transparent px-4 py-3 font-medium text-slate-500 hover:text-indigo-600 hover:bg-slate-50 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-indigo-50 shadow-none whitespace-nowrap transition-colors"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            คลังข้อสอบ
                        </TabsTrigger>
                        <TabsTrigger
                            value="orders"
                            className="rounded-t-lg border-b-2 border-transparent px-4 py-3 font-medium text-slate-500 hover:text-indigo-600 hover:bg-slate-50 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-indigo-50 shadow-none whitespace-nowrap transition-colors"
                        >
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            ประวัติการสั่งซื้อ
                        </TabsTrigger>
                        <TabsTrigger
                            value="ebooks"
                            className="rounded-t-lg border-b-2 border-transparent px-4 py-3 font-medium text-slate-500 hover:text-indigo-600 hover:bg-slate-50 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-indigo-50 shadow-none whitespace-nowrap transition-colors"
                        >
                            <BookOpen className="mr-2 h-4 w-4" />
                            หนังสือของฉัน
                        </TabsTrigger>
                        <TabsTrigger
                            value="courses"
                            className="rounded-t-lg border-b-2 border-transparent px-4 py-3 font-medium text-slate-500 hover:text-indigo-600 hover:bg-slate-50 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-indigo-50 shadow-none whitespace-nowrap transition-colors"
                        >
                            <PlayCircle className="mr-2 h-4 w-4" />
                            คอร์สเรียน
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="ebooks" className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ebooks.length > 0 ? (
                            ebooks.map((book) => (
                                <div key={book.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                    <div className="aspect-[3/4] relative bg-slate-100 overflow-hidden">
                                        {book.coverUrl ? (
                                            <img
                                                src={book.coverUrl}
                                                alt={book.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <BookOpen className="w-12 h-12" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3">
                                            <span className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                                                {book.type === 'COURSE' ? 'Coming Soon' : 'E-BOOK'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h4 className="font-bold text-slate-900 line-clamp-2 mb-2 min-h-[3rem]">
                                            {book.title}
                                        </h4>
                                        <div className="flex items-center justify-between mt-4">
                                            <span className="text-xs text-slate-500">
                                                ซื้อเมื่อ: {new Date(book.purchasedAt).toLocaleDateString('th-TH')}
                                            </span>
                                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-5">
                                                {book.type === 'COURSE' ? 'เข้าเรียน' : 'อ่านเลย'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <BookOpen className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">ยังไม่มีหนังสือหรือคอร์สเรียน</h3>
                                <p className="text-slate-500 mb-6">เลือกซื้อหนังสือ E-Book หรือคอร์สเรียนเพื่อเริ่มเรียนรู้ได้เลย</p>
                                <Link href="/books">
                                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                        เลือกซื้อหนังสือ
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="courses" className="space-y-4">
                    {/* Placeholder for Courses - In real app, fetch user's purchased courses */}
                    <Card className="border-dashed border-2 bg-slate-50/50">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                            <div className="bg-slate-100 p-4 rounded-full">
                                <PlayCircle className="h-8 w-8 text-slate-400" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-medium text-slate-900">ยังไม่มีคอร์สเรียน</h3>
                                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                                    คุณยังไม่ได้ลงทะเบียนเรียนคอร์สใดๆ เริ่มต้นเรียนรู้กฎหมายได้เลยวันนี้
                                </p>
                            </div>
                            <Button asChild variant="default" className="bg-indigo-600 hover:bg-indigo-700">
                                <Link href="/courses">
                                    ดูคอร์สเรียนทั้งหมด
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="exams" className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : examHistory.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {examHistory.map((exam) => (
                                <Card key={exam.id} className="hover:shadow-md transition-shadow overflow-hidden group">
                                    <div className="h-32 w-full relative bg-slate-200">
                                        <img
                                            src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600"
                                            alt="Exam Cover"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-2 right-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${exam.status === 'PASS' ? 'bg-emerald-500 text-white' : 'bg-white/90 text-slate-700'
                                                }`}>
                                                {exam.status === 'PASS' ? 'PASSED' : 'COMPLETED'}
                                            </span>
                                        </div>
                                    </div>
                                    <CardHeader className="pb-3 pt-4">
                                        <div className="flex justify-between items-start">
                                            <div className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold mb-2 inline-block">
                                                {(exam as any).examId || 'EXAM'}
                                            </div>
                                            <span className="text-xs text-slate-400">
                                                {(exam as any).createdAt?.seconds ? new Date((exam as any).createdAt.seconds * 1000).toLocaleDateString('th-TH') : 'เมื่อสักครู่'}
                                            </span>
                                        </div>
                                        <CardTitle className="text-base line-clamp-1">
                                            {(exam as any).questions?.[0]?.text ? `ฝึกทำข้อสอบ: ${(exam as any).questions[0].text.substring(0, 30)}...` : (exam.examTitle || 'แบบทดสอบกฎหมาย')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                                            <span>คะแนนที่ได้:</span>
                                            <span className="font-bold text-lg text-indigo-600">
                                                {(exam as any).result?.totalScore !== undefined ? (exam as any).result.totalScore : ((exam as any).score || 0)}
                                                /10
                                            </span>
                                        </div>
                                        <Button variant="outline" className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50" disabled>
                                            ดูผลการวิเคราะห์
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="border-dashed border-2 bg-slate-50/50">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                                <div className="bg-slate-100 p-4 rounded-full">
                                    <BookOpen className="h-8 w-8 text-slate-400" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-medium text-slate-900">ยังไม่มีรายการข้อสอบ</h3>
                                    <p className="text-sm text-slate-500 max-w-sm mx-auto">
                                        คุณยังไม่ได้เริ่มทำข้อสอบรายการใด เริ่มต้นฝึกฝนวันนี้เพื่อเตรียมความพร้อม
                                    </p>
                                </div>
                                <Button asChild variant="default" className="bg-indigo-600 hover:bg-indigo-700">
                                    <Link href="/exams">
                                        ดูคลังข้อสอบทั้งหมด
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="orders" className="space-y-4">
                    <Card className="border-dashed border-2 bg-slate-50/50">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                            <div className="bg-slate-100 p-4 rounded-full">
                                <Clock className="h-8 w-8 text-slate-400" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-medium text-slate-900">ไม่มีประวัติการสั่งซื้อ</h3>
                                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                                    คุณยังไม่มีประวัติการสั่งซื้อหนังสือหรือคอร์สเรียน
                                </p>
                            </div>
                            <Button asChild variant="outline">
                                <Link href="/books">
                                    ดูร้านหนังสือ
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* AI Recommendations Card (Moved to Bottom) */}
            <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-indigo-900">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        บทความแนะนำสำหรับคุณ
                    </CardTitle>
                    <CardDescription>
                        คัดสรรบทความกฎหมายที่น่าสนใจเพื่อเสริมทักษะของคุณ
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                        {articles.length > 0 ? (
                            articles.map((article, idx) => (
                                <Link href={`/education/articles/${article.slug}`} key={idx} className="flex gap-3 items-start bg-white p-4 rounded-xl border border-indigo-50 shadow-sm hover:shadow-md transition-shadow group cursor-pointer h-full">
                                    <div className="mt-1 bg-indigo-100 p-2 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-2 mb-1">{article.title}</h4>
                                        <p className="text-xs text-slate-500 line-clamp-2">{article.description || 'บทความน่ารู้จาก Lawslane'}</p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-8 text-center text-slate-500 text-sm">
                                <AlertCircle className="w-8 h-8 mb-2 text-slate-300" />
                                ยังไม่มีบทความแนะนำ
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
