interface Session {
  id: string;
  studentId: string;
  startTime: Date;
  currentTopic?: string;
  skillLevel?: number;
  progress?: StudentProgress;
  notes?: LessonNote[];
}

interface StudentProgress {
  skillLevel: number;
  conceptMastery: {
    current: string[];
    mastered: string[];
  };
}

interface LessonNote {
  timestamp: Date;
  type: "feedback" | "observation";
  content: string;
}

export class SessionManager {
  private sessions: Map<string, Session>;

  constructor() {
    this.sessions = new Map();
  }

  async getOrCreateSession(studentId: string): Promise<Session> {
    const existingSession = this.sessions.get(studentId);
    if (existingSession) {
      return existingSession;
    }

    const newSession: Session = {
      id: `session_${Date.now()}`,
      studentId,
      startTime: new Date(),
      skillLevel: 1,
      progress: {
        skillLevel: 1,
        conceptMastery: {
          current: [],
          mastered: [],
        },
      },
    };

    this.sessions.set(studentId, newSession);
    return newSession;
  }

  async updateSession(
    sessionId: string,
    updates: {
      notes?: LessonNote;
      progress?: Partial<StudentProgress>;
      feedback?: any;
    },
  ): Promise<Session> {
    const session = Array.from(this.sessions.values()).find((s) => s.id === sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (updates.notes) {
      session.notes = [...(session.notes || []), updates.notes];
    }

    if (updates.progress && session.progress) {
      session.progress = {
        skillLevel: updates.progress.skillLevel ?? session.progress.skillLevel,
        conceptMastery: {
          current:
            updates.progress.conceptMastery?.current ?? session.progress.conceptMastery.current,
          mastered:
            updates.progress.conceptMastery?.mastered ?? session.progress.conceptMastery.mastered,
        },
      };
    }

    this.sessions.set(session.studentId, session);
    return session;
  }
}
