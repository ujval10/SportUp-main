
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SportEvent } from "@/types";
import { EventForm } from "@/components/forms/EventForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditEventPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [event, setEvent] = useState<SportEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { currentUser, isAdmin } = useAuth();

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      setLoading(true);
      try {
        const eventDocRef = doc(db, "events", eventId);
        const eventDocSnap = await getDoc(eventDocRef);

        if (eventDocSnap.exists()) {
          const eventData = { id: eventDocSnap.id, ...eventDocSnap.data() } as SportEvent;
          if (currentUser?.uid !== eventData.createdByUid && !isAdmin) {
             toast({ title: "Unauthorized", description: "You don't have permission to edit this event.", variant: "destructive" });
             router.push(`/events/${eventId}`);
             return;
          }
          setEvent(eventData);
        } else {
          setError("Event not found.");
          toast({ title: "Error", description: "Event not found.", variant: "destructive" });
        }
      } catch (err) {
        console.error("Error fetching event for edit:", err);
        setError("Failed to load event data.");
        toast({ title: "Error", description: "Could not fetch event details.", variant: "destructive" });
      }
      setLoading(false);
    };

    if (currentUser !== undefined) { // Ensure auth state is resolved
        fetchEvent();
    }
  }, [eventId, toast, router, currentUser, isAdmin]);


  if (loading || currentUser === undefined) { // Also wait for currentUser to be defined
    return (
       <div className="container mx-auto py-8">
        <Card className="max-w-3xl mx-auto shadow-xl">
          <CardHeader>
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <Skeleton className="h-10 w-1/3 mt-4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return <div className="container mx-auto py-8 text-center text-destructive">{error}</div>;
  }

  if (!event) {
    return <div className="container mx-auto py-8 text-center">Event data could not be loaded.</div>;
  }
  
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Edit Event</CardTitle>
          <CardDescription>Update the details for your sports event: {event.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <EventForm event={event} />
        </CardContent>
      </Card>
    </div>
  );
}
