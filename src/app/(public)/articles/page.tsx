import { PageHeader } from '@/components/education/page-header';
import Link from 'next/link';
import { Calendar, ChevronRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getArticles } from '@/lib/mock-store';

export default async function ArticlesPage() {
    // Use mock store directly for Server Component
    const articles = getArticles();

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
            <PageHeader
                title="คลังความรู้กฎหมาย"
                description="บทความ เทคนิคการสอบ และเกร็ดความรู้กฎหมายที่น่าสนใจ"
                icon="BookOpen"
                theme="purple"
                backLink="/"
                backLabel="กลับหน้าหลัก"
            />

            {/* Featured Section (First Article) */}
            {articles.length > 0 && (
                <div className="relative rounded-3xl overflow-hidden bg-slate-900 aspect-[21/9] md:aspect-[3/1] group shadow-xl">
                    <img
                        src={articles[0].coverImage}
                        alt={articles[0].title}
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent p-6 md:p-12 flex flex-col justify-end items-start text-white">
                        <Badge className="bg-purple-500 hover:bg-purple-600 border-none mb-4">
                            {articles[0].category}
                        </Badge>
                        <h2 className="text-2xl md:text-4xl font-bold mb-4 max-w-2xl leading-tight">
                            {articles[0].title}
                        </h2>
                        <p className="text-slate-200 line-clamp-2 max-w-xl mb-6 text-sm md:text-base opacity-90">
                            {articles[0].description}
                        </p>
                        <Link href={`/articles/${articles[0].slug}`}>
                            <Button size="lg" className="rounded-full bg-white text-slate-900 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                                อ่านบทความ <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </div>
                </div>
            )}

            {/* Recent Articles Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.slice(1).map((article) => (
                    <Link href={`/articles/${article.slug}`} key={article.id} className="group">
                        <Card className="h-full border-none shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white">
                            <div className="aspect-[16/10] overflow-hidden relative">
                                <img
                                    src={article.coverImage}
                                    alt={article.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-3 right-3">
                                    <Badge variant="secondary" className="backdrop-blur-md bg-white/90 text-slate-800 shadow-sm border-0">
                                        {article.category}
                                    </Badge>
                                </div>
                            </div>
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(article.publishedAt).toLocaleDateString('th-TH')}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {article.author}
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                                    {article.title}
                                </h3>
                                <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                                    {article.description}
                                </p>
                                <span className="text-purple-600 text-sm font-semibold flex items-center group-hover:underline">
                                    อ่านต่อ <ChevronRight className="w-4 h-4" />
                                </span>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {articles.length <= 1 && (
                <div className="text-center py-12 text-slate-400">
                    ไม่มีบทความเพิ่มเติม
                </div>
            )}
        </div>
    );
}
