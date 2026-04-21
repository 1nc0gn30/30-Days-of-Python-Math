import { GoogleGenAI, Type } from '@google/genai';

function getClient(apiKey: string) {
  const key = apiKey.trim();
  if (!key) {
    throw new Error('Missing Gemini API key');
  }
  return new GoogleGenAI({ apiKey: key });
}

export async function fetchDailyLesson(day: number, title: string, topic: string, apiKey: string) {
  const prompt = `You are an expert Python and Math instructor. Write a comprehensive daily lesson for Day ${day} of a 30-day "Math with Python" course.
Title: ${title}
Topic: ${topic}

Requirements:
1. Provide a detailed conceptual explanation of the math concept (approx 100-150 words). Break it down so it is easy to understand.
2. Provide a brief Python code example (approx 5-10 lines).
3. Provide 2-3 high-quality external resource links (e.g., Khan Academy, Python Documentation, or Wolfram Alpha) relevant to this specific topic.
4. Provide a practical Coding Challenge for the user to solve right now.

Format the response strictly as a JSON object with the following schema:
{
  "explanation": "string (the conceptual explanation, use markdown if needed)",
  "codeExample": "string (the python code example, do not include markdown code block backticks)",
  "resources": [
    { "title": "string", "url": "string" }
  ],
  "challengeTask": "string (the task the user needs to solve)"
}
Do NOT wrap the JSON in Markdown code blocks. Return raw JSON.`;

  try {
    const ai = getClient(apiKey);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            codeExample: { type: Type.STRING },
            challengeTask: { type: Type.STRING },
            resources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  url: { type: Type.STRING }
                },
                required: ['title', 'url']
              }
            }
          },
          required: ['explanation', 'codeExample', 'challengeTask', 'resources']
        }
      }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('Error fetching lesson:', err);
    return null;
  }
}

export async function evaluateUserCode(day: number, topic: string, challenge: string, code: string, apiKey: string) {
  const prompt = `You are evaluating a student's Python code for Day ${day} of a math course.
Topic: ${topic}
Task: ${challenge}

User's Code:
${code}

Provide a short evaluation. State clearly if they PASSED or FAILED. Give 1 or 2 sentences of constructive feedback.
Format strictly as JSON:
{
  "passed": boolean,
  "feedback": "string (short feedback)"
}`;

  try {
    const ai = getClient(apiKey);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            passed: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING }
          },
          required: ['passed', 'feedback']
        }
      }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('Error evaluating code:', err);
    return { passed: false, feedback: 'An error occurred while evaluating. Please try again.' };
  }
}
