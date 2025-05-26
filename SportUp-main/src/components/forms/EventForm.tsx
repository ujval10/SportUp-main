
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { addDoc, collection, doc, serverTimestamp, updateDoc, Timestamp, FieldValue } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { SportEvent } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

// Dummy data, replace with Firestore data if available
const sportCategories = ["Football", "Basketball", "Tennis", "Volleyball", "Badminton", "Running", "Cycling", "Yoga", "Hiking", "Swimming"];
const cities = ["New York", "London", "Paris", "Tokyo", "Berlin", "Toronto", "Sydney", "Online"];


const formSchema = z.object({
  name: z.string().min(3, { message: "Event name must be at least 3 characters." }).max(100),
  sportCategory: z.string().min(1, { message: "Please select a sport category." }),
  city: z.string().min(1, { message: "Please select a city." }),
  area: z.string().min(2, { message: "Area/Venue must be at least 2 characters." }).max(100),
  dateTime: z.date({ required_error: "Event date and time are required." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(1000),
  maxParticipants: z.coerce.number().int().positive().optional(),
});

interface EventFormProps {
  event?: SportEvent; // For editing
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const { currentUser, userProfile } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: event?.name || "",
      sportCategory: event?.sportCategory || "",
      city: event?.city || "",
      area: event?.area || "",
      dateTime: event?.dateTime ? event.dateTime.toDate() : new Date(),
      description: event?.description || "",
      maxParticipants: event?.maxParticipants || undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!currentUser) { // Check only for currentUser
      toast({ title: "Error", description: "You must be logged in to create/edit events.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setFormMessage(event ? "Updating event..." : "Creating event...");

    const eventDataDbFields: {
      name: string;
      sportCategory: string;
      city: string;
      area: string;
      dateTime: Timestamp;
      description: string;
      maxParticipants?: number;
      updatedAt: FieldValue;
    } = {
      name: values.name,
      sportCategory: values.sportCategory,
      city: values.city,
      area: values.area,
      dateTime: Timestamp.fromDate(values.dateTime),
      description: values.description,
      maxParticipants: values.maxParticipants,
      updatedAt: serverTimestamp(),
    };

    try {
      if (event) { // Editing existing event
        // Ensure user owns the event or is an admin to edit
        if (event.createdByUid !== currentUser.uid && !(userProfile?.roles?.includes('admin'))) {
            toast({ title: "Unauthorized", description: "You don't have permission to edit this event.", variant: "destructive" });
            setLoading(false);
            return;
        }
        const eventRef = doc(db, "events", event.id);
        await updateDoc(eventRef, eventDataDbFields);
        toast({ title: "Success", description: "Event updated successfully." });
        router.push(`/events/${event.id}`);
      } else { // Creating new event
        const creatorDisplayName = userProfile?.displayName || currentUser.displayName || "SportUp User";
        
        const newEventData = {
          ...eventDataDbFields,
          createdByUid: currentUser.uid,
          creatorName: creatorDisplayName,
          participantsUids: [],
          createdAt: serverTimestamp(),
        };
        const docRef = await addDoc(collection(db, "events"), newEventData);
        toast({ title: "Success", description: "Event created successfully." });
        router.push(`/events/${docRef.id}`);
      }
    } catch (error) {
      console.error("Event form error:", error);
      toast({ title: "Error", description: "Failed to save event. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
      setFormMessage(null);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Weekend Football Match" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="sportCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sport Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sport" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sportCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
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
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a city or Online" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="area"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Area / Venue</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Central Park Field 5 or Discord Server Link" {...field} />
              </FormControl>
              <FormDescription>
                Specify the location or online platform for the event.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="dateTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date and Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP HH:mm")
                        ) : (
                          <span>Pick a date and time</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                          const currentTime = field.value || new Date();
                          date.setHours(currentTime.getHours());
                          date.setMinutes(currentTime.getMinutes());
                          field.onChange(date);
                        }
                      }}
                      disabled={(date) => date < new Date(new Date().setDate(new Date().getDate()-1))}
                      initialFocus
                    />
                    <div className="p-2 border-t">
                      <label htmlFor="event-time" className="text-sm font-medium">Time:</label>
                      <Input
                        type="time"
                        id="event-time"
                        className="mt-1"
                        value={field.value ? format(field.value, "HH:mm") : format(new Date(), "HH:mm")}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(':').map(Number);
                          const newDate = field.value ? new Date(field.value) : new Date();
                          newDate.setHours(hours);
                          newDate.setMinutes(minutes);
                          field.onChange(newDate);
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxParticipants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Participants (Optional)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 10" {...field}
                  value={field.value === undefined ? '' : field.value}
                  onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value,10))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us more about the event, rules, what to bring, etc."
                  className="resize-y min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full md:w-auto" disabled={loading}>
          {loading ? (formMessage || (event ? "Updating Event..." : "Creating Event...")) : (event ? "Update Event" : "Create Event")}
        </Button>
         {loading && formMessage && <p className="text-sm text-muted-foreground mt-2">{formMessage}</p>}
      </form>
    </Form>
  );
}

    