'use server';
/**
 * @fileOverview An AI agent for suggesting event locations based on user preferences and geographical distribution.
 *
 * - suggestEventLocation - A function that handles the event location suggestion process.
 * - SuggestEventLocationInput - The input type for the suggestEventLocation function.
 * - SuggestEventLocationOutput - The return type for the suggestEventLocation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestEventLocationInputSchema = z.object({
  userPreferences: z
    .string()
    .describe('The preferences of the user for the event location.'),
  sportsCategory: z.string().describe('The sports category of the event.'),
  city: z.string().describe('The city where the event will be held.'),
  areaPreferences: z.string().describe('Preferred areas within the city.'),
  geographicalDistribution: z
    .string()
    .describe(
      'The geographical distribution of potential participants in the city.'
    ),
});
export type SuggestEventLocationInput = z.infer<
  typeof SuggestEventLocationInputSchema
>;

const SuggestEventLocationOutputSchema = z.object({
  suggestedLocation: z
    .string()
    .describe('The suggested optimal location for the event.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the location suggestion.'),
});
export type SuggestEventLocationOutput = z.infer<
  typeof SuggestEventLocationOutputSchema
>;

export async function suggestEventLocation(
  input: SuggestEventLocationInput
): Promise<SuggestEventLocationOutput> {
  return suggestEventLocationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestEventLocationPrompt',
  input: {schema: SuggestEventLocationInputSchema},
  output: {schema: SuggestEventLocationOutputSchema},
  prompt: `You are an AI assistant specialized in suggesting optimal locations for sports events.

  Based on the user's preferences, the sports category, the city where the event will be held, preferred areas within the city, and the geographical distribution of potential participants, suggest the best location for the event.

  User Preferences: {{{userPreferences}}}
  Sports Category: {{{sportsCategory}}}
  City: {{{city}}}
  Area Preferences: {{{areaPreferences}}}
  Geographical Distribution: {{{geographicalDistribution}}}

  Consider factors such as accessibility, popularity, safety, and suitability for the sports category.
  Provide a clear and concise reasoning for your suggestion.
  Format your output to match the SuggestEventLocationOutputSchema. Do not include any extra conversational text.`,
});

const suggestEventLocationFlow = ai.defineFlow(
  {
    name: 'suggestEventLocationFlow',
    inputSchema: SuggestEventLocationInputSchema,
    outputSchema: SuggestEventLocationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
