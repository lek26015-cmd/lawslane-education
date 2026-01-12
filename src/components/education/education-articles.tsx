'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Newspaper } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { getAllArticles } from '@/lib/data';
import { Article } from '@/lib/types';

export function EducationArticles() {
    const { firestore } = useFirebase();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchArticles() {
            if (!firestore) return;
            try {
                const fetchedArticles = await getAllArticles(firestore);
                // Filter for law-related articles and take first 3
                setArticles(fetchedArticles.slice(0, 3));
            } catch (error) {
                console.error("Error fetching articles:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchArticles();
    }, [firestore]);

    if (loading) {
        return (
            <section className="py-8">
                <div className="flex items-center gap-2 mb-6">
                    <Newspaper className="w-6 h-6 text-slate-600" />
                    <h2 className="text-2xl font-bold text-slate-900">บทความน่าอ่าน</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-slate-100 rounded-2xl h-72 animate-pulse" />
                    ))}
                </div>
            </section>
        );
    }

    if (articles.length === 0) {
        return null;
    }

    return (
        <section className="py-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Newspaper className="w-6 h-6 text-slate-600" />
                    <h2 className="text-2xl font-bold text-slate-900">บทความน่าอ่าน</h2>
                </div>
                <Link href="/articles">
                    <Button variant="link" className="text-slate-600 hover:text-primary">
                        ดูทั้งหมด <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {articles.map((article) => (
                    <Link
                        key={article.id}
                        href={`/articles/${article.slug}`}
                        className="group block"
                    >
                        <Card className="border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white rounded-2xl overflow-hidden h-full">
                            <CardContent className="p-0">
                                <div className="relative aspect-[16/10] overflow-hidden">
                                    <Image
                                        src={article.imageUrl}
                                        alt={article.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute top-3 left-3">
                                        <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-xs font-medium">
                                            {article.category}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-2">
                                        {article.title}
                                    </h3>
                                    <p className="text-slate-600 text-sm line-clamp-2">
                                        {article.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </section>
    );
}
