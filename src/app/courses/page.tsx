
import { getAllCourses } from "@/lib/education-data-admin";
import { PageHeader } from "../components/page-header";
import { AnimatedCourseGrid } from "../components/animated-course-grid";

export default async function CourseListingPage() {
    const courses = await getAllCourses();

    return (
        <div className="space-y-8">
            <PageHeader
                title="คอร์สออนไลน์"
                description="เรียนรู้กฎหมายได้ทุกที่ทุกเวลา กับคอร์สเรียนออนไลน์คุณภาพจากติวเตอร์ชั้นนำ"
                icon="PlayCircle"
                theme="indigo"
                backLink="/education"
                backLabel="กลับหน้าหลัก"
                badge={`${courses.length} คอร์สเรียน`}
            />

            <AnimatedCourseGrid courses={courses} />
        </div>
    );
}
