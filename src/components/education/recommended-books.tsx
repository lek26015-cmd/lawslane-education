import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { getAllBooks } from '@/lib/education-data-admin';
import { BookCard } from './book-card';


export async function RecommendedBooksSection() {
    const allBooks = await getAllBooks();
    const books = allBooks.slice(0, 8); // Show first 8 books

    return (
        <section className="py-12 bg-slate-50 border-y border-slate-200">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div className="max-w-2xl">
                        <span className="text-pink-500 font-bold text-sm tracking-wider uppercase mb-2 block">ร้านหนังสือออนไลน์</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                            หนังสือเรียนแนะนำ
                        </h2>
                        <p className="text-slate-600 text-lg mt-4 leading-relaxed">
                            LAWSLANE ผู้นำด้านนวัตกรรมการศึกษากฎหมายรูปแบบใหม่ คัดสรรหนังสือคุณภาพเพื่อนักศึกษาและผู้เตรียมสอบ
                        </p>
                    </div>
                    <Link href="/books" className="shrink-0">
                        <Button className="bg-amber-400 hover:bg-amber-300 text-purple-900 rounded-full px-8 py-3 text-lg font-bold shadow-lg shadow-amber-900/10 hover:shadow-xl transition-all group">
                            ดูหนังสือทั้งหมด
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>

                <div className="w-full">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 gap-y-12">
                        {books.map((book, idx) => (
                            <div key={book.id} className="relative group">
                                <BookCard
                                    id={book.id}
                                    title={book.title}
                                    coverUrl={book.coverUrl}
                                    price={book.price}
                                    originalPrice={Math.round(book.price * 1.2)}
                                    rating={4.5 + (idx % 5) / 10}
                                    badges={[
                                        idx === 0 ? { text: "แนะนำ NEW!!", color: "text-green-600", icon: "thumbs-up" } :
                                            idx === 1 ? { text: "ขายดี!!", color: "text-yellow-500", icon: "zap" } :
                                                idx === 2 ? { text: "ขายดี!!", color: "text-yellow-500", icon: "zap" } :
                                                    { text: "ยอดนิยม", color: "text-blue-500" }
                                    ]}
                                    isEbook={book.isDigital}
                                    href={`/education/books/${book.id}`}
                                    author={book.author}
                                    description={book.description}
                                    level={book.level}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
