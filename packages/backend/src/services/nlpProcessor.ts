import { OpenAI } from "openai";

interface MusicContext {
  genre?: "jazz" | "classical" | "other";
  style?: string;
  theoryConcepts: string[];
  difficulty: number;
}

interface TeachingResponse {
  explanation: string;
  suggestions: string[];
  nextConcepts: string[];
}

export class NLPProcessor {
  private openai: OpenAI;

  private readonly JAZZ_CONCEPTS = [
    "swing",
    "improvisation",
    "chord extensions",
    "modal interchange",
    "ii-V-I progressions",
    "altered dominants",
    "voice leading",
    "rhythmic displacement",
    "blue notes",
    "bebop scales",
  ];

  constructor(openaiApiKey: string) {
    this.openai = new OpenAI({
      apiKey: openaiApiKey,
    });
  }

  async analyzeMusicalConcepts(
    studentInput: string,
    audioAnalysis: any,
  ): Promise<TeachingResponse> {
    try {
      // Analyze context and determine musical focus
      const context = await this.determineMusicalContext(studentInput, audioAnalysis);

      // Generate teaching response based on context
      return await this.generateTeachingResponse(context);
    } catch (error) {
      console.error("Error analyzing musical concepts:", error);
      throw error;
    }
  }

  private async determineMusicalContext(input: string, analysis: any): Promise<MusicContext> {
    const prompt = `
      Analyze this musical interaction:
      Student input: "${input}"
      Musical analysis: ${JSON.stringify(analysis)}

      Determine:
      1. Musical genre and style
      2. Key theoretical concepts involved
      3. Student's apparent skill level (1-10)
      4. Areas needing clarification
    `;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a music theory expert analyzing student interactions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Parse OpenAI response into structured context
    const response = completion.choices[0].message.content;
    return this.parseContextFromResponse(response || "");
  }

  private async generateTeachingResponse(context: MusicContext): Promise<TeachingResponse> {
    const prompt = `
      Create a teaching response for a student with the following context:
      Genre: ${context.genre}
      Style: ${context.style}
      Concepts: ${context.theoryConcepts.join(", ")}
      Skill Level: ${context.difficulty}/10

      Include:
      1. A clear explanation
      2. Practical suggestions
      3. Next concepts to explore
    `;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a patient and knowledgeable music teacher.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const response = completion.choices[0].message.content || "";
    return this.parseTeachingResponse(response);
  }

  private parseContextFromResponse(response: string): MusicContext {
    // Simple parsing for now - in real implementation, would be more robust
    return {
      genre: "jazz",
      style: "modern",
      theoryConcepts: ["rhythm", "harmony"],
      difficulty: 5,
    };
  }

  private parseTeachingResponse(response: string): TeachingResponse {
    // Simple parsing for now - in real implementation, would be more robust
    return {
      explanation: response,
      suggestions: ["Practice with a metronome", "Study chord progressions"],
      nextConcepts: ["Advanced harmony", "Complex rhythms"],
    };
  }
}
