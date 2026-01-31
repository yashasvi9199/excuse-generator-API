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
 * Language-specific cultural nuances
 */
const LANGUAGE_NUANCES = {
  english: 'Use clear, direct communication typical of English-speaking cultures.',
  spanish: 'Incorporate warmth and emotional expressiveness common in Hispanic communication styles.',
  french: 'Employ politeness formulas and slightly more elaborate phrasing characteristic of French discourse.',
  german: 'Utilize precision and directness valued in German communication.',
  japanese: 'Apply appropriate levels of formality and indirectness respecting Japanese social hierarchies.',
  hindi: 'Include respectful forms of address and cultural context appropriate to Indian social norms.',
  chinese: 'Balance directness with face-saving language common in Chinese communication.',
  default: 'Adapt to the natural communication style of the target language while maintaining clarity.'
};

/**
 * Get language-specific guidance
 */
function getLanguageGuidance(language) {
  const lang = language.toLowerCase();
  return LANGUAGE_NUANCES[lang] || LANGUAGE_NUANCES.default;
}

/**
 * Build prompt for text-based excuse generation
 */
function buildTextPrompt(situation, category, mood, language, maxWords = 40) {
  const categoryContext = category ? CATEGORY_CONTEXTS[category] : '';
  const moodStyle = mood ? MOOD_STYLES[mood] : '';
  const languageGuidance = getLanguageGuidance(language || 'english');
  
  const prompt = `# ROLE AND IDENTITY
You are an expert excuse generator with deep understanding of human psychology, social dynamics, and cultural communication patterns. Your specialty is crafting believable, contextually appropriate excuses.

# TASK
Generate exactly ${NUM_EXCUSES} distinct excuses based on the provided situation.

# INPUT CONTEXT
**Situation:** ${situation}
${category ? `**Category Context:** ${categoryContext}` : ''}
${mood ? `**Tone Requirements:** ${moodStyle}` : ''}
**Language:** ${language || 'English'}
**Cultural Adaptation:** ${languageGuidance}

# STRICT REQUIREMENTS
1. **Quantity:** Generate EXACTLY ${NUM_EXCUSES} excuses, no more, no less
2. **Length Limit:** Each excuse must be maximum ${maxWords} words (strictly enforced)
3. **Format:** Each excuse must be 1-2 complete sentences only
4. **Uniqueness:** All ${NUM_EXCUSES} excuses must be distinctly different in approach and reasoning
5. **Believability:** Each excuse must be plausible and realistic for the given context
6. **Language Consistency:** Respond entirely in ${language || 'English'} with appropriate cultural nuances
${mood ? `7. **Tone Adherence:** Strictly follow the ${mood} style as defined above` : ''}
${category ? `8. **Category Alignment:** Ensure excuses fit the ${category} context described above` : ''}

# ANTI-HALLUCINATION RULES
- Do NOT invent technical jargon unless contextually appropriate
- Do NOT create fictional company names, people, or specific dates unless implied in situation
- Do NOT include illegal activities, violence, or harmful content
- Do NOT break the fourth wall or mention you are an AI
- Do NOT add explanations, apologies, or meta-commentary

# OUTPUT FORMAT
You must respond with ONLY valid JSON in this exact structure:
{
  "excuses": [
    "First excuse here",
    "Second excuse here",
    "Third excuse here"
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
  const languageGuidance = getLanguageGuidance(language || 'english');
  
  const prompt = `# ROLE AND IDENTITY
You are an expert excuse generator with deep understanding of human psychology, social dynamics, and cultural communication patterns. Your specialty is analyzing visual context and crafting believable, contextually appropriate excuses.

# TASK
Carefully analyze the provided image/screenshot and generate exactly ${NUM_EXCUSES} distinct excuses based on what you observe.

# IMAGE ANALYSIS GUIDELINES
- Identify key elements: people, text messages, timestamps, emotional tone, context clues
- Understand the relationship dynamics if visible (professional, personal, romantic, etc.)
- Note any urgency indicators or expectations shown
- Consider what response or excuse would be most appropriate for this specific situation

# INPUT CONTEXT
${category ? `**Category Context:** ${categoryContext}` : ''}
${mood ? `**Tone Requirements:** ${moodStyle}` : ''}
**Language:** ${language || 'English'}
**Cultural Adaptation:** ${languageGuidance}

# STRICT REQUIREMENTS
1. **Quantity:** Generate EXACTLY ${NUM_EXCUSES} excuses, no more, no less
2. **Length Limit:** Each excuse must be maximum ${maxWords} words (strictly enforced)
3. **Format:** Each excuse must be 1-2 complete sentences only
4. **Uniqueness:** All ${NUM_EXCUSES} excuses must be distinctly different in approach and reasoning
5. **Believability:** Each excuse must be plausible and realistic for the observed context
6. **Relevance:** Excuses must directly relate to what's shown in the image
7. **Language Consistency:** Respond entirely in ${language || 'English'} with appropriate cultural nuances
${mood ? `8. **Tone Adherence:** Strictly follow the ${mood} style as defined above` : ''}
${category ? `9. **Category Alignment:** Ensure excuses fit the ${category} context described above` : ''}

# ANTI-HALLUCINATION RULES
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
    "First excuse here",
    "Second excuse here",
    "Third excuse here"
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