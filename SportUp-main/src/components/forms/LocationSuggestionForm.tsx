
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { suggestEventLocation, type SuggestEventLocationOutput } from "@/ai/flows/suggest-event-location";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, MapPin } from "lucide-react";

const formSchema = z.object({
  userPreferences: z.string().min(10, "Please describe your preferences (min 10 chars).").max(500),
  sportsCategory: z.string().min(3, "Sport category is required.").max(50),
  city: z.string().min(2, "City is required.").max(50),
  areaPreferences: z.string().min(5, "Area preferences are required (min 5 chars).").max(200),
  geographicalDistribution: z.string().min(10, "Describe participant distribution (min 10 chars).").max(500),
});

export function LocationSuggestionForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestEventLocationOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userPreferences: "",
      sportsCategory: "",
      city: "",
      areaPreferences: "",
      geographicalDistribution: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setSuggestion(null);
    try {
      const result = await suggestEventLocation(values);
      setSuggestion(result);
      toast({ title: "Suggestion Ready!", description: "We've found a location for you." });
    } catch (error) {
      console.error("Location suggestion error:", error);
      toast({ title: "Error", description: "Could not generate suggestion. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="userPreferences"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Preferences</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., Easy parking, near public transport, indoor facility..." {...field} />
                </FormControl>
                <FormDescription>Describe what's important for you in a venue.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="sportsCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sports Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Basketball, 5-a-side Football" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., San Francisco" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="areaPreferences"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Areas within City</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Downtown, Mission District, near Golden Gate Park" {...field} />
                </FormControl>
                 <FormDescription>List any specific neighborhoods or types of areas you prefer.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="geographicalDistribution"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Geographical Distribution of Participants</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., Most participants live in the southern part of the city, some commute from East Bay." {...field} />
                </FormControl>
                <FormDescription>Where are your potential participants located?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full md:w-auto" disabled={loading}>
            {loading ? "Getting Suggestion..." : "Suggest Location"} <Lightbulb className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </Form>

      {suggestion && (
        <Card className="mt-12 bg-gradient-to-br from-primary/10 to-accent/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" /> AI Suggested Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-primary">{suggestion.suggestedLocation}</h3>
              <p className="text-foreground/80 mt-1">{suggestion.reasoning}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
