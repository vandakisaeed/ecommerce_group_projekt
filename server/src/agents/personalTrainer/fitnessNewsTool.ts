// fitnessTools.ts
import { tool } from '@openai/agents';
import { z } from 'zod';

/** BMI Calculator */
export const bmiCalculatorTool = tool({
  name: 'bmi_calculator',
  description: 'Calculates the Body Mass Index (BMI) from height (cm) and weight (kg)',
  parameters: z.object({
    heightCm: z.number().min(50).max(250),
    weightKg: z.number().min(10).max(300)
  }),
  execute: async ({ heightCm, weightKg }) => {
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    let category = '';

    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal weight';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';

    return { bmi: parseFloat(bmi.toFixed(2)), category };
  }
});

/** Daily Calorie Calculator */
export const dailyCalorieCalculatorTool = tool({
  name: 'daily_calorie_calculator',
  description: 'Estimates daily calorie needs based on BMR and activity level',
  parameters: z.object({
    gender: z.enum(['male', 'female']),
    age: z.number().min(10).max(100),
    heightCm: z.number().min(100).max(250),
    weightKg: z.number().min(30).max(250),
    activityLevel: z.enum([
      'sedentary',
      'lightly_active',
      'moderately_active',
      'very_active',
      'extra_active'
    ])
  }),
  execute: async ({ gender, age, heightCm, weightKg, activityLevel }) => {
    const bmr =
      gender === 'male'
        ? 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age
        : 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.330 * age;

    const activityMultiplierMap: Record<string, number> = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extra_active: 1.9
    };

    const multiplier = activityMultiplierMap[activityLevel];
    if (!multiplier) throw new Error(`Invalid activity level: ${activityLevel}`);

    const calories = Math.round(bmr * multiplier);
    return { bmr: Math.round(bmr), calories };
  }
});

/** Fetch Workout Plan Tool */
export const fetchWorkoutPlanTool = tool({
  name: 'fetch_workout_plan',
  description: 'Fetches a personalized workout plan from an external API',
  parameters: z.object({
    goal: z.enum(['weight_loss', 'muscle_gain', 'endurance', 'strength']),
    experienceLevel: z.enum(['beginner', 'intermediate', 'advanced'])
  }),
  execute: async ({ goal, experienceLevel }) => {
    try {
      const response = await fetch(
        `https://api.api-ninjas.com/v1/exercises?type=${goal}&difficulty=${experienceLevel}`,
        { headers: { 'X-Api-Key': process.env.NINJA_API_KEY || '' } }
      );

      if (!response.ok) throw new Error(`API responded with status ${response.status}`);
      
      const data = (await response.json()) as any[]; // type cast to any[]
      return { message: 'Workout plan fetched successfully!', data: data.slice(0, 5) };
    } catch (err) {
      console.error('❌ Error fetching workout plan:', err);
      return { error: 'Failed to fetch workout plan. Please try again later.' };
    }
  }
});
