'use server';

import { initAdmin } from './firebase-admin';
import { Book, Exam, Order, Course } from './education-types';

// Mock Courses
const MOCK_COURSES: Course[] = [
    {
        id: "course-1",
        title: "ติวสรุปกฎหมายแพ่งและพาณิชย์ (ฉบับรวบรัด)",
        description: "สรุปเนื้อหากฎหมายแพ่งและพาณิชย์ครบทุกบรรพ เน้นจุดที่ออกข้อสอบบ่อย พร้อมเทคนิคการจดจำ",
        longDescription: `
            <p>คอร์สนี้เหมาะสำหรับผู้ที่ต้องการทบทวนเนื้อหากฎหมายแพ่งและพาณิชย์อย่างรวดเร็วและกระชับ...</p>
            <h3>สิ่งที่คุณจะได้เรียนรู้</h3>
            <ul>
                <li>สรุปหลักกฎหมายนิติกรรมสัญญา</li>
                <li>เจาะลึกเรื่องหนี้และละเมิด</li>
                <li>ครอบครัวและมรดกที่ควรรู้</li>
            </ul>
        `,
        price: 1500,
        coverUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop",
        instructor: {
            name: "อ.ชัยชนะ กฎหมาย",
            avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
            bio: "ติวเตอร์กฎหมายประสบการณ์กว่า 10 ปี"
        },
        category: "Civil Law",
        level: "Intermediate",
        totalDurationMinutes: 480,
        totalLessons: 12,
        rating: 4.8,
        reviewCount: 120,
        modules: [
            {
                id: "m1",
                title: "บทนำและนิติกรรม",
                lessons: [
                    { id: "l1", title: "ภาพรวมกฎหมายแพ่ง", durationMinutes: 45, isFreePreview: true, videoUrl: "https://example.com/video1" },
                    { id: "l2", title: "หลักนิติกรรมสัญญา", durationMinutes: 60, isFreePreview: false }
                ]
            }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "course-2",
        title: "คอร์สตะลุยโจทย์เนติบัณฑิต ภาค 1",
        description: "ฝึกทำข้อสอบเก่าเนติบัณฑิต ภาค 1 ย้อนหลัง 10 ปี พร้อมธงคำตอบและวิเคราะห์แนวข้อสอบ",
        price: 2500,
        coverUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop",
        instructor: {
            name: "ทีมติวเตอร์ Lawlanes",
            avatarUrl: "",
            bio: "ทีมอาจารย์ผู้เชี่ยวชาญจาก Lawlanes Education"
        },
        category: "Exam Prep",
        level: "Advanced",
        totalDurationMinutes: 1200,
        totalLessons: 20,
        rating: 4.9,
        reviewCount: 85,
        modules: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    }
];

// Mock books for development
const MOCK_BOOKS: Book[] = [
    {
        id: "1",
        title: "คู่มือเตรียมสอบใบอนุญาตว่าความ",
        description: "สรุปเนื้อหาสำคัญสำหรับสอบภาคทฤษฎี ครบถ้วน เข้าใจง่าย พร้อมตัวอย่างข้อสอบจริงจากสนามสอบ 5 ปีล่าสุด เหมาะสำหรับผู้ที่เตรียมตัวสอบใบอนุญาตว่าความ ภาคทฤษฎี",
        price: 350,
        coverUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=560&fit=crop",
        author: "อ.สมชาย กฎหมายแม่น",
        stock: 50,
        isDigital: false,
        level: "ใบอนุญาตว่าความ",
        category: "เตรียมสอบ",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "2",
        title: "รวมข้อสอบตั๋วทนาย 10 ปี",
        description: "เจาะลึกข้อสอบเก่า พร้อมเฉลยละเอียด ครบทุกสนามสอบ รวมคำถามกว่า 500 ข้อ พร้อมวิเคราะห์แนวโน้มข้อสอบ",
        price: 450,
        coverUrl: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=400&h=560&fit=crop",
        author: "ทีมงาน Lawlanes",
        stock: 20,
        isDigital: false,
        level: "ใบอนุญาตว่าความ",
        category: "เตรียมสอบ",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "3",
        title: "เทคนิคการร่างฟ้องและคำร้อง",
        description: "เทคนิคระดับมือโปรสำหรับการร่างเอกสารทางกฎหมาย รูปแบบ PDF พร้อมตัวอย่างคำฟ้องจริงกว่า 50 แบบ",
        price: 199,
        coverUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=560&fit=crop",
        author: "ทนายวิชัย",
        stock: 999,
        isDigital: true,
        level: "ทักษะปฏิบัติ",
        category: "ทักษะงานคดี",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "4",
        title: "กฎหมายแพ่งว่าด้วยสัญญา",
        description: "หลักกฎหมายสัญญาฉบับสมบูรณ์ อธิบายทุกมาตราพร้อมคำพิพากษาศาลฎีกาที่สำคัญ",
        price: 280,
        coverUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=560&fit=crop",
        author: "ศ.ดร.สมศักดิ์ แพ่งศรี",
        stock: 35,
        isDigital: false,
        level: "ชั้นปริญญาตรี",
        category: "กฎหมายแพ่ง",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "5",
        title: "ป.วิ.อาญา ฉบับอ่านง่าย",
        description: "วิธีพิจารณาความอาญา สรุปเข้าใจง่าย พร้อมแผนภูมิกระบวนการและ Flowchart",
        price: 320,
        coverUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=560&fit=crop",
        author: "อ.อาญา สมบูรณ์",
        stock: 40,
        isDigital: false,
        level: "ชั้นปริญญาตรี",
        category: "กฎหมายวิธีพิจารณาความ",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "6",
        title: "ถาม-ตอบ กฎหมายลักษณะพยาน",
        description: "รวม Q&A กฎหมายพยานหลักฐาน 500 ข้อ พร้อมเฉลยละเอียด เหมาะสำหรับทบทวนก่อนสอบ",
        price: 250,
        coverUrl: "https://images.unsplash.com/photo-1423592707957-3b212afa6733?w=400&h=560&fit=crop",
        author: "Lawlanes",
        stock: 999,
        isDigital: true,
        level: "เนติบัณฑิต",
        category: "กฎหมายวิธีพิจารณาความ",
        createdAt: new Date(),
        updatedAt: new Date(),
    }
];

export async function getBookById(id: string): Promise<Book | null> {
    // First try to get from Firestore
    const admin = await initAdmin();
    if (admin) {
        const doc = await admin.firestore().collection('books').doc(id).get();
        if (doc.exists) {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                publishedAt: data?.publishedAt?.toDate ? data.publishedAt.toDate() : (data?.publishedAt instanceof Date ? data.publishedAt : undefined),
                createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
                updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
            } as Book;
        }
    }

    // Fallback to mock data
    return MOCK_BOOKS.find(book => book.id === id) || null;
}

export async function getAllBooks(): Promise<Book[]> {
    const admin = await initAdmin();
    if (admin) {
        const snapshot = await admin.firestore().collection('books').get();
        if (snapshot.docs.length > 0) {
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    publishedAt: data?.publishedAt?.toDate ? data.publishedAt.toDate() : (data?.publishedAt instanceof Date ? data.publishedAt : undefined),
                    createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
                    updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
                } as Book;
            });
        }
    }

    // Fallback to mock data
    return MOCK_BOOKS;
}

export async function getAllCourses(): Promise<Course[]> {
    const admin = await initAdmin();
    // In real implementation, fetch from Firestore 'courses' collection
    return MOCK_COURSES;
}

export async function getCourseById(id: string): Promise<Course | null> {
    // In real implementation, fetch from Firestore
    return MOCK_COURSES.find(c => c.id === id) || null;
}

// Mock Orders
export async function getUserOrders(userId: string): Promise<Order[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return [
        {
            id: 'ORD-202601001',
            userId: userId,
            items: [
                {
                    id: '1',
                    title: 'ชุดเตรียมสอบตั๋วทนาย ภาคทฤษฎี (ฉบับสมบูรณ์)',
                    type: 'BOOK',
                    price: 450,
                    quantity: 1,
                    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop'
                }
            ],
            totalAmount: 450,
            status: 'SHIPPING',
            shippingInfo: {
                name: 'สมชาย รักเรียน',
                phone: '081-234-5678',
                address: '123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กทม. 10110',
                trackingNumber: 'TH0123456789A',
                carrier: 'Kerry Express'
            },
            createdAt: new Date('2026-01-08T10:30:00'),
            updatedAt: new Date('2026-01-09T14:20:00')
        },
        {
            id: 'ORD-202601002',
            userId: userId,
            items: [
                {
                    id: '3',
                    title: 'คู่มือสอบอัยการผู้ช่วย สนามเล็ก',
                    type: 'BOOK',
                    price: 650,
                    quantity: 1,
                    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop'
                },
                {
                    id: 'mock-exam-1',
                    title: 'ข้อสอบจำลอง O-NET กฎหมาย',
                    type: 'EXAM',
                    price: 199,
                    quantity: 1
                }
            ],
            totalAmount: 849,
            status: 'PENDING',
            createdAt: new Date('2026-01-10T09:15:00'),
            updatedAt: new Date('2026-01-10T09:15:00')
        }
    ];
}
