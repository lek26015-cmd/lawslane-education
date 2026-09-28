/**
 * ปกที่เป็นภาพตัวอย่าง ไม่ใช่ปกจริง — placehold.co (ข้อความบนพื้นเทา) และภาพสต็อก unsplash
 * ที่ติดมากับข้อมูลตัวอย่างตอนเริ่มระบบ แสดงแล้วดูเหมือนม็อคอัพ ให้ใช้ปกแบรนด์ Lawslane แทน
 */
export function isPlaceholderCover(url: unknown): boolean {
    if (typeof url !== 'string' || !url.trim()) return true;
    return /(^|\/\/)(placehold\.co|via\.placeholder\.com|images\.unsplash\.com)\//i.test(url);
}
