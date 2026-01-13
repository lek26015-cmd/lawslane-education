import { getArticleBySlug, getArticles } from '@/lib/mock-store';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Calendar, Facebook, Twitter, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export async function generateStaticParams() {
    const articles = getArticles();
    return articles.map((article) => ({
        slug: article.slug,
    }));
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const article = getArticleBySlug(slug);

    if (!article) {
        notFound();
    }

    return (
        <article className="min-h-screen bg-slate-50 pb-20">
            {/* Nav / Header */}
            <div className="bg-white border-b sticky top-16 z-40 transition-all duration-200">
                <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-4xl">
                    <Link href="/articles" className="text-slate-500 hover:text-slate-900 flex items-center gap-2 text-sm font-medium transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                        บทความทั้งหมด
                    </Link>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600">
                            <Facebook className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-sky-500">
                            <Twitter className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-700">
                            <LinkIcon className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Hero Image */}
            <div className="w-full h-[40vh] md:h-[50vh] relative bg-slate-900">
                <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8 md:pb-12 max-w-4xl">
                    <Badge className="bg-purple-500 mb-4 hover:bg-purple-600 border-none">
                        {article.category}
                    </Badge>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 drop-shadow-sm">
                        {article.title}
                    </h1>
                    <div className="flex items-center gap-6 text-slate-300 text-sm md:text-base">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden border border-slate-500 flex items-center justify-center text-xs font-bold text-slate-400">
                                {article.author.charAt(0)}
                            </div>
                            <span>{article.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 opacity-70" />
                            {new Date(article.publishedAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 max-w-3xl -mt-8 relative z-10">
                <div className="bg-white rounded-t-3xl p-6 md:p-12 shadow-sm min-h-[500px]">
                    {/* Description (Lead) */}
                    <div className="text-xl md:text-2xl text-slate-800 font-medium leading-relaxed mb-10 border-l-4 border-purple-500 pl-6 italic">
                        {article.description}
                    </div>

                    <div
                        className="prose prose-lg prose-slate max-w-none 
                        prose-headings:font-bold prose-headings:text-slate-900 
                        prose-p:text-slate-600 prose-p:leading-8
                        prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline
                        prose-img:rounded-xl prose-img:shadow-md"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                </div>
            </div>

        </article>
    );
}
