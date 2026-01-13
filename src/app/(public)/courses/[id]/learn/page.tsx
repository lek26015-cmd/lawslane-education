
import { getCourseById } from "@/lib/education-data-admin";
import { notFound } from "next/navigation";
import { CoursePlayer } from "@/components/education/course-player";

export default async function LearnPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const course = await getCourseById(id);

    if (!course) {
        notFound();
    }

    // In a real app, we would also check if the user is enrolled here.
    // For now, we assume access is granted if they reached this link (or middleware handles it).

    return <CoursePlayer course={course} />;
}
