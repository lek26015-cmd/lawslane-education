import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CourtForm, findUnverifiedStrings } from '@/lib/court-form';
import { CourtFormDocument } from '@/components/education/court-form-document';

/**
 * ตรวจแบบพิมพ์ศาลของธงคำตอบเทียบกับภาพต้นฉบับ — ใช้บนเครื่อง dev เท่านั้น
 * อ่านจาก out/court-forms (ดู scripts/court-form/cli.ts) ซึ่งไม่ขึ้น git และไม่มีบน production
 */
export const dynamic = 'force-dynamic';

interface SourceQuestion {
    setTitle: string; setStatus: string; qid: string; order: number; formType: string;
    modelAnswer: string; images: { page: number; url: string }[];
}

const DIR = path.join(process.cwd(), 'out/court-forms');

function shortTitle(q: SourceQuestion) {
    return `${q.setTitle.replace('ข้อสอบอัตนัย การฝึกอบรมวิชาว่าความ ', '')} ข้อ ${q.order}`;
}

export default async function CourtFormsPreview({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    if (process.env.NODE_ENV === 'production') notFound();
    const sourcePath = path.join(DIR, 'source.json');
    if (!existsSync(sourcePath)) {
        return <p className="p-8">ยังไม่มี out/court-forms/source.json — รัน <code>npm run court-form -- pull</code></p>;
    }
    const source: SourceQuestion[] = JSON.parse(readFileSync(sourcePath, 'utf8'));
    const { q: qid } = await searchParams;
    const q = source.find(s => s.qid === qid);

    const load = (id: string) => {
        const f = path.join(DIR, 'forms', `${id}.json`);
        if (!existsSync(f)) return { form: undefined, error: undefined };
        const r = CourtForm.safeParse(JSON.parse(readFileSync(f, 'utf8')));
        return r.success ? { form: r.data, error: undefined } : { form: undefined, error: r.error.message };
    };

    if (!q) {
        return (
            <div className="mx-auto max-w-3xl p-6">
                <h1 className="mb-4 text-xl font-bold">แบบพิมพ์ศาลในธงคำตอบ ({source.length} ข้อ)</h1>
                <ul className="space-y-1 text-sm">
                    {source.map(s => {
                        const { form, error } = load(s.qid);
                        const missing = form ? findUnverifiedStrings(form, s.modelAnswer).length : 0;
                        const mark = error ? '✗ schema' : !form ? '—' : missing ? `⚠ ${missing}` : '✓';
                        return (
                            <li key={s.qid}>
                                <span className="inline-block w-16">{mark}</span>
                                <Link className="text-blue-700 underline" href={`?q=${s.qid}`}>{shortTitle(s)}</Link>
                                <span className="text-slate-500"> · {s.formType}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }

    const { form, error } = load(q.qid);
    const missing = form ? findUnverifiedStrings(form, q.modelAnswer) : [];
    const idx = source.indexOf(q);
    return (
        <div className="p-4">
            <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
                <Link href="?" className="underline">ทั้งหมด</Link>
                {idx > 0 && <Link href={`?q=${source[idx - 1].qid}`} className="underline">← ก่อนหน้า</Link>}
                {idx < source.length - 1 && <Link href={`?q=${source[idx + 1].qid}`} className="underline">ถัดไป →</Link>}
                <b>{shortTitle(q)}</b> <span>{q.formType}</span> <code>{q.qid}</code>
            </div>
            {error && <pre className="mb-3 whitespace-pre-wrap bg-red-50 p-2 text-xs text-red-700">{error}</pre>}
            {missing.length > 0 && (
                <ul className="mb-3 bg-amber-50 p-2 text-xs text-amber-800">
                    {missing.map((m, i) => <li key={i}>ไม่พบในธงคำตอบ: {m}</li>)}
                </ul>
            )}
            <div className="grid gap-4 lg:grid-cols-2">
                <div className="min-w-0">{form ? <CourtFormDocument form={form} /> : <p>ยังไม่มีไฟล์ forms/{q.qid}.json</p>}</div>
                <div className="space-y-4">
                    {q.images.map(img => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={img.page} src={img.url} alt={`หน้า ${img.page}`} className="w-full border" />
                    ))}
                </div>
            </div>
        </div>
    );
}
