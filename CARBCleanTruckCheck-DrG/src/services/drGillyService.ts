/**
 * Dr. Gilly AI Service
 * Connects to dr-gilly-ai-service Cloud Run backend
 * Powered by Vertex AI (Gemini)
 */

const DR_GILLY_API_URL = process.env.EXPO_PUBLIC_DR_GILLY_API_URL || 'https://YOUR_DR_GILLY_SERVICE_URL';

interface DrGillyMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface DrGillyChatResponse {
  response: string;
  context?: string;
  references?: string[];
}

class DrGillyService {
  private apiUrl: string;
  private conversationId?: string;

  constructor(apiUrl: string = DR_GILLY_API_URL) {
    this.apiUrl = apiUrl;
  }

  /**
   * Send a message to Dr. Gilly
   * Backed by Vertex AI Gemini model
   */
  async chat(
    message: string,
    conversationHistory?: DrGillyMessage[]
  ): Promise<DrGillyChatResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversation_id: this.conversationId,
          history: conversationHistory,
          context: {
            role: 'CARB compliance expert',
            expertise: [
              'California Air Resources Board regulations',
              'Diesel emissions testing',
              'Heavy-duty vehicle compliance',
              'Mobile testing procedures',
            ],
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Dr. Gilly API error: ${response.status}`);
      }

      const data = await response.json();

      // Store conversation ID for context continuity
      if (data.conversation_id) {
        this.conversationId = data.conversation_id;
      }

      return {
        response: data.response || data.message,
        context: data.context,
        references: data.references,
      };
    } catch (error) {
      console.error('Dr. Gilly Service Error:', error);
      throw error;
    }
  }

  /**
   * Analyze a VIN with Dr. Gilly's expertise
   */
  async analyzeVIN(vin: string): Promise<DrGillyChatResponse> {
    return this.chat(
      `Analyze this VIN for CARB compliance: ${vin}. Provide details about the vehicle type, applicable regulations, and testing requirements.`
    );
  }

  /**
   * Analyze vehicle photos for compliance issues
   * Uses Vertex AI Vision capabilities
   */
  async analyzePhotos(photoUrls: string[]): Promise<DrGillyChatResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/analyze-photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photos: photoUrls,
          analysis_type: 'emissions_compliance',
        }),
      });

      if (!response.ok) {
        throw new Error(`Photo analysis error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Photo Analysis Error:', error);
      throw error;
    }
  }

  /**
   * Get quick CARB compliance tips
   */
  async getQuickTip(): Promise<string> {
    const response = await this.chat(
      'Give me a quick CARB compliance tip for diesel truck operators in one sentence.'
    );
    return response.response;
  }

  /**
   * Reset conversation context
   */
  resetConversation() {
    this.conversationId = undefined;
  }
}

export const drGilly = new DrGillyService();
