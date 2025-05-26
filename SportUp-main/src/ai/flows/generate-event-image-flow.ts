
// 'use server';
// /**
//  * @fileOverview An AI agent for generating event hero images based on sport category.
//  *
//  * - generateEventImageFlow - A function that handles the image generation.
//  * - GenerateEventImageInput - The input type for the generateEventImageFlow function.
//  * - GenerateEventImageOutput - The return type for the generateEventImageFlow function.
//  */

// import {ai} from '@/ai/genkit';
// import {z} from 'genkit';

// const GenerateEventImageInputSchema = z.object({
//   sportCategory: z.string().describe('The sport category for the event (e.g., Basketball, Football).'),
// });
// export type GenerateEventImageInput = z.infer<typeof GenerateEventImageInputSchema>;

// const GenerateEventImageOutputSchema = z.object({
//   imageUri: z.string().describe("The data URI of the generated image in PNG format. Expected format: 'data:image/png;base64,<encoded_data>'."),
// });
// export type GenerateEventImageOutput = z.infer<typeof GenerateEventImageOutputSchema>;

// export async function generateEventImage(input: GenerateEventImageInput): Promise<GenerateEventImageOutput> {
//   return generateEventImageFlow(input);
// }

// const generateEventImageFlow = ai.defineFlow(
//   {
//     name: 'generateEventImageFlow',
//     inputSchema: GenerateEventImageInputSchema,
//     outputSchema: GenerateEventImageOutputSchema,
//   },
//   async (input) => {
//     const { media, text } = await ai.generate({
//       model: 'googleai/gemini-2.0-flash-exp', // Use the image-capable model
//       prompt: `Generate a dynamic and exciting hero image for a ${input.sportCategory} event.
// The image should be suitable for a website banner, be visually appealing, and capture the essence of the sport.
// For example, for 'Basketball', show an action shot of a basketball game or a dramatic image of a basketball and hoop.
// For 'Football', show a stadium view or an action shot from a football match.
// Ensure the image is high quality and engaging.
// This is a text response to satisfy the model requirements, the image will be in the media part.`,
//       config: {
//         responseModalities: ['TEXT', 'IMAGE'], // Must include TEXT and IMAGE
//       },
//     });

//     if (!media || !media.url) {
//       throw new Error('Image generation failed or did not return a media URL.');
//     }
    
//     return { imageUri: media.url };
//   }
// );
