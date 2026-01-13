import { NextRequest, NextResponse } from 'next/server';
import { getAllAttempts } from '@/lib/mock-store';
import { analyzeWeaknesses } from '@/lib/ai-weakness-analyzer';

// GET /api/education/analyze-weakness - Analyze user's weaknesses from exam attempts
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId'); // For future use with auth

        // Get all attempts (in production, filter by userId)
        const attempts = getAllAttempts();

        if (attempts.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No exam attempts found',
                analysis: {
                    overallAssessment: 'ยังไม่มีข้อมูลการทำข้อสอบ',
                    strongTopics: [],
                    weakTopics: [],
                    studyRecommendations: ['เริ่มทำข้อสอบเพื่อให้ AI วิเคราะห์จุดแข็ง/จุดอ่อนได้'],
                    improvementPlan: [],
                    motivationalMessage: 'เริ่มต้นดี มีชัยไปกว่าครึ่ง! 💪'
                }
            });
        }

        const analysis = await analyzeWeaknesses(attempts);

        return NextResponse.json({
            success: true,
            totalAttempts: attempts.length,
            analysis
        });

    } catch (error) {
        console.error('Error analyzing weakness:', error);
        return NextResponse.json(
            { error: 'Failed to analyze' },
            { status: 500 }
        );
    }
}
