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

export interface Exam {
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
    passingScore: number;
    totalQuestions: number;
    category: 'license' | 'prosecutor' | 'judge' | 'university' | 'other';
    difficulty: 'easy' | 'medium' | 'hard';
    coverImage: string;
    status: 'draft' | 'published';
    createdAt: string;
    updatedAt: string;
}

export interface Question {
    id: string;
    examId: string;
    text: string;
    type: 'MULTIPLE_CHOICE' | 'ESSAY';
    options?: string[];
    correctOptionIndex?: number;
    correctAnswerText?: string;
    explanation?: string;
    order: number;
    subject?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AnswerResult {
    questionId: string;
    questionText: string;
    questionType: 'MULTIPLE_CHOICE' | 'ESSAY';
    studentAnswer: string | number;
    correctAnswer?: string | number;
    isCorrect?: boolean;
    aiScore?: number;
    aiFeedback?: string;
    aiStrengths?: string[];
    aiWeaknesses?: string[];
    aiSuggestions?: string[];
}

export interface ExamAttempt {
    id: string;
    examId: string;
    examTitle: string;
    userId?: string;
    userName?: string;
    startedAt: string;
    completedAt?: string;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'TIMEOUT';
    totalScore: number;
    maxScore: number;
    passingScore: number;
    passed: boolean;
    answers: AnswerResult[];
    createdAt: string;
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

const initialExams: Exam[] = [
    {
        id: 'exam-1',
        title: 'แบบทดสอบกฎหมายแพ่ง ชุดที่ 1',
        description: 'ข้อสอบปรนัยกฎหมายแพ่งและพาณิชย์ เน้นเรื่องนิติกรรมสัญญา',
        durationMinutes: 60,
        passingScore: 60,
        totalQuestions: 20,
        category: 'license',
        difficulty: 'medium',
        coverImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=600',
        status: 'published',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
    },
    {
        id: 'exam-2',
        title: 'แบบทดสอบกฎหมายอาญา ชุดที่ 1',
        description: 'ข้อสอบปรนัยกฎหมายอาญา เน้นภาคทั่วไปและความผิดต่อชีวิต',
        durationMinutes: 90,
        passingScore: 70,
        totalQuestions: 30,
        category: 'license',
        difficulty: 'hard',
        coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600',
        status: 'published',
        createdAt: '2025-01-02T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z'
    },
    {
        id: 'exam-3',
        title: 'แบบทดสอบอัตนัย - ธงคำตอบกฎหมายแพ่ง',
        description: 'ข้อสอบอัตนัยพร้อมธงคำตอบ ฝึกเขียนตอบแบบมืออาชีพ',
        durationMinutes: 120,
        passingScore: 50,
        totalQuestions: 5,
        category: 'prosecutor',
        difficulty: 'hard',
        coverImage: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=600',
        status: 'published',
        createdAt: '2025-01-03T00:00:00Z',
        updatedAt: '2025-01-03T00:00:00Z'
    }
];

const initialQuestions: Question[] = [
    // Exam 1 Questions (Multiple Choice)
    {
        id: 'q-1-1',
        examId: 'exam-1',
        text: 'นิติกรรมที่ทำโดยผู้เยาว์โดยไม่ได้รับความยินยอมจากผู้แทนโดยชอบธรรม มีผลเป็นอย่างไร?',
        type: 'MULTIPLE_CHOICE',
        options: ['โมฆะ', 'โมฆียะ', 'สมบูรณ์', 'ใช้บังคับได้เฉพาะบางส่วน'],
        correctOptionIndex: 1,
        explanation: 'ตาม ป.พ.พ. มาตรา 21 นิติกรรมที่ผู้เยาว์ทำโดยไม่ได้รับความยินยอมเป็นโมฆียะ',
        order: 1,
        subject: 'กฎหมายแพ่ง',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
    },
    {
        id: 'q-1-2',
        examId: 'exam-1',
        text: 'สัญญาใดต่อไปนี้ต้องทำเป็นหนังสือและจดทะเบียนต่อพนักงานเจ้าหน้าที่?',
        type: 'MULTIPLE_CHOICE',
        options: ['สัญญาเช่าซื้อ', 'สัญญาซื้อขายที่ดิน', 'สัญญากู้ยืมเงิน', 'สัญญาจ้างแรงงาน'],
        correctOptionIndex: 1,
        explanation: 'สัญญาซื้อขายอสังหาริมทรัพย์ต้องทำเป็นหนังสือและจดทะเบียนต่อพนักงานเจ้าหน้าที่ ตาม ป.พ.พ. มาตรา 456',
        order: 2,
        subject: 'กฎหมายแพ่ง',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
    },
    {
        id: 'q-1-3',
        examId: 'exam-1',
        text: 'อายุความทั่วไปตามประมวลกฎหมายแพ่งและพาณิชย์คือกี่ปี?',
        type: 'MULTIPLE_CHOICE',
        options: ['5 ปี', '10 ปี', '15 ปี', '20 ปี'],
        correctOptionIndex: 1,
        explanation: 'ตาม ป.พ.พ. มาตรา 193/30 อายุความทั่วไปคือ 10 ปี',
        order: 3,
        subject: 'กฎหมายแพ่ง',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
    },
    // Exam 2 Questions (Multiple Choice)
    {
        id: 'q-2-1',
        examId: 'exam-2',
        text: 'การกระทำโดยป้องกันตามกฎหมายอาญา ต้องเป็นการกระทำเพื่อป้องกันสิทธิของใคร?',
        type: 'MULTIPLE_CHOICE',
        options: ['ตนเองเท่านั้น', 'ตนเองหรือผู้อื่น', 'ผู้อื่นเท่านั้น', 'รัฐเท่านั้น'],
        correctOptionIndex: 1,
        explanation: 'ตาม ป.อาญา มาตรา 68 การป้องกันโดยชอบด้วยกฎหมายป้องกันได้ทั้งสิทธิของตนเองและผู้อื่น',
        order: 1,
        subject: 'กฎหมายอาญา',
        createdAt: '2025-01-02T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z'
    },
    {
        id: 'q-2-2',
        examId: 'exam-2',
        text: 'ความผิดฐานฆ่าคนตายโดยเจตนา มีโทษอย่างไร?',
        type: 'MULTIPLE_CHOICE',
        options: ['จำคุก 1-10 ปี', 'จำคุก 10-20 ปี', 'จำคุก 15-20 ปี หรือจำคุกตลอดชีวิต หรือประหารชีวิต', 'จำคุกตลอดชีวิตเท่านั้น'],
        correctOptionIndex: 2,
        explanation: 'ตาม ป.อาญา มาตรา 288 ผู้ใดฆ่าคนตาย ต้องระวางโทษประหารชีวิต จำคุกตลอดชีวิต หรือจำคุก 15-20 ปี',
        order: 2,
        subject: 'กฎหมายอาญา',
        createdAt: '2025-01-02T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z'
    },
    // Exam 3 Questions (Essay)
    {
        id: 'q-3-1',
        examId: 'exam-3',
        text: 'นาย ก. ตกลงขายที่ดินให้นาย ข. โดยทำสัญญาเป็นหนังสือแต่ไม่ได้จดทะเบียน ต่อมานาย ก. เปลี่ยนใจไม่ยอมโอน นาย ข. จะฟ้องบังคับให้นาย ก. โอนที่ดินได้หรือไม่ เพราะเหตุใด?',
        type: 'ESSAY',
        correctAnswerText: `ธงคำตอบ:
        
นาย ข. ไม่สามารถฟ้องบังคับให้นาย ก. โอนที่ดินได้

เหตุผล:
1. ตามประมวลกฎหมายแพ่งและพาณิชย์ มาตรา 456 วรรคหนึ่ง กำหนดว่า การซื้อขายอสังหาริมทรัพย์ ถ้ามิได้ทำเป็นหนังสือและจดทะเบียนต่อพนักงานเจ้าหน้าที่ ท่านว่าเป็นโมฆะ

2. แม้นาย ก. และนาย ข. จะทำสัญญาเป็นหนังสือแล้ว แต่ยังไม่ได้จดทะเบียนต่อพนักงานเจ้าหน้าที่ สัญญาซื้อขายที่ดินจึงเป็นโมฆะ

3. เมื่อสัญญาเป็นโมฆะ ย่อมไม่ก่อให้เกิดสิทธิและหน้าที่ตามสัญญา นาย ข. จึงไม่มีสิทธิฟ้องบังคับให้นาย ก. โอนที่ดินได้`,
        explanation: 'เป็นข้อสอบเกี่ยวกับแบบของสัญญาซื้อขายอสังหาริมทรัพย์',
        order: 1,
        subject: 'กฎหมายแพ่ง',
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
let exams: Exam[] = [...initialExams];
let questions: Question[] = [...initialQuestions];

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
        totalExams: exams.length,
        publishedExams: exams.filter(e => e.status === 'published').length,
        totalQuestions: questions.length,
        totalViews: articles.reduce((sum, a) => sum + a.views, 0)
    };
}

// ============================================================================
// EXAMS CRUD
// ============================================================================

export function getExams(): Exam[] {
    return exams.filter(e => e.status === 'published');
}

export function getAllExams(): Exam[] {
    return exams;
}

export function getExamById(id: string): Exam | undefined {
    return exams.find(e => e.id === id);
}

export function createExam(data: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>): Exam {
    const now = new Date().toISOString();
    const newExam: Exam = {
        ...data,
        id: `exam-${Date.now()}`,
        createdAt: now,
        updatedAt: now
    };
    exams.unshift(newExam);
    return newExam;
}

export function updateExam(id: string, data: Partial<Exam>): Exam | null {
    const index = exams.findIndex(e => e.id === id);
    if (index === -1) return null;

    exams[index] = {
        ...exams[index],
        ...data,
        updatedAt: new Date().toISOString()
    };
    return exams[index];
}

export function deleteExam(id: string): boolean {
    const index = exams.findIndex(e => e.id === id);
    if (index === -1) return false;
    exams.splice(index, 1);
    // Also delete associated questions
    questions = questions.filter(q => q.examId !== id);
    return true;
}

// ============================================================================
// QUESTIONS CRUD
// ============================================================================

export function getQuestionsByExamId(examId: string): Question[] {
    return questions.filter(q => q.examId === examId).sort((a, b) => a.order - b.order);
}

export function getQuestionById(id: string): Question | undefined {
    return questions.find(q => q.id === id);
}

export function createQuestion(data: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Question {
    const now = new Date().toISOString();
    const newQuestion: Question = {
        ...data,
        id: `q-${Date.now()}`,
        createdAt: now,
        updatedAt: now
    };
    questions.push(newQuestion);

    // Update exam's totalQuestions count
    const exam = exams.find(e => e.id === data.examId);
    if (exam) {
        exam.totalQuestions = questions.filter(q => q.examId === data.examId).length;
    }

    return newQuestion;
}

export function updateQuestion(id: string, data: Partial<Question>): Question | null {
    const index = questions.findIndex(q => q.id === id);
    if (index === -1) return null;

    questions[index] = {
        ...questions[index],
        ...data,
        updatedAt: new Date().toISOString()
    };
    return questions[index];
}

export function deleteQuestion(id: string): boolean {
    const question = questions.find(q => q.id === id);
    if (!question) return false;

    const examId = question.examId;
    questions = questions.filter(q => q.id !== id);

    // Update exam's totalQuestions count
    const exam = exams.find(e => e.id === examId);
    if (exam) {
        exam.totalQuestions = questions.filter(q => q.examId === examId).length;
    }

    return true;
}

// ============================================================================
// EXAM ATTEMPTS (for storing exam submissions)
// ============================================================================

let examAttempts: ExamAttempt[] = [];

export function getAllAttempts(): ExamAttempt[] {
    return examAttempts;
}

export function getAttemptsByExamId(examId: string): ExamAttempt[] {
    return examAttempts.filter(a => a.examId === examId);
}

export function getAttemptById(id: string): ExamAttempt | undefined {
    return examAttempts.find(a => a.id === id);
}

export function createAttempt(data: Omit<ExamAttempt, 'id' | 'createdAt'>): ExamAttempt {
    const now = new Date().toISOString();
    const newAttempt: ExamAttempt = {
        ...data,
        id: `attempt-${Date.now()}`,
        createdAt: now
    };
    examAttempts.unshift(newAttempt);
    return newAttempt;
}

export function updateAttempt(id: string, data: Partial<ExamAttempt>): ExamAttempt | null {
    const index = examAttempts.findIndex(a => a.id === id);
    if (index === -1) return null;

    examAttempts[index] = {
        ...examAttempts[index],
        ...data
    };
    return examAttempts[index];
}

export function getAttemptStats() {
    return {
        totalAttempts: examAttempts.length,
        completedAttempts: examAttempts.filter(a => a.status === 'COMPLETED').length,
        passedAttempts: examAttempts.filter(a => a.passed).length,
        averageScore: examAttempts.length > 0
            ? examAttempts.reduce((sum, a) => sum + a.totalScore, 0) / examAttempts.length
            : 0
    };
}

