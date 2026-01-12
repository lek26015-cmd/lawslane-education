'use client'

import { getArticleBySlug, getAllArticles } from '@/lib/data';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import { useEffect, useState } from 'react';
import { Article } from '@/lib/types';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export default function EducationArticlePage() {
    const params = useParams();
    const { slug } = params;
    const { firestore } = useFirebase();
    const [article, setArticle] = useState<Article | null>(null);
    const [otherArticles, setOtherArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchArticleData() {
            if (!firestore || !slug) return;
            setIsLoading(true);

            const currentArticle = await getArticleBySlug(firestore, slug as string);
            if (!currentArticle) {
                notFound();
                return;
            }
            setArticle(currentArticle);

            const allArticles = await getAllArticles(firestore);
            const other = allArticles.filter(a => a.slug !== slug).slice(0, 3);
            setOtherArticles(other);

            setIsLoading(false);
        }
        fetchArticleData();
    }, [firestore, slug]);

    if (isLoading || !article) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <Link href="/articles" className="text-sm text-slate-600 hover:text-primary inline-flex items-center gap-2 w-fit">
                <ArrowLeft className="w-4 h-4" /> กลับไปหน้าบทความ
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Article Content */}
                <article className="lg:col-span-2">
                    <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-6 shadow-lg">
                        <Image
                            src={article.imageUrl}
                            alt={article.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    <header className="mb-8">
                        <Badge variant="secondary" className="mb-4">{article.category}</Badge>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
                            {article.title}
                        </h1>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback>L</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-slate-900">{article.authorName || 'ทีมงาน Lawslane'}</p>
                                <p>เผยแพร่: {article.publishedAt ? format(new Date(article.publishedAt), 'd MMMM yyyy', { locale: th }) : 'N/A'}</p>
                            </div>
                        </div>
                    </header>

                    <div className="prose prose-lg max-w-none text-slate-700">
                        <p className="lead text-lg font-medium text-slate-600">{article.description}</p>
                        {article.content.split('\n\n').map((paragraph, index) => {
                            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                                return <h2 key={index} className="text-2xl font-semibold mt-8 mb-4 text-slate-900">{paragraph.replaceAll('**', '')}</h2>
                            }
                            return <p key={index} className="mb-4">{paragraph}</p>
                        })}
                    </div>

                    {/* CTA Button */}
                    {article.cta?.enabled && article.cta.text && article.cta.url && (
                        <div className="mt-8 p-6 bg-slate-50 rounded-xl border">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-lg font-semibold text-slate-900">ต้องการความช่วยเหลือทางกฎหมาย?</p>
                                <Link href={article.cta.url}>
                                    <Button size="lg" className="font-semibold px-8">
                                        {article.cta.text}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </article>

                {/* Other Articles Sidebar */}
                <aside className="lg:col-span-1 space-y-6">
                    <h2 className="text-xl font-bold text-slate-900">บทความอื่นๆ</h2>
                    <div className="space-y-4">
                        {otherArticles.map((other) => (
                            <Link key={other.id} href={`/education/articles/${other.slug}`} className="block group">
                                <Card className="overflow-hidden transition-shadow hover:shadow-md">
                                    <div className="flex items-center gap-4 p-3">
                                        <div className="relative w-24 h-24 flex-shrink-0">
                                            <Image
                                                src={other.imageUrl}
                                                alt={other.title}
                                                fill
                                                className="object-cover rounded-md"
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                {other.title}
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-2">
                                                {other.publishedAt ? format(new Date(other.publishedAt), 'd MMM yy', { locale: th }) : ''}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    );
}
