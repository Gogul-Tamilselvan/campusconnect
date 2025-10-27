'use server';

/**
 * @fileOverview A flow to suggest event categories and descriptions using AI.
 *
 * - suggestEventDetails - A function that suggests event details.
 * - SuggestEventDetailsInput - The input type for the suggestEventDetails function.
 * - SuggestEventDetailsOutput - The return type for the suggestEventDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestEventDetailsInputSchema = z.object({
  eventName: z.string().describe('The name of the event.'),
  eventDetails: z.string().optional().describe('User provided details about the event, can be blank'),
});
export type SuggestEventDetailsInput = z.infer<typeof SuggestEventDetailsInputSchema>;

const SuggestEventDetailsOutputSchema = z.object({
  categorySuggestions: z.array(z.string()).describe('Suggested categories for the event.'),
  descriptionSuggestion: z.string().describe('An AI-generated description for the event.'),
});
export type SuggestEventDetailsOutput = z.infer<typeof SuggestEventDetailsOutputSchema>;

export async function suggestEventDetails(input: SuggestEventDetailsInput): Promise<SuggestEventDetailsOutput> {
  return suggestEventDetailsFlow(input);
}

const suggestEventDetailsPrompt = ai.definePrompt({
  name: 'suggestEventDetailsPrompt',
  input: {schema: SuggestEventDetailsInputSchema},
  output: {schema: SuggestEventDetailsOutputSchema},
  prompt: `You are an AI assistant that helps users create event postings by suggesting relevant categories and a clear, concise description.

  Consider the event name and any user-provided details to generate suggestions.
  Return category suggestions as an array of strings and the description suggestion as a complete sentence.

  Event Name: {{{eventName}}}
  User Provided Details: {{{eventDetails}}}
  `,
});

const suggestEventDetailsFlow = ai.defineFlow(
  {
    name: 'suggestEventDetailsFlow',
    inputSchema: SuggestEventDetailsInputSchema,
    outputSchema: SuggestEventDetailsOutputSchema,
  },
  async input => {
    const {output} = await suggestEventDetailsPrompt(input);
    return output!;
  }
);
