import OpenAI from 'openai';

export class OpenAIService {
  private client: OpenAI;
  private systemPrompt: string;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey: apiKey,
    });

    this.systemPrompt = `You are an AI music teacher at the Modern Jazz Institute. You are knowledgeable about:
- Music theory (jazz harmony, scales, modes)
- Jazz improvisation techniques
- Rhythm and timing
- Practice methods and exercises
- Music history and jazz styles

Keep your responses focused on music education and provide specific, actionable advice.
When discussing theory concepts, use clear examples and relate them to practical applications.`;
  }

  async generateResponse(message: string, context?: any): Promise<string> {
    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: message }
      ];

      if (context) {
        messages.push({
          role: 'system',
          content: `Current musical context: ${JSON.stringify(context)}`
        });
      }

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.';
    } catch (error) {
      console.error('Error generating OpenAI response:', error);
      throw error;
    }
  }
}
