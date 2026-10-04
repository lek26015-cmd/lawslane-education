// รายชื่อสถาบันที่เปิดสอนนิติศาสตร์ในระบบ TCAS (40 แห่ง)
// ที่มา: https://tcas.in.th/search/faculty-group/กลุ่มคณะนิติศาสตร์.13/ — ตรวจเมื่อ 2026-10-04
// โลโก้: public/universities/<tcasId>.png (200x200) ดาวน์โหลดจาก www0.dek-d.com/assets/admcal/images/2024/ เมื่อ 2026-10-04 · เป็นเครื่องหมายของแต่ละมหาวิทยาลัย ใช้เพื่อระบุสถาบันเท่านั้น
// tcasId = รหัสมหาวิทยาลัยใน TCAS · ต้องตรวจซ้ำทุกปีการศึกษา (บางแห่งเปลี่ยนชื่อ/ปิด/เปิดใหม่)

export type FacultyGroup = 'state' | 'rajabhat' | 'private';

export interface LawFaculty {
  tcasId: number;
  university: string;
  group: FacultyGroup;
  // วิชาที่ใช้ในรอบ 3 Admission ปี TCAS68 เฉพาะที่ 2 แหล่ง (tcaster.net, admissionpremium.com) ตรงกัน
  // ไม่ใส่สัดส่วน/คะแนนขั้นต่ำ เพราะแหล่งข้อมูลขัดกันและเปลี่ยนทุกปี — ต้องตรวจประกาศปีล่าสุดเสมอ
  tcas68Subjects?: string[];
}

export const FACULTY_GROUP_LABELS: Record<FacultyGroup, string> = {
  state: 'มหาวิทยาลัยรัฐ',
  rajabhat: 'มหาวิทยาลัยราชภัฏ',
  private: 'เอกชน / อื่น ๆ',
};

export const LAW_FACULTIES: LawFaculty[] = [
  { tcasId: 1, university: 'จุฬาลงกรณ์มหาวิทยาลัย', group: 'state', tcas68Subjects: ['TGAT','A-Level สังคม','A-Level ภาษาไทย','A-Level ภาษาอังกฤษ','A-Level คณิต 2 (หรือวิชาเลือกตามประกาศ)'] },
  { tcasId: 2, university: 'มหาวิทยาลัยเกษตรศาสตร์', group: 'state', tcas68Subjects: ['TGAT','A-Level สังคม','A-Level ภาษาอังกฤษ','วิชาเลือกตามประกาศ'] },
  { tcasId: 3, university: 'มหาวิทยาลัยขอนแก่น', group: 'state', tcas68Subjects: ['A-Level สังคม','A-Level ภาษาไทย','A-Level ภาษาอังกฤษ','A-Level คณิต 2'] },
  { tcasId: 4, university: 'มหาวิทยาลัยเชียงใหม่', group: 'state' },
  { tcasId: 9, university: 'มหาวิทยาลัยธรรมศาสตร์', group: 'state', tcas68Subjects: ['TGAT','A-Level สังคม','A-Level ภาษาไทย','A-Level ภาษาอังกฤษ','A-Level วิชาเลือก'] },
  { tcasId: 20, university: 'มหาวิทยาลัยศรีนครินทรวิโรฒ', group: 'state', tcas68Subjects: ['TGAT','A-Level สังคม','A-Level ภาษาอังกฤษ'] },
  { tcasId: 23, university: 'มหาวิทยาลัยสวนดุสิต', group: 'state' },
  { tcasId: 22, university: 'มหาวิทยาลัยสงขลานครินทร์', group: 'state' },
  { tcasId: 24, university: 'มหาวิทยาลัยอุบลราชธานี', group: 'state' },
  { tcasId: 13, university: 'มหาวิทยาลัยบูรพา', group: 'state' },
  { tcasId: 12, university: 'มหาวิทยาลัยนเรศวร', group: 'state', tcas68Subjects: ['GPAX','TGAT','A-Level สังคม','A-Level ภาษาไทย','A-Level ภาษาอังกฤษ','A-Level คณิต'] },
  { tcasId: 16, university: 'มหาวิทยาลัยมหาสารคาม', group: 'state' },
  { tcasId: 5, university: 'มหาวิทยาลัยทักษิณ', group: 'state' },
  { tcasId: 19, university: 'มหาวิทยาลัยวลัยลักษณ์', group: 'state' },
  { tcasId: 18, university: 'มหาวิทยาลัยแม่ฟ้าหลวง', group: 'state' },
  { tcasId: 10, university: 'มหาวิทยาลัยนครพนม', group: 'state' },
  { tcasId: 14, university: 'มหาวิทยาลัยพะเยา', group: 'state' },
  { tcasId: 37, university: 'มหาวิทยาลัยกาฬสินธุ์', group: 'state' },
  { tcasId: 96, university: 'มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย', group: 'state' },
  { tcasId: 72, university: 'มหาวิทยาลัยราชภัฏชัยภูมิ', group: 'rajabhat' },
  { tcasId: 46, university: 'มหาวิทยาลัยราชภัฏเชียงใหม่', group: 'rajabhat' },
  { tcasId: 44, university: 'มหาวิทยาลัยราชภัฏนครราชสีมา', group: 'rajabhat' },
  { tcasId: 43, university: 'มหาวิทยาลัยราชภัฏพิบูลสงคราม', group: 'rajabhat' },
  { tcasId: 36, university: 'มหาวิทยาลัยราชภัฏวไลยอลงกรณ์', group: 'rajabhat' },
  { tcasId: 31, university: 'มหาวิทยาลัยราชภัฏสวนสุนันทา', group: 'rajabhat' },
  { tcasId: 42, university: 'มหาวิทยาลัยราชภัฏอุบลราชธานี', group: 'rajabhat' },
  { tcasId: 29, university: 'มหาวิทยาลัยราชภัฏบ้านสมเด็จเจ้าพระยา', group: 'rajabhat' },
  { tcasId: 78, university: 'มหาวิทยาลัยราชภัฏจันทรเกษม', group: 'rajabhat' },
  { tcasId: 79, university: 'มหาวิทยาลัยเกษมบัณฑิต', group: 'private' },
  { tcasId: 80, university: 'มหาวิทยาลัยสยาม', group: 'private' },
  { tcasId: 57, university: 'มหาวิทยาลัยศรีปทุม', group: 'private' },
  { tcasId: 58, university: 'มหาวิทยาลัยหอการค้าไทย', group: 'private' },
  { tcasId: 61, university: 'มหาวิทยาลัยรังสิต', group: 'private' },
  { tcasId: 62, university: 'มหาวิทยาลัยหัวเฉียวเฉลิมพระเกียรติ', group: 'private' },
  { tcasId: 64, university: 'มหาวิทยาลัยธุรกิจบัณฑิตย์', group: 'private' },
  { tcasId: 97, university: 'มหาวิทยาลัยหาดใหญ่', group: 'private' },
  { tcasId: 99, university: 'มหาวิทยาลัยปทุมธานี', group: 'private' },
  { tcasId: 102, university: 'วิทยาลัยนครราชสีมา', group: 'private' },
  { tcasId: 103, university: 'วิทยาลัยนอร์ทเทิร์น', group: 'private' },
  { tcasId: 109, university: 'มหาวิทยาลัยเซาธ์อีสท์บางกอก', group: 'private' },
];

export const TCAS_LAW_URL =
  'https://tcas.in.th/search/faculty-group/%E0%B8%81%E0%B8%A5%E0%B8%B8%E0%B9%88%E0%B8%A1%E0%B8%84%E0%B8%93%E0%B8%B0%E0%B8%99%E0%B8%B4%E0%B8%95%E0%B8%B4%E0%B8%A8%E0%B8%B2%E0%B8%AA%E0%B8%95%E0%B8%A3%E0%B9%8C.13/';
