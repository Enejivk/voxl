import z from 'zod';
import { Module, Store, schema } from 'modelence/server';
import { generateText } from '@modelence/ai';

// Store to track global daily content generation usage (shared by all users)
const dbGlobalUsage = new Store('globalUsage', {
  schema: {
    date: schema.string(), // YYYY-MM-DD format for daily tracking
    count: schema.number(),
  },
  indexes: [
    { key: { date: 1 }, unique: true },
  ],
});

const GLOBAL_DAILY_LIMIT = 200;

// Helper to check and increment global usage
async function checkAndIncrementGlobalUsage(): Promise<void> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Find or create global usage record for today
  const existingUsage = await dbGlobalUsage.findOne({ date: today });

  if (existingUsage) {
    if (existingUsage.count >= GLOBAL_DAILY_LIMIT) {
      throw new Error(`Daily app limit reached. The app can generate up to ${GLOBAL_DAILY_LIMIT} posts per day. Try again tomorrow.`);
    }
    // Increment the count
    await dbGlobalUsage.updateOne(
      { _id: existingUsage._id },
      { $inc: { count: 1 } }
    );
  } else {
    // Create new usage record for today
    await dbGlobalUsage.insertOne({
      date: today,
      count: 1,
    });
  }
}

// Helper to get current global usage
async function getGlobalUsage(): Promise<{ used: number; limit: number; remaining: number }> {
  const today = new Date().toISOString().split('T')[0];
  const existingUsage = await dbGlobalUsage.findOne({ date: today });
  const used = existingUsage?.count || 0;

  return {
    used,
    limit: GLOBAL_DAILY_LIMIT,
    remaining: Math.max(0, GLOBAL_DAILY_LIMIT - used),
  };
}

const writingStyleRules = `
CRITICAL RULES YOU MUST FOLLOW:

1. PRESERVE THE USER'S VOICE: Read their text carefully. Notice how they talk, their word choices, their vibe. Keep that. Don't rewrite them into someone else.

2. NO PITCH TONE: This is NOT a sales pitch, ad copy, or marketing material. It's just a person sharing something. No hype. No trying to sell anything. Just talking.

3. ABSOLUTELY NO em-dashes (—) or en-dashes (–) anywhere. Use commas, periods, or "and" instead.

4. BANNED WORDS AND PHRASES - never use these:
   - AI words: "delve", "dive into", "unleash", "unlock", "embark", "journey", "realm", "landscape", "paradigm", "leverage", "utilize", "elevate", "empower", "foster", "robust", "seamless", "cutting-edge", "game-changer", "revolutionary", "navigate", "tapestry", "holistic", "synergy", "ecosystem"
   - Hype words: "supercharge", "skyrocket", "transform", "powerful", "amazing", "incredible", "awesome"
   - Pitch phrases: "imagine", "picture this", "let's be honest", "here's the thing", "in today's world", "at the end of the day", "the truth is", "I'm excited to share", "I'm thrilled", "proud to announce"

5. Keep it conversational. Like texting a friend or talking over coffee. Not performing for an audience.

6. Short sentences. Simple words. No trying to sound smart.

7. Sound like a real person having a thought, not an influencer trying to go viral.
`;

const tonePrompts: Record<string, string> = {
  storytelling: `Reshape this into a {platform} post that shares what happened. Keep the user's natural way of talking. Just tell the thing that happened, why it mattered, what came out of it. No dramatic buildup. No "lessons learned" framing. Just share it like you're catching up with someone.`,

  emotional: `Reshape this into a {platform} post that feels real. Keep the user's voice. If they're frustrated, let that come through. If they're happy, same. Don't polish the emotion into something generic. Just let them say what they're feeling in their own way.`,

  thought_leadership: `Reshape this into a {platform} post where the user shares what they think. Keep their perspective and voice. Not preaching. Not teaching. Just "here's something I noticed" or "here's what I've been thinking about". Like they're sharing an observation with a friend.`,

  curiosity: `Reshape this into a {platform} post. Start with a bold first line that makes people disagree or react, something that sounds wrong at first so they have to keep reading. Then explain. Keep the user's voice throughout. Make people curious, not with tricks, but because the take is genuinely interesting.`,

  inspirational: `Reshape this into a {platform} post that might encourage someone. Keep the user's voice. No motivational speaker energy. No "you got this" generic stuff. Just share something real that might help someone else feel less alone or more hopeful. Understated, not loud.`,
};

const platformRules: Record<string, string> = {
  x: `
Rules for X (Twitter):
- Under 280 characters. This is a must.
- 1-2 hashtags max
- Make it snappy
- NO dashes of any kind (use commas instead)
- Return ONLY the post text, nothing else`,

  linkedin: `
Rules for LinkedIn:
- Break it up with line breaks so it's easy to skim
- End with a question or call to action
- 3-5 hashtags at the bottom
- Around 150-300 words
- NO dashes of any kind (use commas instead)
- Return ONLY the post text, nothing else`,

  email: `
Rules for Email:
- Casual but professional tone
- Clear and to the point
- Normal greeting and sign-off
- NO dashes of any kind (use commas instead)
- Return ONLY the email body, nothing else`,
};

export default new Module('content', {
  stores: [dbGlobalUsage],

  queries: {
    getUsage: async () => {
      return await getGlobalUsage();
    },
  },

  mutations: {
    formatForX: async (args: unknown) => {
      const { text } = z.object({
        text: z.string(),
      }).parse(args);

      // Check global rate limit before generating
      await checkAndIncrementGlobalUsage();

      const result = await generateText({
        provider: 'openai',
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `${writingStyleRules}

Take the user's thoughts and reshape them for X (Twitter). Keep their voice and how they naturally express things.

Rules:
- Under 280 characters
- Keep their words and style as much as possible
- 1-2 hashtags only if they fit naturally (skip if forced)
- No emojis unless the user used them
- Don't make it sound like marketing
- Return ONLY the post text, nothing else`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
      });

      return { formattedText: result.text };
    },

    formatForLinkedIn: async (args: unknown) => {
      const { text } = z.object({
        text: z.string(),
      }).parse(args);

      // Check global rate limit before generating
      await checkAndIncrementGlobalUsage();

      const result = await generateText({
        provider: 'openai',
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `${writingStyleRules}

Take the user's thoughts and reshape them for LinkedIn. Keep their voice. Don't turn them into a LinkedIn influencer.

Rules:
- Keep their natural way of talking
- Use line breaks so it's easy to read
- Around 150-300 words
- 2-4 hashtags at the bottom only if relevant
- No emojis unless the user's tone calls for it
- Don't add fake questions at the end just for engagement
- Don't start with "I" if you can help it
- Return ONLY the post text, nothing else`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
      });

      return { formattedText: result.text };
    },

    regenerateWithTone: async (args: unknown) => {
      const { text, platform, tone } = z.object({
        text: z.string(),
        platform: z.enum(['x', 'linkedin', 'email']),
        tone: z.enum(['storytelling', 'emotional', 'thought_leadership', 'curiosity', 'inspirational']),
      }).parse(args);

      // Check global rate limit before generating
      await checkAndIncrementGlobalUsage();

      const platformName = platform === 'x' ? 'X (Twitter)' : platform === 'linkedin' ? 'LinkedIn' : 'Email';
      const tonePrompt = tonePrompts[tone].replace('{platform}', platformName);
      const rules = platformRules[platform];

      const result = await generateText({
        provider: 'openai',
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `${writingStyleRules}

${tonePrompt}
${rules}`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
      });

      return { formattedText: result.text };
    },

    adjustLength: async (args: unknown) => {
      const { text, platform, action } = z.object({
        text: z.string(),
        platform: z.enum(['x', 'linkedin', 'email']),
        action: z.enum(['increase', 'decrease']),
      }).parse(args);

      // Check global rate limit before generating
      await checkAndIncrementGlobalUsage();

      const platformName = platform === 'x' ? 'X (Twitter)' : platform === 'linkedin' ? 'LinkedIn' : 'Email';

      const lengthPrompt = action === 'increase'
        ? `Take this ${platformName} post and make it longer. Add more detail, examples, or context while keeping the same message and tone. Expand on the ideas but keep it natural and engaging.`
        : `Take this ${platformName} post and make it shorter. Keep the core message but cut out extra words. Make it more punchy and direct. Remove fluff.`;

      const platformLengthRules: Record<string, string> = {
        x: action === 'increase'
          ? `Keep it under 280 characters still, but use more of the available space.`
          : `Make it as short as possible while keeping the message clear. Aim for under 150 characters.`,
        linkedin: action === 'increase'
          ? `Expand to around 300-500 words. Add more depth and examples.`
          : `Cut it down to around 100-150 words. Keep only the essential points.`,
        email: action === 'increase'
          ? `Add more detail and context. Make it more thorough.`
          : `Make it brief and to the point. Cut unnecessary sentences.`,
      };

      const result = await generateText({
        provider: 'openai',
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `${writingStyleRules}

${lengthPrompt}

${platformLengthRules[platform]}

Return ONLY the adjusted post, nothing else.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
      });

      return { formattedText: result.text };
    },
  },
});
