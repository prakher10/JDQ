import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobDescription, questionType } = await req.json();

    if (!jobDescription) {
      throw new Error('Job description is required');
    }

    console.log('Generating questions for:', { questionType });

    let systemPrompt = '';
    let userPrompt = '';

    if (questionType === 'interview') {
      systemPrompt = `You are an expert interview coach. Generate exactly 200 diverse, relevant interview questions based on the provided job description. 
      Cover various aspects: technical skills, behavioral questions, situational questions, company culture fit, problem-solving, leadership, and role-specific competencies.
      Return ONLY a JSON array of questions, no additional text.`;
      
      userPrompt = `Generate 200 interview questions for this job description:\n\n${jobDescription}\n\nFormat: ["Question 1", "Question 2", ...]`;
    } else {
      systemPrompt = `You are an expert quiz creator. Generate exactly 200 multiple-choice quiz questions based on the provided job description.
      Each question should test knowledge, skills, or concepts relevant to the role.
      Return ONLY a JSON array where each item has: question, options (array of 4 choices), correctAnswer (the correct option text).`;
      
      userPrompt = `Generate 200 quiz questions for this job description:\n\n${jobDescription}\n\nFormat: [{"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A"}]`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('Raw AI response:', content.substring(0, 200));

    // Parse the JSON response
    let questions;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      questions = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse AI response as JSON');
    }

    if (!Array.isArray(questions)) {
      throw new Error('AI response is not an array');
    }

    console.log(`Successfully generated ${questions.length} questions`);

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-questions:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});