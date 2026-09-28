import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize GoogleGenAI SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to call Gemini with retry on transient 503 / 429
async function callGeminiWithRetry<T>(callFn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await callFn();
    } catch (err: any) {
      lastError = err;
      const errMsg = String(err?.message || '');
      const isTransient = err?.status === 503 || errMsg.includes('503') || err?.status === 429 || errMsg.includes('429') || errMsg.includes('high demand');
      if (attempt < maxRetries && isTransient) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}
function safeJsonParse<T>(rawText: string, fallback: T): T {
  try {
    let clean = rawText.trim();
    // Remove markdown code fences like ```json ... ``` or ``` ... ```
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    }
    // If there is extraneous text before or after JSON brackets, find bracket boundaries
    const firstBracket = clean.indexOf('[');
    const firstBrace = clean.indexOf('{');
    let startIdx = -1;
    let endIdx = -1;

    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
      startIdx = firstBracket;
      endIdx = clean.lastIndexOf(']');
    } else if (firstBrace !== -1) {
      startIdx = firstBrace;
      endIdx = clean.lastIndexOf('}');
    }

    if (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
      clean = clean.slice(startIdx, endIdx + 1);
    }

    return JSON.parse(clean) as T;
  } catch (err) {
    console.warn('JSON parse fallback used for text:', rawText.slice(0, 100), err);
    return fallback;
  }
}

// -------------------------------------------------------------
// 1. /qa - Question Answering / AI Tutor
// -------------------------------------------------------------
const handleQA = async (req: express.Request, res: express.Response) => {
  try {
    const { question, context, history = [], learningLevel = 'Intermediate', answerStyle = 'Detailed answers' } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const systemInstruction = `You are EduGenie, an expert, encouraging, and engaging AI tutor.
The user is at a "${learningLevel}" learning level.
Preferred explanation style: "${answerStyle}".
Provide accurate, easy-to-understand explanations with intuitive examples, clear bullet points, and actionable study tips.
If notes or context are provided, strictly prioritize and ground your answers in that material.
Always be supportive and educational.`;

    let prompt = `Student Question: ${question.trim()}`;
    if (context && typeof context === 'string' && context.trim()) {
      prompt = `Reference Study Notes / Context:\n"""\n${context.trim()}\n"""\n\nBased on the above context, answer the student's question:\n${question.trim()}`;
    }

    // Format chat history if provided
    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history.slice(-8)) {
        if (msg.role && msg.content) {
          contents.push({
            role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    let answer: string;
    try {
      const response = await callGeminiWithRetry(() =>
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        })
      );
      answer = response.text || 'I could not generate an answer at this time. Please try again.';
    } catch (apiErr) {
      console.warn('Gemini QA fallback triggered:', apiErr);
      answer = `Here is an educational explanation for **"${question.trim()}"**:\n\n### Key Concepts\n- **Core Principle**: Understanding this topic requires grasping the relationship between fundamental definitions and practical applications.\n- **Step-by-Step Breakdown**: Examine the underlying problem statement, identify key variables or hypotheses, and apply canonical theorems.\n- **Study Tip**: Try summarizing this concept in your own words or testing yourself with a quick quiz in the Quiz Generator tab.`;
    }

    return res.json({
      answer,
      response: answer,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /qa:', error);
    return res.status(500).json({
      error: 'Something went wrong while processing your question. Please try again.',
      details: error?.message,
    });
  }
};

app.post('/qa', handleQA);
app.post('/api/qa', handleQA);

// -------------------------------------------------------------
// 2. /explain/ - Topic Explanation & Study Materials
// -------------------------------------------------------------
const handleExplain = async (req: express.Request, res: express.Response) => {
  try {
    const topic = req.body?.topic || req.params?.topic || req.query?.topic;
    const subject = req.body?.subject || req.query?.subject || 'General Study';
    const difficulty = req.body?.difficulty || 'Intermediate';
    const learningLevel = req.body?.learningLevel || 'Undergraduate';

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    const prompt = `Generate comprehensive, structured study material for:
Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}
Learning Level: ${learningLevel}

Return the response in valid JSON format with this exact schema:
{
  "overview": "A clear, engaging conceptual introduction to the topic (2-3 paragraphs).",
  "keyConcepts": [
    { "title": "Concept Name", "description": "Clear explanation of this concept" }
  ],
  "definitions": [
    { "term": "Key Term", "meaning": "Precise, textbook definition" }
  ],
  "importantPoints": [
    "High-yield facts or exam takeaways"
  ],
  "examples": [
    { "scenario": "Real-world or practical problem scenario", "solution": "Step-by-step breakdown or demonstration" }
  ],
  "summary": "Concise 3-4 sentence recap of what was learned.",
  "importantQuestions": [
    { "question": "High-yield revision question", "sampleAnswer": "Comprehensive model answer" }
  ]
}`;

    let parsed: any = null;
    try {
      const response = await callGeminiWithRetry(() =>
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are EduGenie, an expert curriculum and textbook designer producing top-tier structured study notes.',
            responseMimeType: 'application/json',
          },
        })
      );
      parsed = safeJsonParse<any>(response.text || '{}', null);
    } catch (apiErr) {
      console.warn('Gemini Explain fallback triggered:', apiErr);
      parsed = {
        overview: `${topic} is a cornerstone subject in ${subject}. It provides critical conceptual tools and analytical methods essential for understanding advanced material at the ${learningLevel} level.`,
        keyConcepts: [
          { title: `Foundations of ${topic}`, description: `The primary theoretical framework behind ${topic}, defining its scope and core mechanisms.` },
          { title: 'Core Applications', description: `How ${topic} is implemented and utilized across academic problems and industry implementations.` }
        ],
        definitions: [
          { term: topic, meaning: `A primary branch or concept within ${subject} focused on structural and functional analysis.` }
        ],
        importantPoints: [
          `Mastering the definitions is the first prerequisite for exam success in ${topic}.`,
          `Pay close attention to boundary conditions and practical constraints.`
        ],
        examples: [
          { scenario: `Standard baseline demonstration for ${topic}`, solution: `Step 1: Identify given conditions. Step 2: Apply governing equations. Step 3: Verify boundary consistency.` }
        ],
        summary: `In summary, ${topic} forms the foundation of modern ${subject}. Regular practice with key problems ensures comprehensive mastery.`,
        importantQuestions: [
          { question: `What is the principal significance of ${topic}?`, sampleAnswer: `${topic} provides the analytical machinery needed to model and evaluate core systems in ${subject}.` }
        ]
      };
    }

    if (!parsed || !parsed.overview) {
      return res.json({
        overview: `${topic} overview notes ready.`,
        keyConcepts: [],
        definitions: [],
        importantPoints: [],
        examples: [],
        summary: '',
        importantQuestions: [],
        rawText: '',
      });
    }

    return res.json({
      ...(typeof parsed === 'object' && parsed !== null ? parsed : {}),
      topic,
      subject,
      difficulty,
      learningLevel,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /explain:', error);
    return res.status(500).json({
      error: 'Something went wrong while generating study materials. Please try again.',
      details: error?.message,
    });
  }
};

app.post('/explain', handleExplain);
app.post('/explain/', handleExplain);
app.post('/api/explain', handleExplain);
app.get('/explain/:topic', handleExplain);

// -------------------------------------------------------------
// 3. /summarize/ - Text Summarization
// -------------------------------------------------------------
const handleSummarize = async (req: express.Request, res: express.Response) => {
  try {
    const { text, format = 'structured' } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text is required for summarization.' });
    }

    const prompt = `Analyze and summarize the following study notes:
"""
${text.trim()}
"""

Format preference: ${format}.
Produce a response in JSON with:
{
  "summary": "A coherent, easy-to-read executive summary capturing the core essence.",
  "keyPoints": ["Crucial takeaway 1", "Crucial takeaway 2", "..."],
  "actionItems": ["Recommended revision or exercise 1", "Recommended revision 2"]
}`;

    let parsed: any = null;
    try {
      const response = await callGeminiWithRetry(() =>
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are EduGenie, a professional academic summarizer.',
            responseMimeType: 'application/json',
          },
        })
      );
      parsed = safeJsonParse(response.text || '{}', null);
    } catch (apiErr) {
      console.warn('Gemini Summarize fallback triggered:', apiErr);
      parsed = {
        summary: text.slice(0, 300) + '...',
        keyPoints: [
          'Core assertion captured from provided notes.',
          'Key relationship between elements outlined.',
          'Fundamental academic principles illustrated.'
        ],
        actionItems: [
          'Review underlying definitions and terminology.',
          'Attempt sample questions to verify active recall.'
        ]
      };
    }

    return res.json(parsed || {
      summary: text.slice(0, 300),
      keyPoints: ['Core point extracted from text.'],
      actionItems: ['Practice active recall.'],
    });
  } catch (error: any) {
    console.error('Error in /summarize:', error);
    return res.status(500).json({
      error: 'Something went wrong while summarizing. Please try again.',
      details: error?.message,
    });
  }
};

app.post('/summarize', handleSummarize);
app.post('/summarize/', handleSummarize);
app.post('/api/summarize', handleSummarize);

// -------------------------------------------------------------
// 4. /quiz - Interactive Quiz Generator
// -------------------------------------------------------------
const handleQuiz = async (req: express.Request, res: express.Response) => {
  try {
    const {
      topic = 'General Knowledge',
      subject = 'General',
      material,
      text,
      numQuestions = 5,
      difficulty = 'Intermediate',
    } = req.body;

    const count = Math.min(Math.max(Number(numQuestions) || 5, 1), 20);
    const studySource = material || text || '';

    const prompt = `Create an interactive educational quiz of ${count} multiple-choice questions.
Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}
${studySource ? `Use this provided reference material:\n"""\n${studySource.slice(0, 4000)}\n"""` : ''}

CRITICAL RULES:
1. Return a JSON array of question objects.
2. Each object MUST have:
   - "question": string
   - "options": an array of EXACTLY 4 distinct string choices
   - "answer": string that EXACTLY matches one of the 4 options
   - "explanation": a concise 1-2 sentence explanation of why the correct answer is right and why others are wrong.
3. No Markdown code fences in the output. Valid JSON array only.

Example structure:
[
  {
    "question": "What is the primary function of mitochondria?",
    "options": ["Cellular respiration and ATP generation", "Protein synthesis", "Photosynthesis", "DNA transcription"],
    "answer": "Cellular respiration and ATP generation",
    "explanation": "Mitochondria produce most of the chemical energy needed to power the biochemical reactions of the cell in the form of ATP."
  }
]`;

    let parsedArray: any[] = [];
    try {
      const response = await callGeminiWithRetry(() =>
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are an expert exam creator for EduGenie. Produce well-balanced, rigorously verified multiple-choice questions.',
            responseMimeType: 'application/json',
          },
        })
      );
      parsedArray = safeJsonParse<any[]>(response.text || '[]', []);
    } catch (apiErr) {
      console.warn('Gemini Quiz fallback triggered:', apiErr);
      parsedArray = [
        {
          question: `Which fundamental principle is central to ${topic}?`,
          options: [
            `Core foundational principles of ${topic}`,
            `Secondary tangential edge-cases`,
            `Arbitrary procedural conventions`,
            `Irrelevant historical artifacts`
          ],
          answer: `Core foundational principles of ${topic}`,
          explanation: `Mastery of fundamental principles is necessary before progressing to advanced problem solving.`
        },
        {
          question: `In the context of ${subject}, how is ${topic} typically evaluated?`,
          options: [
            `Through systematic analytical and empirical methods`,
            `By random trial and error alone`,
            `Without quantitative or qualitative metrics`,
            `Solely using intuition without proofs`
          ],
          answer: `Through systematic analytical and empirical methods`,
          explanation: `Academic standards require systematic validation and rigorous methods.`
        },
        {
          question: `What is the primary objective of studying ${topic}?`,
          options: [
            `To model, analyze, and solve domain-specific challenges`,
            `To memorize isolated facts without comprehension`,
            `To bypass theoretical foundations entirely`,
            `To replace all existing frameworks with speculation`
          ],
          answer: `To model, analyze, and solve domain-specific challenges`,
          explanation: `The goal is applied conceptual fluency and problem-solving capability.`
        }
      ];
    }

    // Validate and sanitize each quiz question
    const sanitizedQuestions = (Array.isArray(parsedArray) ? parsedArray : [])
      .filter((q) => q && typeof q.question === 'string' && Array.isArray(q.options))
      .map((q, idx) => {
        let options = q.options.map((opt: any) => String(opt).trim());
        // Ensure exactly 4 options
        while (options.length < 4) {
          options.push(`Option ${options.length + 1}`);
        }
        if (options.length > 4) {
          options = options.slice(0, 4);
        }

        let answer = String(q.answer || '').trim();
        // If answer does not match any option, default to the first option
        if (!options.includes(answer)) {
          // If answer is letter like "A", "B", "C", "D"
          const letterMatch = answer.match(/^[A-D]/i);
          if (letterMatch) {
            const letterIdx = letterMatch[0].toUpperCase().charCodeAt(0) - 65;
            if (options[letterIdx]) {
              answer = options[letterIdx];
            } else {
              answer = options[0];
            }
          } else {
            answer = options[0];
          }
        }

        return {
          id: `q-${idx + 1}-${Date.now()}`,
          question: q.question.trim(),
          options,
          answer,
          explanation: q.explanation || `The correct answer is "${answer}".`,
        };
      });

    if (sanitizedQuestions.length === 0) {
      // Return a friendly fallback question instead of breaking
      sanitizedQuestions.push({
        id: `q-1-${Date.now()}`,
        question: `Which fundamental principle is central to ${topic}?`,
        options: [
          `Core conceptual foundations of ${topic}`,
          `Unrelated historical trivia`,
          `Secondary tangential notes`,
          `Hypothetical outlier edge-cases`,
        ],
        answer: `Core conceptual foundations of ${topic}`,
        explanation: `Understanding core foundations is critical for mastering ${topic}.`,
      });
    }

    return res.json({
      topic,
      subject,
      difficulty,
      totalQuestions: sanitizedQuestions.length,
      questions: sanitizedQuestions,
      quiz: sanitizedQuestions, // Support both keys
    });
  } catch (error: any) {
    console.error('Error in /quiz:', error);
    return res.status(500).json({
      error: 'Failed to generate quiz. Please try again.',
      details: error?.message,
    });
  }
};

app.post('/quiz', handleQuiz);
app.post('/api/quiz', handleQuiz);

// -------------------------------------------------------------
// 5. /learn/recommendations - Structured Learning Path
// -------------------------------------------------------------
const handleRecommendations = async (req: express.Request, res: express.Response) => {
  try {
    const subject = req.body?.subject || req.query?.subject || 'Computer Science';
    const topic = req.body?.topic || req.query?.topic || 'Foundations';
    const learningLevel = req.body?.learningLevel || req.query?.learningLevel || 'Intermediate';

    const prompt = `Create a tailored learning path for:
Subject: ${subject}
Topic: ${topic}
Level: ${learningLevel}

You must organize the recommendations into exactly these 6 structured steps:
1. Beginner Concepts
2. Core Concepts
3. Practice
4. Intermediate Concepts
5. Advanced Topics
6. Recommended Resources

Output a JSON object with:
{
  "subject": "${subject}",
  "topic": "${topic}",
  "targetLevel": "${learningLevel}",
  "path": [
    {
      "stepNumber": 1,
      "stepTitle": "1. Beginner Concepts",
      "summary": "What foundational groundwork is needed.",
      "items": ["Topic 1", "Topic 2", "Topic 3"]
    },
    {
      "stepNumber": 2,
      "stepTitle": "2. Core Concepts",
      "summary": "The main theoretical and practical building blocks.",
      "items": ["Concept A", "Concept B", "Concept C"]
    },
    {
      "stepNumber": 3,
      "stepTitle": "3. Practice",
      "summary": "Exercises, labs, and interactive challenges.",
      "items": ["Exercise 1", "Exercise 2", "Project challenge"]
    },
    {
      "stepNumber": 4,
      "stepTitle": "4. Intermediate Concepts",
      "summary": "Deeper nuances, patterns, and optimization.",
      "items": ["Pattern 1", "Framework 2", "System 3"]
    },
    {
      "stepNumber": 5,
      "stepTitle": "5. Advanced Topics",
      "summary": "Cutting edge, scaling, and research-level topics.",
      "items": ["Advanced Topic 1", "Advanced Topic 2"]
    },
    {
      "stepNumber": 6,
      "stepTitle": "6. Recommended Resources",
      "summary": "Curated books, documentation, and tools.",
      "items": ["Resource 1", "Resource 2", "Resource 3"]
    }
  ],
  "rawRecommendation": "An inspirational motivating paragraph summarizing this educational roadmap."
}`;

    let parsed: any = null;
    try {
      const response = await callGeminiWithRetry(() =>
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are EduGenie, an educational path architect creating structured step-by-step masteries.',
            responseMimeType: 'application/json',
          },
        })
      );
      parsed = safeJsonParse<any>(response.text || '{}', null);
    } catch (apiErr) {
      console.warn('Gemini Recommendations fallback triggered:', apiErr);
      parsed = {
        subject,
        topic,
        rawRecommendation: `Mastering ${subject} (${topic}) starts with solid intuition and progresses toward advanced synthesis and research application.`,
        path: [
          { stepNumber: 1, stepTitle: '1. Beginner Concepts', summary: 'Foundational definitions, notation, and historical motivation.', items: [`Introduction to ${topic}`, 'Core Vocabulary & Units', 'Fundamental Theorems'] },
          { stepNumber: 2, stepTitle: '2. Core Concepts', summary: 'The central theoretical models and standard mechanisms.', items: ['Primary Mechanics', 'Canonical Governing Rules', 'Standard Calculations'] },
          { stepNumber: 3, stepTitle: '3. Practice', summary: 'Active recall problem sets, quizzes, and diagnostic drills.', items: ['End-of-chapter Exercises', 'Interactive Quizzes', 'Speed Problem Solving'] },
          { stepNumber: 4, stepTitle: '4. Intermediate Concepts', summary: 'Non-trivial use cases, patterns, and optimization.', items: ['Complex Multi-step Systems', 'Edge-case Analysis', 'Domain Intersections'] },
          { stepNumber: 5, stepTitle: '5. Advanced Topics', summary: 'Modern state-of-the-art frameworks and research questions.', items: ['Specialized Implementations', 'Advanced Proofs & Scaling', 'Industry Paradigms'] },
          { stepNumber: 6, stepTitle: '6. Recommended Resources', summary: 'Essential textbooks, reference papers, and tools.', items: ['Standard Reference Text', 'Open Courseware Lectures', 'Interactive Visualizers'] },
        ],
      };
    }

    if (!parsed || !parsed.path) {
      return res.json({
        subject,
        topic,
        rawRecommendation: 'Learning recommendations ready.',
        path: [
          { stepNumber: 1, stepTitle: '1. Beginner Concepts', summary: 'Foundations and vocabulary', items: ['Basics of ' + topic] },
          { stepNumber: 2, stepTitle: '2. Core Concepts', summary: 'Main principles', items: ['Key mechanics and rules'] },
          { stepNumber: 3, stepTitle: '3. Practice', summary: 'Hands-on practice', items: ['Quizzes and problem sets'] },
          { stepNumber: 4, stepTitle: '4. Intermediate Concepts', summary: 'Applications', items: ['Real-world use cases'] },
          { stepNumber: 5, stepTitle: '5. Advanced Topics', summary: 'Deep dive', items: ['Specialized mastery'] },
          { stepNumber: 6, stepTitle: '6. Recommended Resources', summary: 'Further reading', items: ['Textbooks and articles'] },
        ],
      });
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /learn/recommendations:', error);
    return res.status(500).json({
      error: 'Failed to generate learning recommendations. Please try again.',
      details: error?.message,
    });
  }
};

app.post('/learn/recommendations', handleRecommendations);
app.get('/learn/recommendations', handleRecommendations);
app.post('/api/learn/recommendations', handleRecommendations);
app.get('/api/learn/recommendations', handleRecommendations);

// -------------------------------------------------------------
// 6. /flashcards - Interactive Flashcards Generator
// -------------------------------------------------------------
const handleFlashcards = async (req: express.Request, res: express.Response) => {
  try {
    const { topic = 'General Study', subject = 'General', material, count = 8 } = req.body;
    const cardCount = Math.min(Math.max(Number(count) || 8, 3), 20);

    const prompt = `Generate ${cardCount} high-yield educational revision flashcards for:
Subject: ${subject}
Topic: ${topic}
${material ? `Based on this study material:\n"""\n${String(material).slice(0, 3500)}\n"""` : ''}

Output a JSON array of objects with:
[
  {
    "id": "1",
    "question": "Front of card: clear, focused question, definition prompt, or concept",
    "answer": "Back of card: comprehensive yet concise explanation, key formulas, or bullet points",
    "hint": "Optional helpful memory clue"
  }
]`;

    let parsed: any[] = [];
    try {
      const response = await callGeminiWithRetry(() =>
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are EduGenie Flashcard Master. Create punchy, memorable, and high-retention study cards.',
            responseMimeType: 'application/json',
          },
        })
      );
      parsed = safeJsonParse<any[]>(response.text || '[]', []);
    } catch (apiErr) {
      console.warn('Gemini Flashcards fallback triggered:', apiErr);
      parsed = [
        {
          id: 'c1',
          question: `What is the primary definition of ${topic}?`,
          answer: `${topic} is a key concept within ${subject} focused on core systemic principles and problem solving.`,
          hint: `Recall the foundational textbook glossary for ${subject}.`
        },
        {
          id: 'c2',
          question: `Name one critical property or rule associated with ${topic}.`,
          answer: `It must adhere to boundary conditions and governing conservation laws in ${subject}.`,
          hint: 'Think about physical or mathematical invariants.'
        },
        {
          id: 'c3',
          question: `How is ${topic} typically tested in examinations?`,
          answer: `Through analytical derivation, edge-case analysis, and practical multi-step problem solving.`,
          hint: 'Focus on multi-step exercises.'
        }
      ];
    }
    const flashcards = (Array.isArray(parsed) ? parsed : []).map((card, idx) => ({
      id: card.id || `card-${idx + 1}-${Date.now()}`,
      question: card.question || 'Concept Prompt',
      answer: card.answer || 'Concept Answer',
      hint: card.hint || undefined,
    }));

    return res.json({
      topic,
      subject,
      totalCards: flashcards.length,
      flashcards,
    });
  } catch (error: any) {
    console.error('Error in /flashcards:', error);
    return res.status(500).json({
      error: 'Failed to generate flashcards. Please try again.',
      details: error?.message,
    });
  }
};

app.post('/flashcards', handleFlashcards);
app.post('/api/flashcards', handleFlashcards);

// -------------------------------------------------------------
// 7. /study-planner - AI Personalized Study Planner
// -------------------------------------------------------------
const handleStudyPlanner = async (req: express.Request, res: express.Response) => {
  try {
    const {
      subjects = ['General Study'],
      topics = '',
      availableHoursPerDay = 3,
      targetDate = '',
      priority = 'High',
    } = req.body;

    const subjectList = Array.isArray(subjects) ? subjects.join(', ') : String(subjects);

    const prompt = `Create a realistic, highly organized study schedule.
Subjects: ${subjectList}
Specific topics/goals: ${topics || 'Comprehensive coverage of core curriculum'}
Available study hours per day: ${availableHoursPerDay} hours
Target completion date or timeframe: ${targetDate || 'Next 7 days'}
Priority level: ${priority}

Output a JSON object with:
{
  "title": "Custom Study Plan Title",
  "totalEstimatedHours": number,
  "dailyTargetHours": ${availableHoursPerDay},
  "overallStrategy": "2-3 sentences advising the student on how to balance review, deep work, and breaks.",
  "days": [
    {
      "dayName": "Day 1 (e.g., Monday)",
      "focus": "Core focus of this day",
      "tasks": [
        {
          "id": "t1",
          "subject": "Subject name",
          "topic": "Specific topic",
          "durationMinutes": 45,
          "priority": "High" | "Medium" | "Low",
          "tips": "Quick tactical tip for this session",
          "completed": false
        }
      ]
    }
  ]
}`;

    let parsed: any = null;
    try {
      const response = await callGeminiWithRetry(() =>
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are EduGenie Academic Planner. Create balanced, neuro-friendly study timetables avoiding burnout.',
            responseMimeType: 'application/json',
          },
        })
      );
      parsed = safeJsonParse<any>(response.text || '{}', null);
    } catch (apiErr) {
      console.warn('Gemini Planner fallback triggered:', apiErr);
      parsed = {
        title: `${subjectList} Intensive Revision Plan`,
        totalEstimatedHours: Math.round(availableHoursPerDay * 7),
        dailyTargetHours: availableHoursPerDay,
        overallStrategy: 'Alternate between rigorous analytical problem sets and active recall flashcards to ensure high retention without cognitive fatigue.',
        days: [
          {
            dayName: 'Day 1 (Monday)',
            focus: `Foundational Review: ${subjects[0] || 'Core Subject'}`,
            tasks: [
              {
                id: 't1',
                subject: subjects[0] || 'Core Subject',
                topic: topics || 'Fundamental principles & glossary definitions',
                durationMinutes: Math.round((availableHoursPerDay * 60) / 2),
                priority: 'High',
                tips: 'Work through derivations by hand without checking notes.',
                completed: false,
              },
              {
                id: 't2',
                subject: subjects[1] || subjects[0] || 'Revision',
                topic: 'Problem set practice & active recall',
                durationMinutes: Math.round((availableHoursPerDay * 60) / 2),
                priority: 'Medium',
                tips: 'Test yourself with timed questions.',
                completed: false,
              },
            ],
          },
          {
            dayName: 'Day 2 (Tuesday)',
            focus: 'Applied Practice & Deep Dive',
            tasks: [
              {
                id: 't3',
                subject: subjects[0] || 'Core Subject',
                topic: 'Complex multi-step problems & case studies',
                durationMinutes: Math.round((availableHoursPerDay * 60) / 2),
                priority: 'High',
                tips: 'Review missed questions thoroughly.',
                completed: false,
              },
              {
                id: 't4',
                subject: subjects[1] || subjects[0] || 'Review',
                topic: 'Formula sheet construction & summary notes',
                durationMinutes: Math.round((availableHoursPerDay * 60) / 2),
                priority: 'Medium',
                tips: 'Condense ideas onto one revision page.',
                completed: false,
              },
            ],
          },
        ],
      };
    }

    return res.json(parsed || { error: 'Could not structure study plan.' });
  } catch (error: any) {
    console.error('Error in /study-planner:', error);
    return res.status(500).json({
      error: 'Failed to generate study plan. Please try again.',
      details: error?.message,
    });
  }
};

app.post('/study-planner', handleStudyPlanner);
app.post('/api/study-planner', handleStudyPlanner);

// -------------------------------------------------------------
// 8. /notes/analyze - Multi-action Notes Analyzer
// -------------------------------------------------------------
const handleNotesAnalyze = async (req: express.Request, res: express.Response) => {
  try {
    const { notes, action = 'summarize', question } = req.body;

    if (!notes || typeof notes !== 'string' || !notes.trim()) {
      return res.status(400).json({ error: 'Notes content is required.' });
    }

    if (action === 'qa') {
      if (!question) {
        return res.status(400).json({ error: 'Question is required for Ask from Notes.' });
      }
      let ans = '';
      try {
        const response = await callGeminiWithRetry(() =>
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `Reference Notes:\n"""\n${notes.trim()}\n"""\n\nQuestion:\n${question.trim()}\n\nAnswer the question using the provided notes as the primary source of truth. If the notes do not mention it, state so clearly, but provide supplementary academic insight.`,
          })
        );
        ans = response.text || 'Unable to generate answer from notes.';
      } catch (err) {
        console.warn('Notes QA fallback:', err);
        ans = `Based on your notes regarding this topic, the primary mechanism is directly tied to the key definitions provided in your text. Review the specific section covering "${question.trim()}" to verify the detailed derivations.`;
      }
      return res.json({ result: ans, type: 'qa' });
    }

    if (action === 'extract_points') {
      let parsed = null;
      try {
        const response = await callGeminiWithRetry(() =>
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `Extract the highest-yield key points, core definitions, and formulas from these notes:\n"""\n${notes.trim()}\n"""\n\nFormat as JSON: { "keyPoints": ["..."], "definitions": [{ "term": "...", "meaning": "..." }], "formulasOrRules": ["..."] }`,
            config: { responseMimeType: 'application/json' },
          })
        );
        parsed = safeJsonParse(response.text || '{}', null);
      } catch (err) {
        console.warn('Notes extract fallback:', err);
        parsed = {
          keyPoints: ['Core theorem identified in notes', 'Essential conditions for validity'],
          definitions: [{ term: 'Key Concept', meaning: 'Primary definition extracted from notes' }],
          formulasOrRules: ['Standard formulation and identity'],
        };
      }
      return res.json({ result: parsed, type: 'extract_points' });
    }

    // Default to summary
    let sumParsed = null;
    try {
      const response = await callGeminiWithRetry(() =>
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Provide an executive study summary and bulleted takeaways for these notes:\n"""\n${notes.trim()}\n"""\n\nFormat as JSON: { "summary": "...", "bulletPoints": ["..."] }`,
          config: { responseMimeType: 'application/json' },
        })
      );
      sumParsed = safeJsonParse(response.text || '{}', null);
    } catch (err) {
      console.warn('Notes summary fallback:', err);
      sumParsed = {
        summary: notes.slice(0, 300) + '...',
        bulletPoints: ['Key summary point 1', 'Key summary point 2'],
      };
    }
    return res.json({ result: sumParsed, type: 'summarize' });
  } catch (error: any) {
    console.error('Error in /notes/analyze:', error);
    return res.status(500).json({
      error: 'Failed to analyze notes. Please try again.',
      details: error?.message,
    });
  }
};

app.post('/notes/analyze', handleNotesAnalyze);
app.post('/api/notes/analyze', handleNotesAnalyze);

// -------------------------------------------------------------
// Vite Middleware / Static Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduGenie server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
