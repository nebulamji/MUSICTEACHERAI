import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DatabaseService {
    private static instance: DatabaseService;
    private constructor() {}

    static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    async recordInteraction(data: {
        sessionId: string;
        type: 'AUDIO' | 'TEXT' | 'DEMONSTRATION' | 'ASSESSMENT';
        input: any;
        response: any;
        metadata?: any;
    }) {
        return await prisma.interaction.create({
            data: {
                sessionId: data.sessionId,
                type: data.type,
                input: data.input,
                response: data.response,
                metadata: data.metadata || {}
            }
        });
    }

    async getRecentSessions(limit: number = 100) {
        return await prisma.session.findMany({
            take: limit,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                interactions: true,
                performance: true,
                student: {
                    include: {
                        progress: true
                    }
                }
            }
        });
    }

    async getLearningPatterns() {
        // Get all successful interactions to analyze patterns
        const successfulSessions = await prisma.session.findMany({
            where: {
                performance: {
                    some: {
                        analysis: {
                            path: ['success'],
                            equals: true
                        }
                    }
                }
            },
            include: {
                interactions: true,
                performance: true
            }
        });

        return successfulSessions;
    }
}
