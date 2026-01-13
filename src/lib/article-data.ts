export interface EducationArticle {
    id: string;
    title: string;
    slug: string;
    description: string;
    content: string; // HTML or Markdown
    coverUrl: string;
    category: 'Exam Tips' | 'Legal Knowledge' | 'News' | 'Case Studies';
    author: {
        name: string;
        avatarUrl?: string;
    };
    publishedAt: string; // ISO date string
    relatedCourseIds?: string[];
}

export const MOCK_EDUCATION_ARTICLES: EducationArticle[] = [
    {
        id: 'art-1',
        title: '5 เทคนิคพิชิตข้อสอบเนติบัณฑิต ภายในปีเดียว',
        slug: '5-techniques-bar-exam-1-year',
        description: 'เปิดเผยเคล็ดลับการเตรียมตัวสอบเนติบัณฑิตให้ผ่านครบทั้ง 4 ขา ภายในปีเดียว จากประสบการณ์จริงของผู้ที่ทำสำเร็จ',
        content: `
            <h2>1. วางแผนการอ่านหนังสือให้ชัดเจน</h2>
            <p>การสอบเนติบัณฑิตมีเนื้อหาที่กว้างมาก การวางแผนจึงเป็นหัวใจสำคัญ...</p>
            <h2>2. ฝึกเขียนตอบข้อสอบเก่าอย่างสม่ำเสมอ</h2>
            <p>ความรู้กฎหมายอย่างเดียวไม่เพียงพอ ทักษะการเขียนตอบ (Legal Writing) คือกุญแจสำคัญ...</p>
            <h2>3. พักผ่อนให้เพียงพอ</h2>
            <p>สมองต้องการการพักผ่อนเพื่อจัดระเบียบข้อมูล...</p>
        `,
        coverUrl: 'https://images.unsplash.com/photo-1456324504439-367cee110fa2?auto=format&fit=crop&q=80&w=1000',
        category: 'Exam Tips',
        author: {
            name: 'พาร์ทเนอร์ ก้อง',
            avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100'
        },
        publishedAt: '2025-12-15T09:00:00Z',
        relatedCourseIds: ['course-2']
    },
    {
        id: 'art-2',
        title: 'สรุปแชร์ลูกโซ่ vs ขายตรง สังเกตอย่างไรไม่ให้ตกเป็นเหยื่อ',
        slug: 'ponzi-scheme-vs-direct-sales',
        description: 'เจาะลึกข้อกฎหมายและความแตกต่างทางพฤติการณ์ระหว่างธุรกิจขายตรงที่ถูกต้องตามกฎหมายและแชร์ลูกโซ่ที่ผิดกฎหมาย',
        content: `
            <p>ในปัจจุบันมีการหลอกลวงในรูปแบบแชร์ลูกโซ่ระบาดอย่างหนัก...</p>
            <h2>องค์ประกอบความผิดฐานฉ้อโกงประชาชน</h2>
            <p>ตามประมวลกฎหมายอาญา มาตรา 343...</p>
        `,
        coverUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000',
        category: 'Legal Knowledge',
        author: {
            name: 'ทีมกฎหมาย Lawlanes',
        },
        publishedAt: '2026-01-05T14:30:00Z',
        relatedCourseIds: []
    },
    {
        id: 'art-3',
        title: 'เจาะลึกคำพิพากษาฎีกาใหม่ ปี 2568 ที่น่าสนใจ',
        slug: 'supreme-court-judgments-2025',
        description: 'รวมคำพิพากษาศาลฎีกาปี 2568 ที่วางแนวบรรทัดฐานใหม่และนักกฎหมายควรทราบ',
        content: `
            <p>ในปีที่ผ่านมา มีคำพิพากษาฎีกาหลายฉบับที่เปลี่ยนแปลงแนวคำวินิจฉัยเดิม...</p>
        `,
        coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=1000',
        category: 'Case Studies',
        author: {
            name: 'อาจารย์ สมชาย',
        },
        publishedAt: '2026-01-10T08:00:00Z',
        relatedCourseIds: ['course-1']
    }
];

export async function getAllEducationArticles(): Promise<EducationArticle[]> {
    return MOCK_EDUCATION_ARTICLES;
}

export async function getEducationArticleBySlug(slug: string): Promise<EducationArticle | undefined> {
    return MOCK_EDUCATION_ARTICLES.find(a => a.slug === slug);
}
