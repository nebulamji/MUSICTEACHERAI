import { OpenAI } from "openai";

interface LearningPattern {
  approach: string;
  result: number;
}

interface LearningPatterns {
  successfulApproaches: LearningPattern[];
  commonChallenges: LearningPattern[];
  effectiveResponses: LearningPattern[];
}

export class LearningAggregator {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async aggregateRecentLearnings() {
    try {
      // Mock learning patterns for now
      const mockPatterns: LearningPatterns = {
        successfulApproaches: [
          { approach: "rhythm_exercises", result: 0.8 },
          { approach: "harmony_analysis", result: 0.75 },
        ],
        commonChallenges: [
          { approach: "complex_rhythms", result: 0.6 },
          { approach: "advanced_harmony", result: 0.65 },
        ],
        effectiveResponses: [
          { approach: "guided_practice", result: 0.85 },
          { approach: "theory_application", result: 0.8 },
        ],
      };

      // Generate analysis using OpenAI
      const analysis = await this.generateAnalysis(mockPatterns);

      return {
        patterns: mockPatterns,
        analysis,
      };
    } catch (error) {
      console.error("Error aggregating learnings:", error);
      // Return default patterns if there's an error
      return {
        patterns: {
          successfulApproaches: [],
          commonChallenges: [],
          effectiveResponses: [],
        },
        analysis: "Unable to generate analysis at this time.",
      };
    }
  }

  private async generateAnalysis(patterns: LearningPatterns): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a music education expert analyzing teaching patterns.",
          },
          {
            role: "user",
            content: `Analyze these learning patterns from music teaching sessions:
                            Successful Approaches: ${JSON.stringify(patterns.successfulApproaches)}
                            Common Challenges: ${JSON.stringify(patterns.commonChallenges)}
                            Effective Responses: ${JSON.stringify(patterns.effectiveResponses)}

                            Provide insights on:
                            1. Most effective teaching patterns
                            2. Common student challenges
                            3. Recommended teaching strategy adjustments`,
          },
        ],
      });

      return response.choices[0].message.content || "No analysis generated.";
    } catch (error) {
      console.error("Error generating analysis:", error);
      return "Unable to generate analysis due to an error.";
    }
  }
}
