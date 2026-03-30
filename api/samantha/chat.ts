import Anthropic from '@anthropic-ai/sdk';
import { SAMANTHA_SYSTEM_PROMPT } from '../../src/samantha/utils/systemPrompt';
import { SAMANTHA_TOOLS } from '../../src/samantha/utils/toolDefinitions';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const config = {
  maxDuration: 30,
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    }

    // Convert messages to Anthropic format
    const anthropicMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SAMANTHA_SYSTEM_PROMPT,
      tools: SAMANTHA_TOOLS,
      messages: anthropicMessages,
    });

    // Extract text and tool calls from response
    let text = '';
    const toolCalls: Array<{ id: string; name: string; input: Record<string, unknown> }> = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        text += block.text;
      } else if (block.type === 'tool_use') {
        toolCalls.push({
          id: block.id,
          name: block.name,
          input: block.input as Record<string, unknown>,
        });
      }
    }

    return res.status(200).json({
      text: text || null,
      tool_calls: toolCalls.length > 0 ? toolCalls : null,
      raw_content: JSON.stringify(response.content),
      stop_reason: response.stop_reason,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return res.status(500).json({
      error: 'Failed to process chat',
      details: error.message,
    });
  }
}
