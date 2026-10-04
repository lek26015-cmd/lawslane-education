// รายชื่อสถาบันที่เปิดสอนนิติศาสตร์ — ใช้ข้อมูลทางการจาก mytcas.com (ทปอ.) เป็นหลัก
// ที่มา: https://course.mytcas.com (ไฟล์ courses.json / rounds/<programId>.json ของระบบ) · ตรวจเมื่อ 2026-10-04
// id = รหัสสถาบันของ mytcas (ใช้สร้างลิงก์ไปหน้าสถาบัน) · ไม่ใช้โลโก้มหาวิทยาลัย เพื่อเลี่ยงเรื่องสิทธิ์เครื่องหมาย
// รายชื่อตั้งต้นมาจาก tcas.in.th (Dek-D ไม่ใช่เว็บทางการ) แล้วตรวจ/เพิ่มด้วยข้อมูลทางการ
// ต้องตรวจซ้ำทุกปีการศึกษา — สถานะ tcas70 เป็นภาพ ณ วันที่ตรวจ ข้อมูลจริงเปลี่ยนตลอด ให้ดูที่ลิงก์ mytcas เสมอ

export type FacultyGroup = 'state' | 'rajabhat' | 'private';

// สถานะข้อมูลปี TCAS70 ในระบบทางการ ณ วันที่ตรวจ
//  round3  = ประกาศเกณฑ์รอบ 3 แล้วอย่างน้อย 1 หลักสูตรนิติศาสตร์
//  listed  = ขึ้นหลักสูตรนิติศาสตร์แล้ว แต่รอบ 3 ยังไม่ประกาศ
//  pending = ยังไม่พบหลักสูตรนิติศาสตร์ในระบบทางการ (อาจยังไม่ส่งข้อมูล ไม่ได้แปลว่าไม่เปิดสอน)
export type Tcas70Status = 'round3' | 'listed' | 'pending';

export interface LawFaculty {
  id: string;
  university: string;
  group: FacultyGroup;
  tcas70: Tcas70Status;
  // วิชาที่ใช้ในรอบ 3 Admission ปี TCAS68 (ปีก่อนหน้า) เฉพาะที่ 2 แหล่งอิสระ (tcaster.net, admissionpremium.com) ตรงกัน
  // ไม่ใช่ข้อมูลทางการ ไม่ใส่สัดส่วน/คะแนนขั้นต่ำ — ใช้ดูแนวทางเท่านั้น
  tcas68Subjects?: string[];
}

export const FACULTY_GROUP_LABELS: Record<FacultyGroup, string> = {
  state: 'มหาวิทยาลัยรัฐ',
  rajabhat: 'มหาวิทยาลัยราชภัฏ',
  private: 'เอกชน / อื่น ๆ',
};

export const TCAS70_STATUS_LABELS: Record<Tcas70Status, string> = {
  round3: 'ประกาศเกณฑ์รอบ 3 ปี 70 แล้ว',
  listed: 'ขึ้นหลักสูตรปี 70 แล้ว · รอบ 3 ยังไม่ประกาศ',
  pending: 'ยังไม่พบข้อมูลปี 70 ในระบบทางการ',
};

export const LAW_FACULTIES: LawFaculty[] = [
  { id: '001', university: 'จุฬาลงกรณ์มหาวิทยาลัย', group: 'state', tcas70: 'listed', tcas68Subjects: ['TGAT','A-Level สังคม','A-Level ภาษาไทย','A-Level ภาษาอังกฤษ','A-Level คณิต 2 (หรือวิชาเลือกตามประกาศ)'] },
  { id: '002', university: 'มหาวิทยาลัยเกษตรศาสตร์', group: 'state', tcas70: 'listed', tcas68Subjects: ['TGAT','A-Level สังคม','A-Level ภาษาอังกฤษ','วิชาเลือกตามประกาศ'] },
  { id: '003', university: 'มหาวิทยาลัยขอนแก่น', group: 'state', tcas70: 'listed', tcas68Subjects: ['A-Level สังคม','A-Level ภาษาไทย','A-Level ภาษาอังกฤษ','A-Level คณิต 2'] },
  { id: '004', university: 'มหาวิทยาลัยเชียงใหม่', group: 'state', tcas70: 'listed' },
  { id: '005', university: 'มหาวิทยาลัยธรรมศาสตร์', group: 'state', tcas70: 'listed', tcas68Subjects: ['TGAT','A-Level สังคม','A-Level ภาษาไทย','A-Level ภาษาอังกฤษ','A-Level วิชาเลือก'] },
  { id: '006', university: 'มหาวิทยาลัยมหิดล', group: 'state', tcas70: 'listed' },
  { id: '009', university: 'มหาวิทยาลัยศรีนครินทรวิโรฒ', group: 'state', tcas70: 'listed', tcas68Subjects: ['TGAT','A-Level สังคม','A-Level ภาษาอังกฤษ'] },
  { id: '010', university: 'มหาวิทยาลัยสงขลานครินทร์', group: 'state', tcas70: 'listed' },
  { id: '018', university: 'มหาวิทยาลัยอุบลราชธานี', group: 'state', tcas70: 'round3' },
  { id: '019', university: 'มหาวิทยาลัยบูรพา', group: 'state', tcas70: 'listed' },
  { id: '020', university: 'มหาวิทยาลัยนเรศวร', group: 'state', tcas70: 'listed', tcas68Subjects: ['GPAX','TGAT','A-Level สังคม','A-Level ภาษาไทย','A-Level ภาษาอังกฤษ','A-Level คณิต'] },
  { id: '021', university: 'มหาวิทยาลัยมหาสารคาม', group: 'state', tcas70: 'listed' },
  { id: '022', university: 'มหาวิทยาลัยทักษิณ', group: 'state', tcas70: 'listed' },
  { id: '023', university: 'มหาวิทยาลัยวลัยลักษณ์', group: 'state', tcas70: 'listed' },
  { id: '024', university: 'มหาวิทยาลัยแม่ฟ้าหลวง', group: 'state', tcas70: 'listed' },
  { id: '026', university: 'มหาวิทยาลัยนครพนม', group: 'state', tcas70: 'round3' },
  { id: '027', university: 'มหาวิทยาลัยพะเยา', group: 'state', tcas70: 'pending' },
  { id: '028', university: 'มหาวิทยาลัยกาฬสินธุ์', group: 'state', tcas70: 'round3' },
  { id: '037', university: 'มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย', group: 'state', tcas70: 'pending' },
  { id: '165', university: 'มหาวิทยาลัยสวนดุสิต', group: 'state', tcas70: 'listed' },
  { id: '142', university: 'มหาวิทยาลัยราชภัฏชัยภูมิ', group: 'rajabhat', tcas70: 'pending' },
  { id: '144', university: 'มหาวิทยาลัยราชภัฏเชียงใหม่', group: 'rajabhat', tcas70: 'pending' },
  { id: '146', university: 'มหาวิทยาลัยราชภัฏธนบุรี', group: 'rajabhat', tcas70: 'round3' },
  { id: '148', university: 'มหาวิทยาลัยราชภัฏนครราชสีมา', group: 'rajabhat', tcas70: 'pending' },
  { id: '150', university: 'มหาวิทยาลัยราชภัฏพระนคร', group: 'rajabhat', tcas70: 'listed' },
  { id: '152', university: 'มหาวิทยาลัยราชภัฏพิบูลสงคราม', group: 'rajabhat', tcas70: 'round3' },
  { id: '153', university: 'มหาวิทยาลัยราชภัฏวไลยอลงกรณ์ ในพระบรมราชูปถัมภ์', group: 'rajabhat', tcas70: 'round3' },
  { id: '166', university: 'มหาวิทยาลัยราชภัฏสวนสุนันทา', group: 'rajabhat', tcas70: 'listed' },
  { id: '171', university: 'มหาวิทยาลัยราชภัฏอุบลราชธานี', group: 'rajabhat', tcas70: 'round3' },
  { id: '172', university: 'มหาวิทยาลัยราชภัฏนครสวรรค์', group: 'rajabhat', tcas70: 'listed' },
  { id: '174', university: 'มหาวิทยาลัยราชภัฏบ้านสมเด็จเจ้าพระยา', group: 'rajabhat', tcas70: 'round3' },
  { id: '177', university: 'มหาวิทยาลัยราชภัฏจันทรเกษม', group: 'rajabhat', tcas70: 'round3' },
  { id: '054', university: 'มหาวิทยาลัยศรีปทุม', group: 'private', tcas70: 'round3' },
  { id: '056', university: 'มหาวิทยาลัยหอการค้าไทย', group: 'private', tcas70: 'round3' },
  { id: '068', university: 'มหาวิทยาลัยรังสิต', group: 'private', tcas70: 'pending' },
  { id: '073', university: 'มหาวิทยาลัยหัวเฉียวเฉลิมพระเกียรติ', group: 'private', tcas70: 'pending' },
  { id: '103', university: 'มหาวิทยาลัยธุรกิจบัณฑิตย์', group: 'private', tcas70: 'round3' },
  { id: '130', university: 'มหาวิทยาลัยหาดใหญ่', group: 'private', tcas70: 'round3' },
  { id: '180', university: 'มหาวิทยาลัยเกษมบัณฑิต', group: 'private', tcas70: 'pending' },
  { id: '181', university: 'มหาวิทยาลัยสยาม', group: 'private', tcas70: 'listed' },
  { id: '911', university: 'มหาวิทยาลัยปทุมธานี', group: 'private', tcas70: 'round3' },
  { id: '916', university: 'วิทยาลัยนครราชสีมา', group: 'private', tcas70: 'round3' },
  { id: '917', university: 'วิทยาลัยนอร์ทเทิร์น', group: 'private', tcas70: 'round3' },
  { id: '921', university: 'มหาวิทยาลัยอัสสัมชัญ', group: 'private', tcas70: 'listed' },
  { id: '922', university: 'มหาวิทยาลัยวงษ์ชวลิตกุล', group: 'private', tcas70: 'round3' },
  { id: '923', university: 'มหาวิทยาลัยเซาธ์อีสท์บางกอก', group: 'private', tcas70: 'listed' },
];

// หน้าสถาบันบน course.mytcas.com (ระบบข้อมูลหลักสูตรทางการของ ทปอ.) — แสดงทุกคณะ ให้เลือกคณะนิติศาสตร์เอง
export function tcasUniversityUrl(f: LawFaculty): string {
  return `https://course.mytcas.com/universities/${f.id}`;
}

// สรุปภาพรวมข้อมูลทางการ ณ 2026-10-04 (นับจาก courses.json + rounds/*.json)
export const TCAS70_SNAPSHOT = {
  asOf: '4 ต.ค. 2569',
  asOfISO: '2026-10-04',
  universitiesWithLaw: 38,
  universitiesRound3Announced: 17,
};

// ปฏิทินรอบ 3 Admission ของ TCAS70 (ปีการศึกษา 2570) จาก mytcas.com — ตรงกับเว็บข่าว/ติวอิสระ ตรวจเมื่อ 2026-10-04
// รอบอื่นยังไม่ใส่ เพราะสรุปจากแหล่งไม่สอดคล้องกัน ให้ดูที่ mytcas.com
export const TCAS70_ROUND3 = [
  { label: 'รับสมัคร', value: '7–11 พ.ค. 2570 (เพิ่มเติม 12–13 พ.ค.)' },
  { label: 'ประกาศผล', value: '22 พ.ค. และ 27 พ.ค. 2570' },
  { label: 'ยืนยันสิทธิ์', value: '22–23 พ.ค. 2570' },
];
export const MYTCAS_URL = 'https://www.mytcas.com/';
export const MYTCAS_COURSE_URL = 'https://course.mytcas.com/universities';
