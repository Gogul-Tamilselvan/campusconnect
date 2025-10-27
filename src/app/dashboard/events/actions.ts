'use server';

import { suggestEventDetails } from '@/ai/flows/suggest-event-details';
import { z } from 'zod';

const EventSchema = z.object({
    eventName: z.string().min(1, 'Event name is required.'),
    eventDetails: z.string().optional(),
});

export type FormState = {
    message: string;
    suggestions?: {
        categories: string[];
        description: string;
    };
    fields?: {
        eventName: string;
        eventDetails: string;
    };
    issues?: string[];
} | null;

export async function getEventSuggestions(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const validatedFields = EventSchema.safeParse({
        eventName: formData.get('eventName'),
        eventDetails: formData.get('eventDetails'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Invalid form data.',
            issues: validatedFields.error.flatten().fieldErrors.eventName,
            fields: {
                eventName: formData.get('eventName') as string,
                eventDetails: formData.get('eventDetails') as string,
            }
        };
    }
    
    try {
        const result = await suggestEventDetails({
            eventName: validatedFields.data.eventName,
            eventDetails: validatedFields.data.eventDetails,
        });

        return {
            message: 'Suggestions generated successfully!',
            suggestions: {
                categories: result.categorySuggestions,
                description: result.descriptionSuggestion,
            },
            fields: validatedFields.data
        };
    } catch (error) {
        return {
            message: 'Failed to get suggestions from AI. Please try again.',
            fields: validatedFields.data
        };
    }
}
