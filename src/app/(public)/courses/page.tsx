import { PageHeader } from "@/components/education/page-header";
import { AnimatedCourseGrid } from "@/components/education/animated-course-grid";
import { getCourses } from "@/lib/mock-store";

export default async function CourseListingPage() {
    // Use mock store directly for Server Component
    const courses = getCourses();

    return (
        <div className="space-y-8">
            <PageHeader
                title="คอร์สออนไลน์"
                description="เรียนรู้กฎหมายได้ทุกที่ทุกเวลา กับคอร์สเรียนออนไลน์คุณภาพจากติวเตอร์ชั้นนำ"
                icon="PlayCircle"
                theme="purple"
                backLink="/"
                backLabel="กลับหน้าหลัก"
                badge={`${courses.length} คอร์สเรียน`}
            />

            <AnimatedCourseGrid courses={courses} />
        </div>
    );
}
