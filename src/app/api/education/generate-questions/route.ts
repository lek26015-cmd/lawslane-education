import { NextRequest, NextResponse } from 'next/server';
import { generateQuestions } from '@/lib/ai-question-generator';

// POST /api/education/generate-questions - Generate questions with AI
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { topic, category, difficulty, questionType, count } = body;

        if (!topic) {
            return NextResponse.json(
                { error: 'Missing required field: topic' },
                { status: 400 }
            );
        }

        const questions = await generateQuestions({
            topic,
            category,
            difficulty,
            questionType,
            count: count || 5
        });

        if (questions.length === 0) {
            return NextResponse.json(
                { error: 'Failed to generate questions. Please try again.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ questions });

    } catch (error) {
        console.error('Error generating questions:', error);
        return NextResponse.json(
            { error: 'Failed to generate questions' },
            { status: 500 }
        );
    }
}
