/**
 * Unified Mock Data Store
 * 
 * This module provides an in-memory data store that simulates database behavior.
 * Both Admin Panel and Public Website use this same store, ensuring data consistency.
 * 
 * Note: Data resets when the server restarts.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface Article {
    id: string;
    slug: string;
    title: string;
    description: string;
    content: string;
    category: string;
    coverImage: string;
    author: string;
    publishedAt: string;
    createdAt: string;
    updatedAt: string;
    views: number;
    status: 'draft' | 'published';
}

export interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    originalPrice?: number;
    coverImage: string;
    instructor: string;
    duration: string;
    lessons: number;
    level: 'beginner' | 'intermediate' | 'advanced';
    category: string;
    status: 'draft' | 'published';
    createdAt: string;
    updatedAt: string;
}

export interface Book {
    id: string;
    title: string;
    description: string;
    price: number;
    originalPrice?: number;
    coverImage: string;
    author: string;
    pages: number;
    category: string;
    type: 'ebook' | 'physical' | 'both';
    status: 'draft' | 'published';
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// SEED DATA
// ============================================================================

const initialArticles: Article[] = [
    {
        id: 'article-1',
        slug: 'preparation-tips-lawyer-exam',
        title: 'เทคนิคการสอบทนายความ ภาคปฏิบัติ',
        description: 'รวมเทคนิคและวิธีการเตรียมตัวสอบใบอนุญาตทนายความภาคปฏิบัติ จากประสบการณ์จริง',
        content: '<h2>บทนำ</h2><p>การสอบใบอนุญาตทนายความภาคปฏิบัติเป็นด่านสำคัญที่ผู้ต้องการประกอบวิชาชีพทนายความต้องผ่าน...</p><h2>เทคนิคการเตรียมตัว</h2><p>1. ศึกษาข้อสอบเก่าอย่างน้อย 5 ปีย้อนหลัง</p><p>2. ฝึกเขียนคำฟ้อง คำให้การ อย่างสม่ำเสมอ</p>',
        category: 'เทคนิคการสอบ',
        coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600',
        author: 'Admin',
        publishedAt: '2025-01-10T10:00:00Z',
        createdAt: '2025-01-10T10:00:00Z',
        updatedAt: '2025-01-10T10:00:00Z',
        views: 1250,
        status: 'published'
    },
    {
        id: 'article-2',
        slug: 'civil-law-basics',
        title: 'หลักกฎหมายแพ่งเบื้องต้น',
        description: 'ทำความเข้าใจหลักกฎหมายแพ่งพื้นฐานที่จำเป็นสำหรับการสอบ',
        content: '<h2>กฎหมายแพ่งคืออะไร</h2><p>กฎหมายแพ่งเป็นกฎหมายที่กำหนดความสัมพันธ์ระหว่างบุคคลในทางแพ่ง...</p>',
        category: 'กฎหมายแพ่ง',
        coverImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=600',
        author: 'Admin',
        publishedAt: '2025-01-08T14:30:00Z',
        createdAt: '2025-01-08T14:30:00Z',
        updatedAt: '2025-01-08T14:30:00Z',
        views: 890,
        status: 'published'
    },
    {
        id: 'article-3',
        slug: 'criminal-procedure-guide',
        title: 'คู่มือวิธีพิจารณาความอาญา',
        description: 'สรุปสาระสำคัญของประมวลกฎหมายวิธีพิจารณาความอาญา',
        content: '<h2>ภาพรวม</h2><p>ประมวลกฎหมายวิธีพิจารณาความอาญาเป็นกฎหมายวิธีสบัญญัติ...</p>',
        category: 'กฎหมายอาญา',
        coverImage: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=600',
        author: 'Admin',
        publishedAt: '2025-01-05T09:00:00Z',
        createdAt: '2025-01-05T09:00:00Z',
        updatedAt: '2025-01-05T09:00:00Z',
        views: 675,
        status: 'published'
    }
];

const initialCourses: Course[] = [
    {
        id: 'course-1',
        title: 'คอร์สเตรียมสอบทนายความภาคทฤษฎี รุ่น 68',
        description: 'คอร์สเตรียมความพร้อมสอบใบอนุญาตว่าความภาคทฤษฎี ครอบคลุมทุกวิชาที่ออกสอบ พร้อมเทคนิคทำข้อสอบ',
        price: 2500,
        originalPrice: 3500,
        coverImage: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=600',
        instructor: 'อาจารย์สมชาย ใจดี',
        duration: '40 ชั่วโมง',
        lessons: 25,
        level: 'beginner',
        category: 'เตรียมสอบ',
        status: 'published',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
    },
    {
        id: 'course-2',
        title: 'คอร์สเตรียมสอบทนายความภาคปฏิบัติ รุ่น 68',
        description: 'ฝึกฝนการเขียนคำฟ้อง คำให้การ และเอกสารทางกฎหมายต่างๆ พร้อมแนวข้อสอบจริง',
        price: 3500,
        originalPrice: 4500,
        coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600',
        instructor: 'อาจารย์วิภา ยุติธรรม',
        duration: '60 ชั่วโมง',
        lessons: 35,
        level: 'intermediate',
        category: 'เตรียมสอบ',
        status: 'published',
        createdAt: '2025-01-02T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z'
    },
    {
        id: 'course-3',
        title: 'กฎหมายแพ่งและพาณิชย์ เจาะลึก',
        description: 'เรียนรู้หลักกฎหมายแพ่งและพาณิชย์อย่างละเอียด เหมาะสำหรับผู้ต้องการความเข้าใจเชิงลึก',
        price: 1990,
        coverImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=600',
        instructor: 'รศ.ดร.ประยุทธ์ กฎหมาย',
        duration: '30 ชั่วโมง',
        lessons: 20,
        level: 'advanced',
        category: 'กฎหมายแพ่ง',
        status: 'published',
        createdAt: '2025-01-03T00:00:00Z',
        updatedAt: '2025-01-03T00:00:00Z'
    }
];

const initialBooks: Book[] = [
    {
        id: 'book-1',
        title: 'คู่มือสอบทนายความ ฉบับสมบูรณ์ 2568',
        description: 'รวมสรุปเนื้อหาและแนวข้อสอบทนายความครบทุกวิชา อัปเดตล่าสุด',
        price: 590,
        originalPrice: 750,
        coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
        author: 'ทีมวิชาการ Lawslane',
        pages: 450,
        category: 'เตรียมสอบ',
        type: 'both',
        status: 'published',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
    },
    {
        id: 'book-2',
        title: 'รวมข้อสอบเก่าทนายความ 10 ปีย้อนหลัง',
        description: 'รวมข้อสอบจริงพร้อมธงคำตอบและคำอธิบายละเอียด',
        price: 450,
        coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600',
        author: 'ทีมวิชาการ Lawslane',
        pages: 380,
        category: 'ข้อสอบเก่า',
        type: 'ebook',
        status: 'published',
        createdAt: '2025-01-02T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z'
    },
    {
        id: 'book-3',
        title: 'สรุปย่อกฎหมายแพ่ง ฉบับพกพา',
        description: 'สรุปหลักกฎหมายแพ่งแบบกระชับ อ่านง่าย พกพาสะดวก',
        price: 290,
        coverImage: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&q=80&w=600',
        author: 'อ.สมศักดิ์ กฎหมายดี',
        pages: 180,
        category: 'กฎหมายแพ่ง',
        type: 'physical',
        status: 'published',
        createdAt: '2025-01-03T00:00:00Z',
        updatedAt: '2025-01-03T00:00:00Z'
    }
];

// ============================================================================
// IN-MEMORY STORE
// ============================================================================

let articles: Article[] = [...initialArticles];
let courses: Course[] = [...initialCourses];
let books: Book[] = [...initialBooks];

// ============================================================================
// ARTICLES CRUD
// ============================================================================

export function getArticles(): Article[] {
    return articles.filter(a => a.status === 'published');
}

export function getAllArticles(): Article[] {
    return articles;
}

export function getArticleBySlug(slug: string): Article | undefined {
    return articles.find(a => a.slug === slug);
}

export function getArticleById(id: string): Article | undefined {
    return articles.find(a => a.id === id);
}

export function createArticle(data: Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'views'>): Article {
    const now = new Date().toISOString();
    const newArticle: Article = {
        ...data,
        id: `article-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        views: 0
    };
    articles.unshift(newArticle);
    return newArticle;
}

export function updateArticle(id: string, data: Partial<Article>): Article | null {
    const index = articles.findIndex(a => a.id === id);
    if (index === -1) return null;

    articles[index] = {
        ...articles[index],
        ...data,
        updatedAt: new Date().toISOString()
    };
    return articles[index];
}

export function deleteArticle(id: string): boolean {
    const index = articles.findIndex(a => a.id === id);
    if (index === -1) return false;
    articles.splice(index, 1);
    return true;
}

// ============================================================================
// COURSES CRUD
// ============================================================================

export function getCourses(): Course[] {
    return courses.filter(c => c.status === 'published');
}

export function getAllCourses(): Course[] {
    return courses;
}

export function getCourseById(id: string): Course | undefined {
    return courses.find(c => c.id === id);
}

export function createCourse(data: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Course {
    const now = new Date().toISOString();
    const newCourse: Course = {
        ...data,
        id: `course-${Date.now()}`,
        createdAt: now,
        updatedAt: now
    };
    courses.unshift(newCourse);
    return newCourse;
}

export function updateCourse(id: string, data: Partial<Course>): Course | null {
    const index = courses.findIndex(c => c.id === id);
    if (index === -1) return null;

    courses[index] = {
        ...courses[index],
        ...data,
        updatedAt: new Date().toISOString()
    };
    return courses[index];
}

export function deleteCourse(id: string): boolean {
    const index = courses.findIndex(c => c.id === id);
    if (index === -1) return false;
    courses.splice(index, 1);
    return true;
}

// ============================================================================
// BOOKS CRUD
// ============================================================================

export function getBooks(): Book[] {
    return books.filter(b => b.status === 'published');
}

export function getAllBooks(): Book[] {
    return books;
}

export function getBookById(id: string): Book | undefined {
    return books.find(b => b.id === id);
}

export function createBook(data: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Book {
    const now = new Date().toISOString();
    const newBook: Book = {
        ...data,
        id: `book-${Date.now()}`,
        createdAt: now,
        updatedAt: now
    };
    books.unshift(newBook);
    return newBook;
}

export function updateBook(id: string, data: Partial<Book>): Book | null {
    const index = books.findIndex(b => b.id === id);
    if (index === -1) return null;

    books[index] = {
        ...books[index],
        ...data,
        updatedAt: new Date().toISOString()
    };
    return books[index];
}

export function deleteBook(id: string): boolean {
    const index = books.findIndex(b => b.id === id);
    if (index === -1) return false;
    books.splice(index, 1);
    return true;
}

// ============================================================================
// STATS (for Admin Dashboard)
// ============================================================================

export function getStats() {
    return {
        totalArticles: articles.length,
        publishedArticles: articles.filter(a => a.status === 'published').length,
        totalCourses: courses.length,
        publishedCourses: courses.filter(c => c.status === 'published').length,
        totalBooks: books.length,
        publishedBooks: books.filter(b => b.status === 'published').length,
        totalViews: articles.reduce((sum, a) => sum + a.views, 0)
    };
}
