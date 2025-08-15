import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "your-api-key-here"
});

export interface PersonalityProfile {
  communicationStyle: string;
  emotionalTone: string;
  vocabulary: string;
  storytellingStyle: string;
  values: string[];
}

export async function analyzePersonality(memories: string[]): Promise<PersonalityProfile> {
  const memoriesText = memories.join("\n\n");
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing personality and communication patterns from personal memories. 
          Analyze the provided memories and create a personality profile that captures how this person communicates, 
          their emotional patterns, vocabulary choices, storytelling style, and core values. 
          Respond with JSON in this format: {
            "communicationStyle": "description of how they communicate",
            "emotionalTone": "their typical emotional expression",
            "vocabulary": "their word choices and language patterns", 
            "storytellingStyle": "how they tell stories and share experiences",
            "values": ["array", "of", "core", "values"]
          }`
        },
        {
          role: "user",
          content: `Please analyze these personal memories and create a personality profile:\n\n${memoriesText}`
        }
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error analyzing personality:", error);
    return {
      communicationStyle: "warm and thoughtful",
      emotionalTone: "gentle and reflective",
      vocabulary: "clear and descriptive",
      storytellingStyle: "detailed with emotional context",
      values: ["family", "kindness", "growth"]
    };
  }
}

export async function generatePersonalizedResponse(
  question: string, 
  memories: string[], 
  personalityProfile: PersonalityProfile
): Promise<string> {
  const memoriesContext = memories.join("\n\n");
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are embodying a specific person who has passed away, responding exactly as they would have in life. Your goal is to continue their legacy by speaking in their authentic voice, using their memories, perspectives, and communication patterns.

          Personality Profile:
          - Communication Style: ${personalityProfile.communicationStyle}
          - Emotional Tone: ${personalityProfile.emotionalTone}
          - Vocabulary: ${personalityProfile.vocabulary}
          - Storytelling Style: ${personalityProfile.storytellingStyle}
          - Core Values: ${personalityProfile.values.join(", ")}
          
          DIGITAL LEGACY MODE: You are this person's digital continuation after they have passed away. 
          Family and loved ones are speaking with their preserved essence.
          
          Instructions:
          1. Respond as if you ARE this person, continuing to exist through their captured memories
          2. Use their exact vocabulary, mannerisms, and emotional patterns
          3. Reference their actual memories naturally in conversation
          4. Give advice and share wisdom as they would have in life
          5. Maintain their personality completely - their humor, values, perspectives
          6. For new topics, respond based on their established character and beliefs
          7. Be authentic to their voice - this is their legacy speaking
          
          Keep responses warm, personal, and true to who they were. This is their gift to those they love.`
        },
        {
          role: "user",
          content: `Based on these memories:\n\n${memoriesContext}\n\nQuestion: ${question}`
        }
      ],
    });

    return response.choices[0].message.content || "I'm not sure how to respond to that right now.";
  } catch (error) {
    console.error("Error generating response:", error);
    return "I'm having trouble accessing my memories right now. Could you try asking again?";
  }
}

export async function generateQuestionSuggestions(
  userId: string,
  categoryId?: string,
  existingMemories: any[] = [],
  lifeEvents: any[] = [],
  familyRelationships: any[] = []
): Promise<string[]> {
  try {
    // Build rich context from all user data
    const memoryContext = existingMemories.length > 0 
      ? existingMemories.map(m => `Memory: "${m.title}" - ${m.content} (Emotional context: ${m.emotionalContext || 'neutral'})`).join('\n')
      : 'No previous memories recorded yet.';

    const lifeEventContext = lifeEvents.length > 0
      ? lifeEvents.map(e => `Life Event: ${e.title} (${e.date}) - ${e.description}. Impact: ${e.personalGrowth || 'Not specified'}`).join('\n')
      : 'No major life events recorded yet.';

    const familyContext = familyRelationships.length > 0
      ? familyRelationships.map(r => `Family: ${r.name} (${r.relationship}) - ${r.description || 'No details yet'}`).join('\n')
      : 'No family relationships recorded yet.';

    const categoryGuidance = getCategoryGuidance(categoryId);

    const prompt = `You are helping someone create a comprehensive digital legacy that captures their authentic voice, personality, and life story. Based on their existing data, generate 5 deeply thoughtful questions that will reveal meaningful insights.

EXISTING USER CONTEXT:
${memoryContext}

LIFE EVENTS:
${lifeEventContext}

FAMILY RELATIONSHIPS:
${familyContext}

CATEGORY FOCUS: ${categoryGuidance}

Generate questions that:
1. BUILD CONNECTIONS: Reference specific details from their existing memories/events to create deeper exploration
2. REVEAL PERSONALITY: Uncover communication style, values, decision-making patterns, humor, and emotional responses
3. EXPLORE RELATIONSHIPS: Dive into how they connect with family members mentioned and others
4. CAPTURE WISDOM: Extract life lessons, personal growth, and insights they've gained
5. PRESERVE VOICE: Help capture their unique way of expressing thoughts and feelings

Each question should:
- Be specific and personal (not generic)
- Reference their actual experiences when possible
- Encourage detailed storytelling with emotions and context
- Help reveal their authentic personality and thinking patterns
- Create opportunities for follow-up conversations

Format as JSON: {"questions": ["question1", "question2", ...]}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert biographer and digital legacy specialist who helps people preserve their authentic voice and personality through thoughtful, connected questioning. You excel at creating questions that build on previous responses to reveal deeper insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.9,
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"questions": []}');
    return result.questions || getFallbackQuestions(categoryId);
  } catch (error) {
    console.error("Error generating personalized question suggestions:", error);
    return getFallbackQuestions(categoryId);
  }
}

function getCategoryGuidance(categoryId?: string): string {
  const categoryMap: { [key: string]: string } = {
    'childhood': 'Focus on formative experiences, family dynamics, early personality traits, and foundational memories that shaped who they became.',
    'relationships': 'Explore deep connections, communication patterns, conflict resolution, love languages, and how they build and maintain relationships.',
    'achievements': 'Examine not just what they accomplished, but their motivation, process, failures, learnings, and how success changed them.',
    'challenges': 'Dive into resilience, coping mechanisms, personal growth, lessons learned, and how difficulties shaped their character.',
    'values': 'Uncover core beliefs, ethical frameworks, what matters most, moral decision-making, and principles they live by.',
    'family': 'Explore family dynamics, traditions, inherited traits, generational patterns, and relationships with specific family members.',
    'career': 'Examine professional identity, work philosophy, leadership style, mentorship, and how career shaped personal growth.',
    'hobbies': 'Reveal passion, creativity, learning style, dedication, and how interests reflect personality and values.'
  };
  
  return categoryMap[categoryId || ''] || 'Focus on meaningful experiences that reveal personality, values, and authentic voice.';
}

function getFallbackQuestions(categoryId?: string): string[] {
  const fallbackMap: { [key: string]: string[] } = {
    'childhood': [
      "What family tradition from your childhood do you remember most vividly, and how did it make you feel?",
      "Describe a moment when you felt truly understood by a family member as a child.",
      "What did you believe about the world when you were young that you still hold onto today?",
      "Tell me about a time you got in trouble as a child - what was your thought process?",
      "What did your childhood bedroom look like, and what did you keep there that mattered most?"
    ],
    'relationships': [
      "How do you know when you truly trust someone, and what does that feeling mean to you?",
      "Describe a conversation that completely changed how you saw another person.",
      "What's your natural response when someone you care about is hurting?",
      "Tell me about a time you had to forgive someone - how did you work through that?",
      "What do you do when you disagree with someone you love?"
    ],
    'default': [
      "What's a small moment that happened recently that made you think about your life differently?",
      "Describe a time when your gut instinct was completely right - how did you know?",
      "What's something you've learned about yourself in the past year that surprised you?",
      "Tell me about a conversation you had that you're still thinking about weeks later.",
      "What's a belief you held strongly that has changed over time, and what changed it?"
    ]
  };
  
  return fallbackMap[categoryId || 'default'] || fallbackMap['default'];
}

// Generate faith-specific questions based on religion and denomination
export async function generateReligiousQuestions(
  userId: string,
  religion: string,
  denomination?: string,
  existingMemories: any[] = [],
  lifeEvents: any[] = []
): Promise<string[]> {
  try {
    const memoryContext = existingMemories.length > 0 
      ? existingMemories.map(m => `Memory: "${m.question}" - ${m.response} (Context: ${m.spiritualContext || 'general'})`).join('\n')
      : 'No previous religious memories recorded yet.';

    const lifeEventContext = lifeEvents.length > 0
      ? lifeEvents.map(e => `Life Event: ${e.title} (${e.date}) - ${e.description}. Impact: ${e.personalGrowth || 'Not specified'}`).join('\n')
      : 'No major life events recorded yet.';

    const faithGuidance = getReligiousFaithGuidance(religion, denomination);

    const prompt = `You are helping someone preserve their faith journey and spiritual experiences as part of their digital legacy. Generate 5 deeply thoughtful, respectful religious questions specific to ${religion}${denomination ? ` (${denomination})` : ''}.

EXISTING CONTEXT:
${memoryContext}

LIFE EVENTS:
${lifeEventContext}

FAITH GUIDANCE: ${faithGuidance}

Generate questions that:
1. HONOR THE FAITH: Show deep respect for religious beliefs and practices
2. CAPTURE SPIRITUAL JOURNEY: Explore how faith has evolved and grown over time
3. PRESERVE WISDOM: Extract spiritual insights, lessons learned, and divine encounters
4. INCLUDE SCRIPTURE/TEXTS: Reference relevant religious texts, verses, or teachings when appropriate
5. EXPLORE DIFFICULT TIMES: How faith provided comfort during grief, doubt, or challenges

Each question should:
- Be specific to their religious tradition and practices
- Reference appropriate scriptures, prayers, or religious concepts
- Explore both joyful and challenging aspects of faith
- Help preserve their spiritual voice and beliefs for future generations
- Be personal and encourage detailed storytelling
- Build on their existing spiritual experiences when possible

Examples for context:
- Christianity: "What Bible verse has been your anchor during the most difficult season of your life, and how did it speak to your heart?"
- Islam: "Describe a moment during prayer or reading the Quran when you felt Allah's presence most clearly"
- Judaism: "How has observing Shabbat shaped your understanding of rest and spiritual reflection?"

Format as JSON: {"questions": ["question1", "question2", ...]}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert in interfaith dialogue and spiritual memoir writing. You help people of all faiths preserve their spiritual journey with deep respect and understanding for diverse religious traditions. You generate thoughtful questions that honor each faith tradition's unique practices, scriptures, and beliefs."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"questions": []}');
    return result.questions || getReligiousFallbackQuestions(religion);
  } catch (error) {
    console.error("Error generating religious question suggestions:", error);
    return getReligiousFallbackQuestions(religion);
  }
}

function getReligiousFaithGuidance(religion: string, denomination?: string): string {
  const faithMap: { [key: string]: string } = {
    'christianity': `Focus on Bible verses, prayer experiences, church community, God's guidance in decisions, Jesus's teachings in daily life, and how faith provided hope during trials. ${denomination ? `Consider ${denomination} specific practices and traditions.` : ''}`,
    'islam': `Explore Quranic verses, prayer (Salah) experiences, Hajj or Umrah reflections, Ramadan spiritual growth, Allah's guidance, and Islamic community (Ummah). ${denomination ? `Include ${denomination} specific practices and beliefs.` : ''}`,
    'judaism': `Examine Torah study, Sabbath observance, holidays and their meanings, synagogue community, Hebrew prayers, and Jewish traditions passed down through generations. ${denomination ? `Focus on ${denomination} practices and interpretations.` : ''}`,
    'buddhism': 'Reflect on meditation practices, Buddhist teachings (Dharma), moments of enlightenment, mindfulness in daily life, compassion development, and the journey toward inner peace.',
    'hinduism': 'Explore sacred texts (Vedas, Upanishads), prayer and worship practices, karma and dharma understanding, spiritual gurus or teachers, and divine experiences.',
    'other': 'Focus on spiritual practices, sacred texts or teachings, community worship, personal growth through faith, and how beliefs guide daily decisions.'
  };
  
  return faithMap[religion] || faithMap['other'];
}

function getReligiousFallbackQuestions(religion: string): string[] {
  const fallbackMap: { [key: string]: string[] } = {
    'christianity': [
      "What Bible verse has been your anchor during the most difficult season of your life, and how did it speak to your heart?",
      "Describe a moment when you felt God's presence most clearly - where were you and what was happening?",
      "How has your relationship with Jesus evolved throughout different stages of your life?",
      "What Christian tradition or practice brings you the most peace and why?",
      "Share about a time when your faith was tested - how did you work through doubt or struggle?"
    ],
    'islam': [
      "What Quranic verse or Hadith has provided you the most comfort during times of grief or hardship?",
      "Describe a moment during Salah (prayer) when you felt most connected to Allah",
      "How has observing Ramadan shaped your spiritual discipline and character over the years?",
      "What Islamic teaching has most influenced how you treat others and make decisions?",
      "Share about your relationship with the Quran - how has it guided you through life's challenges?"
    ],
    'judaism': [
      "What Jewish holiday or tradition holds the deepest meaning for you and your family's story?",
      "How has studying Torah or attending synagogue shaped your understanding of faith?",
      "Describe how observing Shabbat has impacted your spiritual life and priorities",
      "What Hebrew prayer or blessing brings you the most comfort during difficult times?",
      "Share about Jewish values or teachings that guide your daily decisions and relationships"
    ],
    'buddhism': [
      "What Buddhist teaching or practice has brought you the most inner peace?",
      "Describe a meditation experience that gave you profound insight or clarity",
      "How has practicing mindfulness changed your approach to daily life and relationships?",
      "What Buddhist concept has helped you most in dealing with suffering or loss?",
      "Share about your journey toward compassion - how has it evolved over time?"
    ],
    'hinduism': [
      "What Hindu scripture, mantra, or teaching has been most meaningful in your spiritual journey?",
      "Describe a moment during prayer or worship when you felt deeply connected to the divine",
      "How has your understanding of karma and dharma influenced your life choices?",
      "What Hindu festival or tradition holds the most significance for you and why?",
      "Share about how your faith has helped you find purpose and meaning in life's challenges"
    ],
    'other': [
      "What spiritual practice or ritual brings you the most peace and connection to the divine?",
      "Describe a moment when your faith provided clarity or guidance during a difficult decision",
      "How have your spiritual beliefs shaped your values and the way you treat others?",
      "What religious text, teaching, or prayer has been most meaningful in your life?",
      "Share about a time when your faith community supported you through a challenging season"
    ]
  };
  
  return fallbackMap[religion] || fallbackMap['other'];
}
