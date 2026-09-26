import Link from 'next/link';
import { Calendar, ChevronRight, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

type ArticleCard = {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: string;
    coverImage: string;
    publishedAt: string;
};

/** บทความล่าสุดท้ายหน้าแรก — อ่านแบบเดียวกับหน้า /articles (บทความจากเว็บหลักบางตัวไม่มี status) */
async function getLatestArticles(count: number): Promise<ArticleCard[]> {
    try {
        const app = await initAdmin();
        if (!app) return [];
        const snap = await admin.firestore().collection('articles').limit(50).get();
        return snap.docs
            .map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    slug: data.slug || doc.id,
                    title: data.title || '',
                    description: data.description || data.excerpt || '',
                    category: data.category || data.tags?.[0] || 'ทั่วไป',
                    coverImage: data.coverImage || data.image || data.thumbnail || '',
                    publishedAt: data.publishedAt?.toDate?.()?.toISOString() || data.createdAt?.toDate?.()?.toISOString() || '',
                    status: data.status || 'published',
                };
            })
            .filter(a => a.title && a.status !== 'draft')
            .sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime())
            .slice(0, count);
    } catch (error) {
        console.error('Error fetching latest articles:', error);
        return [];
    }
}

export async function LatestArticlesSection() {
    const articles = await getLatestArticles(3);
    if (articles.length === 0) return null;

    return (
        <section className="space-y-6">
            <div className="flex justify-between items-center px-4 md:px-0">
                <div className="flex items-center gap-2">
                    <Newspaper className="w-6 h-6 text-[#0B3979]" />
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">บทความล่าสุด</h2>
                </div>
                <Link href="/articles">
                    <Button variant="link" className="text-slate-600 hover:text-primary text-sm font-medium">
                        ดูทั้งหมด <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map(article => (
                    <Link key={article.id} href={`/articles/${article.slug}`} className="group rounded-2xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <div className="aspect-[16/9] bg-slate-100 overflow-hidden">
                            {article.coverImage && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                            )}
                        </div>
                        <div className="p-5 flex flex-col gap-2 flex-1">
                            <span className="text-xs font-semibold text-[#0B3979]">{article.category}</span>
                            <h3 className="font-bold text-slate-900 line-clamp-2 group-hover:text-[#0B3979] transition-colors">{article.title}</h3>
                            {article.description && <p className="text-sm text-slate-600 line-clamp-2">{article.description}</p>}
                            {article.publishedAt && (
                                <span className="mt-auto pt-2 flex items-center gap-1 text-xs text-slate-500">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(article.publishedAt).toLocaleDateString('th-TH', { dateStyle: 'medium' })}
                                </span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
