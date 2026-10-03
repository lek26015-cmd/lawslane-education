'use client';

import * as React from 'react';
import Image, { StaticImageData } from 'next/image';
import { BrandCover, ExamBookCover } from '@/components/education/brand-cover';
import { displayBookTitle, isTemplateExamCover } from '@/lib/book-cover';
import { isPlaceholderCover } from '@/lib/cover';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Star, ThumbsUp, Zap } from 'lucide-react';

interface BookCardProps {
    id: string | number;
    title: string;
    coverUrl: string | StaticImageData;
    price: number;
    originalPrice?: number;
    description?: string;
    author?: string;
    level?: string;
    rating?: number; // 0-5
    badges?: Array<{ text: string; color: string; icon?: 'thumbs-up' | 'zap' }>;
    isEbook?: boolean;
    /** จำนวนหน้า — mockup ร้านหนังสือแสดงไว้ข้างราคาเพื่อให้เทียบความคุ้มค่าได้ */
    pageCount?: number;
    href?: string;
    /** ปุ่มเพิ่มใต้ราคา เช่น ปุ่มดาวน์โหลดอีบุ๊กของผู้ที่ซื้อแล้ว */
    footerExtra?: React.ReactNode;
}

export function BookCard({
    id,
    title,
    coverUrl,
    price,
    originalPrice,
    rating = 5.0,
    description,
    author,
    level,
    badges = [],
    isEbook = false,
    pageCount,
    href = '#',
    footerExtra,
}: BookCardProps) {
    const examCover = isTemplateExamCover(coverUrl);
    // ส่วนลดคำนวณจากราคาจริง ไม่ใช่ค่าที่กรอกมือ — กันกรณี originalPrice ต่ำกว่า price
    const discountPercent =
        originalPrice && originalPrice > price
            ? Math.round(((originalPrice - price) / originalPrice) * 100)
            : 0;

    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow bg-white border-slate-200 overflow-hidden group">
            {/* Image Section */}
            <Link href={href}>
                <div className="relative aspect-[2/3] w-full bg-slate-100 overflow-hidden">
                    {examCover ? (
                        <ExamBookCover title={title} description={description} isEbook={isEbook} />
                    ) : coverUrl && !(typeof coverUrl === 'string' && isPlaceholderCover(coverUrl)) ? (
                        <Image
                            src={coverUrl}
                            alt={title}
                            fill
                            // เดิมไม่มี sizes = 100vw → เบราว์เซอร์ขอภาพกว้าง 2048–3840px ต่อการ์ด (ปกจริงกว้าง 400px)
                            // ภาพจึงขึ้นช้าจนการ์ดเป็นกล่องเทาว่าง
                            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <BrandCover title={title} label={isEbook ? 'E-Book' : 'Book'} />
                    )}
                    {isEbook && !examCover && (
                        <Badge className="absolute top-2 right-2 bg-[#0B3979] hover:bg-[#082a5a]">E-Book</Badge>
                    )}
                    {discountPercent > 0 && (
                        <Badge className="absolute top-2 left-2 bg-rose-600 hover:bg-rose-600">
                            -{discountPercent}%
                        </Badge>
                    )}
                </div>
            </Link>

            {/* Content Section */}
            <CardContent className="flex-1 p-4 flex flex-col items-start text-left">
                {/* Badges */}
                {badges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {badges.map((badge, idx) => (
                            <Badge key={idx} variant="secondary" className={`text-[10px] h-5 ${badge.color.replace('text-', 'text-').replace('text-', 'bg-').replace('600', '100').replace('500', '100')} ${badge.color}`}>
                                {badge.icon === 'thumbs-up' && <ThumbsUp className="w-3 h-3 mr-1" />}
                                {badge.icon === 'zap' && <Zap className="w-3 h-3 mr-1" />}
                                {badge.text}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Title */}
                <Link href={href} className="w-full">
                    <h3 className="font-bold text-lg leading-snug mb-2 min-h-[3.5rem] text-slate-900 group-hover:text-[#0B3979] transition-colors">
                        {displayBookTitle(title)}
                    </h3>
                </Link>

                {/* Description */}
                {description && (
                    <p className="text-sm text-slate-500 mb-2 line-clamp-2">
                        {displayBookTitle(description)}
                    </p>
                )}

                {/* Level */}
                {level && (
                    <Badge variant="outline" className="mb-3 text-xs font-normal text-slate-500 border-slate-300">
                        {level}
                    </Badge>
                )}

                {/* Author */}
                {author && (
                    <div className="text-sm text-slate-500 flex items-center gap-1 mt-auto pt-2">
                        <span className="font-medium">ผู้แต่ง:</span> {author}
                    </div>
                )}
            </CardContent>

            {/* Footer: Price & Action */}
            <CardFooter className="p-4 pt-0 mt-auto border-t border-slate-50/50 flex flex-col gap-2">
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col items-start pt-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-[#082a5a]">฿{price.toLocaleString()}</span>
                        {discountPercent > 0 && originalPrice && (
                            <span className="text-xs text-slate-400 line-through">฿{originalPrice.toLocaleString()}</span>
                        )}
                    </div>
                    {pageCount ? (
                        <span className="text-[11px] text-slate-400">{pageCount.toLocaleString()} หน้า</span>
                    ) : null}
                </div>
                <Link href={href} className="pt-4">
                    <Button
                        variant="outline" size="sm" className="border-blue-200 text-[#082a5a] hover:bg-blue-50"
                    >
                        ดูรายละเอียด
                    </Button>
                </Link>
              </div>
              {footerExtra}
            </CardFooter>
        </Card>
    );
}
