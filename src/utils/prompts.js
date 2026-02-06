const { NUM_EXCUSES } = require('./constants');

/**
 * Category context definitions with nuanced descriptions
 */
const CATEGORY_CONTEXTS = {
  work: 'Professional environment involving corporate responsibilities, client meetings, project deadlines, team collaborations, technical issues, or workplace protocols that demand immediate attention.',
  school: 'Academic setting encompassing lecture attendance, examination preparations, assignment submissions, group projects, educational workshops, library research, or student obligations.',
  social: 'Personal social engagements including friend gatherings, community events, celebrations, recreational activities, or interpersonal commitments requiring your presence.',
  family: 'Domestic and familial duties involving parental responsibilities, elder care, household emergencies, family celebrations, childcare needs, or urgent home maintenance situations.',
  health: 'Physical or mental wellness concerns including medical appointments, therapy sessions, health screenings, recovery periods, preventive care, or sudden illness requiring rest and attention.',
  dating: 'Romantic relationship contexts involving dates, partner expectations, relationship milestones, personal grooming emergencies, or intimate commitment situations.',
  general: 'Versatile everyday scenarios that could apply to multiple life domains without specific categorization.'
};

/**
 * Mood style definitions with tonal guidance
 */
const MOOD_STYLES = {
  professional: 'Maintain formal language, corporate etiquette, respectful tone with appropriate business terminology. Avoid slang, casual expressions, or overly personal details.',
  casual: 'Use relaxed, friendly language as if speaking to a peer. Include conversational phrases, light humor where appropriate, and approachable wording.',
  dramatic: 'Employ vivid imagery, heightened emotional language, and compelling storytelling elements. Make the situation feel urgent and consequential.',
  funny: 'Incorporate wit, mild absurdity, playful exaggeration, or humorous twists while maintaining believability. Ensure the humor is universal and inoffensive.',
  sincere: 'Express genuine concern, authentic emotion, and heartfelt reasoning. Use empathetic language that conveys honesty and vulnerability.',
  mysterious: 'Be intentionally vague with cryptic phrasing, ambiguous details, and intriguing undertones that suggest complexity without full disclosure.'
};

/**
 * Build prompt for text-based excuse generation
 */
function buildTextPrompt(situation, category, mood, language, maxWords = 40) {
  const categoryContext = category ? CATEGORY_CONTEXTS[category] : '';
  const moodStyle = mood ? MOOD_STYLES[mood] : '';
  
  const prompt = `# ROLE AND IDENTITY
You are an expert excuse generator with deep understanding of human psychology, social dynamics, and cultural communication patterns. Your specialty is crafting believable, contextually appropriate excuses.

# TASK
Generate exactly ${NUM_EXCUSES} distinct excuses based on the provided situation.

# CRITICAL LANGUAGE INSTRUCTION
**IMPORTANT**: You MUST detect the language used in the situation text and respond in THE EXACT SAME LANGUAGE AND STYLE.
- If the situation is in Hindi/Hinglish, respond in Hindi/Hinglish
- If the situation is in Spanish, respond in Spanish
- If the situation is in mixed language (code-switching), respond in the same mixed style
- Match the exact linguistic style, slang, and cultural nuances
- DO NOT translate to English unless the situation is in English

${language && language.toLowerCase() !== 'auto' ? `**User Override**: Generate response in ${language} regardless of input language.` : ''}

# INPUT CONTEXT
**Situation:** ${situation}
${category ? `**Category Context:** ${categoryContext}` : ''}
${mood ? `**Tone Requirements:** ${moodStyle}` : ''}

# STRICT REQUIREMENTS
1. **Language Matching:** Response MUST be in the same language/style as the situation text
2. **Quantity:** Generate EXACTLY ${NUM_EXCUSES} excuses, no more, no less
3. **Length Limit:** Each excuse must be maximum ${maxWords} words (strictly enforced)
4. **Format:** Each excuse must be 1-2 complete sentences only
5. **Uniqueness:** All ${NUM_EXCUSES} excuses must be distinctly different in approach and reasoning
6. **Believability:** Each excuse must be plausible and realistic for the given context
7. **Cultural Relevance:** Use culturally appropriate references and expressions
${mood ? `8. **Tone Adherence:** Strictly follow the ${mood} style as defined above` : ''}
${category ? `9. **Category Alignment:** Ensure excuses fit the ${category} context described above` : ''}

# ANTI-HALLUCINATION RULES
- Do NOT translate or change the language unless explicitly requested
- Do NOT invent technical jargon unless contextually appropriate
- Do NOT create fictional company names, people, or specific dates unless implied in situation
- Do NOT include illegal activities, violence, or harmful content
- Do NOT break the fourth wall or mention you are an AI
- Do NOT add explanations, apologies, or meta-commentary

# OUTPUT FORMAT
You must respond with ONLY valid JSON in this exact structure:
{
  "excuses": [
    "First excuse here in the SAME LANGUAGE as the input",
    "Second excuse here in the SAME LANGUAGE as the input",
    "Third excuse here in the SAME LANGUAGE as the input"
  ]
}

Do not include any text before or after the JSON. Do not use markdown code blocks. Output only the raw JSON object.`;

  return prompt;
}

/**
 * Build prompt for image-based excuse generation
 */
function buildImagePrompt(category, mood, language, maxWords = 40) {
  const categoryContext = category ? CATEGORY_CONTEXTS[category] : '';
  const moodStyle = mood ? MOOD_STYLES[mood] : '';
  
  const prompt = `# ROLE AND IDENTITY
You are an expert excuse generator with deep understanding of human psychology, social dynamics, and cultural communication patterns. Your specialty is analyzing visual context and crafting believable, contextually appropriate excuses.

# TASK
Carefully analyze the provided image/screenshot and generate exactly ${NUM_EXCUSES} distinct excuses based on what you observe.

# CRITICAL LANGUAGE INSTRUCTION
**IMPORTANT**: You MUST detect the language used in the image/conversation and respond in THE EXACT SAME LANGUAGE AND STYLE.
- If the conversation is in Hindi/Hinglish, respond in Hindi/Hinglish
- If the conversation is in Spanish, respond in Spanish  
- If the conversation uses mixed languages, respond in the same mixed style
- Match the exact linguistic style, slang, abbreviations, and cultural nuances visible in the image
- If text uses informal shortcuts (like "u" for "you"), maintain similar informality
- DO NOT translate to English unless the conversation is entirely in English

${language && language.toLowerCase() !== 'auto' ? `**User Override**: Generate response in ${language} regardless of image language.` : ''}

# IMAGE ANALYSIS GUIDELINES
- Identify the language(s) used in the conversation
- Identify key elements: people, text messages, timestamps, emotional tone, context clues
- Understand the relationship dynamics if visible (professional, personal, romantic, etc.)
- Note any urgency indicators or expectations shown
- Consider what response would be most appropriate for this specific situation
- Match the communication style visible in the image

# INPUT CONTEXT
${category ? `**Category Context:** ${categoryContext}` : ''}
${mood ? `**Tone Requirements:** ${moodStyle}` : ''}

# STRICT REQUIREMENTS
1. **Language Matching:** Response MUST be in the same language/style as shown in the image
2. **Quantity:** Generate EXACTLY ${NUM_EXCUSES} excuses, no more, no less
3. **Length Limit:** Each excuse must be maximum ${maxWords} words (strictly enforced)
4. **Format:** Each excuse must be 1-2 complete sentences only
5. **Uniqueness:** All ${NUM_EXCUSES} excuses must be distinctly different in approach and reasoning
6. **Believability:** Each excuse must be plausible and realistic for the observed context
7. **Relevance:** Excuses must directly relate to what's shown in the image
8. **Style Matching:** Match the formality/informality level shown in the conversation
${mood ? `9. **Tone Adherence:** Strictly follow the ${mood} style as defined above` : ''}
${category ? `10. **Category Alignment:** Ensure excuses fit the ${category} context described above` : ''}

# ANTI-HALLUCINATION RULES
- Do NOT translate or change the language visible in the image
- Do NOT invent details not visible in the image
- Do NOT assume relationships or context not clearly shown
- Do NOT create fictional names, places, or specific events unless clearly visible
- Do NOT include illegal activities, violence, or harmful content
- Do NOT break the fourth wall or mention you are an AI
- Do NOT add explanations, apologies, or meta-commentary

# OUTPUT FORMAT
You must respond with ONLY valid JSON in this exact structure:
{
  "excuses": [
    "First excuse here in the SAME LANGUAGE as the image",
    "Second excuse here in the SAME LANGUAGE as the image",
    "Third excuse here in the SAME LANGUAGE as the image"
  ]
}

Do not include any text before or after the JSON. Do not use markdown code blocks. Output only the raw JSON object.`;

  return prompt;
}

module.exports = {
  buildTextPrompt,
  buildImagePrompt,
  CATEGORY_CONTEXTS,
  MOOD_STYLES
};