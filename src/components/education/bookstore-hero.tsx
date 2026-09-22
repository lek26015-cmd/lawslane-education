import { BookOpen, Download, Truck } from 'lucide-react';

/**
 * หัวร้านหนังสือ — ทำตาม mockup Ui-Lawslane/lawslane_bookstore
 *
 * จงใจ "ไม่" ใส่ช่องค้นหาในแบนเนอร์ตาม mockup เพราะ AnimatedBookGrid ด้านล่าง
 * มีช่องค้นหา + ตัวกรอง + เรียงลำดับอยู่แล้ว การมีสองช่องจะสับสนว่าอันไหนทำงาน
 *
 * แถบด้านล่างเขียนเฉพาะสิ่งที่ระบบทำได้จริง — mockup มีหัวข้ออย่าง
 * "ทดลองอ่านบทแรกฟรี 100%" กับรีวิวผู้ใช้ ซึ่งยังไม่มีฟีเจอร์และไม่มีข้อมูลจริง
 * รองรับ จึงไม่ยกมา (ดูสรุปใน commit)
 */
export function BookstoreHero({ bookCount }: { bookCount: number }) {
    return (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B3979] via-[#124a94] to-[#1b62bd] text-white">
            <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"
            />
            <div className="relative px-6 py-10 sm:px-10 sm:py-14">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
                    <BookOpen className="h-3.5 w-3.5" />
                    Lawslane Wittaya Bookstore
                </span>

                <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
                    ร้านหนังสือเตรียมสอบกฎหมาย
                    <br className="hidden sm:block" />
                    ตำรา &amp; เลกเชอร์สรุปย่อ เนติบัณฑิต
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
                    รวมคู่มือเตรียมสอบวิชาว่าความ (ตั๋วทนาย) สรุปย่อเนติบัณฑิต 4 ขา
                    และข้อสอบเก่าพร้อมธงคำตอบจากผู้สอนตัวจริง
                    สั่งซื้อรูปเล่มจัดส่งถึงบ้าน หรือดาวน์โหลดอ่านเป็น E-Book ได้ทันที
                </p>

                <dl className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
                    <HeroFact
                        icon={<BookOpen className="h-4 w-4" />}
                        label="หนังสือในร้าน"
                        value={`${bookCount.toLocaleString()} เล่ม`}
                    />
                    <HeroFact
                        icon={<Download className="h-4 w-4" />}
                        label="E-Book"
                        value="ดาวน์โหลดหลังชำระเงิน"
                    />
                    <HeroFact
                        icon={<Truck className="h-4 w-4" />}
                        label="หนังสือรูปเล่ม"
                        value="จัดส่งพร้อมเลขพัสดุ"
                    />
                </dl>
            </div>
        </section>
    );
}

function HeroFact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                {icon}
            </span>
            <div className="min-w-0">
                <dt className="text-[11px] uppercase tracking-wide text-white/60">{label}</dt>
                <dd className="truncate text-sm font-semibold">{value}</dd>
            </div>
        </div>
    );
}
