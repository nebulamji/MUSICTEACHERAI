import { LearningAggregator } from "./learning/aggregator";

interface LearningSession {
  sessionId: string;
  type: string;
  input: any;
  metadata: {
    concept?: string;
    timestamp: Date;
  };
}

interface LearningResponse {
  patterns: any[];
  successfulApproaches: any[];
  recommendations: string[];
}

export class LearningIntegrator {
  private aggregator: LearningAggregator;

  constructor() {
    this.aggregator = new LearningAggregator();
  }

  async processNewSession(session: LearningSession): Promise<LearningResponse> {
    try {
      // Get aggregated learning patterns
      const learningData = await this.aggregator.aggregateRecentLearnings();

      // Process the current session with historical patterns
      return {
        patterns: this.extractRelevantPatterns(learningData.patterns, session),
        successfulApproaches: learningData.patterns.successfulApproaches || [],
        recommendations: this.generateRecommendations(learningData.analysis || ""),
      };
    } catch (error) {
      console.error("Error processing learning session:", error);
      return {
        patterns: [],
        successfulApproaches: [],
        recommendations: ["Focus on basic concepts", "Practice regularly"],
      };
    }
  }

  private extractRelevantPatterns(patterns: any, session: LearningSession): any[] {
    // Extract patterns relevant to the current session
    return patterns.successfulApproaches.filter(
      (pattern: any) => pattern.approach === session.type,
    );
  }

  private generateRecommendations(analysis: string): string[] {
    if (!analysis.trim()) {
      return [
        "Practice with a metronome",
        "Focus on rhythm exercises",
        "Study music theory concepts",
      ];
    }

    // Extract recommendations from the analysis
    const lines = analysis.split("\n");
    const recommendations = lines.filter(
      (line) => line.includes("recommend") || line.includes("suggest"),
    );

    return recommendations.length > 0
      ? recommendations
      : ["Practice with a metronome", "Focus on rhythm exercises", "Study music theory concepts"];
  }
}
