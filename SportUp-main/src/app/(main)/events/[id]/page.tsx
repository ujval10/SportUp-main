
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, Timestamp, deleteDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import type { SportEvent, UserProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, MapPin, Users, Info, Edit3, Trash2, UserPlus, UserMinus } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Define a mapping for sport categories to their image extensions
const sportImageExtensions: { [key: string]: string } = {
  'badminton': 'jpg',
  'basketball': 'png',
  'cycling': 'jpg',
  'football': 'png',
  'hiking': 'jpg',
  'running': 'jpg',
  'swimming': 'jpg',
  'tennis': 'jpg',
  'volleyball': 'jpeg',
  'yoga': 'jpg',
  // Add other categories and their extensions here if you have more
};

const getEventImagePathDetails = (category?: string): { path: string, placeholderText: string } => {
  const defaultPlaceholderText = 'Event';
  // Path to your generic default image if you have one, or a general placehold.co URL
  const defaultImagePath = `https://placehold.co/1200x400.png?text=${encodeURIComponent(defaultPlaceholderText)}`;

  if (!category) {
    return { path: defaultImagePath, placeholderText: defaultPlaceholderText };
  }

  const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
  const extension = sportImageExtensions[categorySlug];

  if (extension) {
    return {
      path: `/images/event-categories/${categorySlug}.${extension}`,
      placeholderText: category,
    };
  }
  // Fallback if category or its extension is not in our map
  return { 
    path: `https://placehold.co/1200x400.png?text=${encodeURIComponent(category)}`, 
    placeholderText: category 
  };
};


export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [event, setEvent] = useState<SportEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatorProfile, setCreatorProfile] = useState<Partial<UserProfile> | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const { currentUser, userProfile, isAdmin } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [heroImageSrc, setHeroImageSrc] = useState<string>('');
  const [heroImageAlt, setHeroImageAlt] = useState<string>('Event');


  useEffect(() => {
    if (event) {
      const details = getEventImagePathDetails(event.sportCategory);
      setHeroImageSrc(details.path);
      setHeroImageAlt(event.name || details.placeholderText);
    } else if (!loading) { // Only set default placeholder if not loading and no event
      const details = getEventImagePathDetails();
      setHeroImageSrc(details.path);
      setHeroImageAlt(details.placeholderText);
    }
  }, [event, loading]);

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      setLoading(true);
      try {
        const eventDocRef = doc(db, "events", eventId);
        const eventDocSnap = await getDoc(eventDocRef);

        if (eventDocSnap.exists()) {
          const eventData = { id: eventDocSnap.id, ...eventDocSnap.data() } as SportEvent;
          setEvent(eventData);

          if (eventData.createdByUid) {
            const userDocRef = doc(db, "users", eventData.createdByUid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              setCreatorProfile(userDocSnap.data() as UserProfile);
            }
          }
        } else {
          toast({ title: "Error", description: "Event not found.", variant: "destructive" });
          router.push("/events");
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
        toast({ title: "Error", description: "Could not fetch event details.", variant: "destructive" });
      }
      setLoading(false);
    };

    fetchEvent();
  }, [eventId, toast, router]);

  const handleJoinLeaveEvent = async () => {
    if (!currentUser || !event) return;
    setIsJoining(true);
    const eventRef = doc(db, "events", event.id);
    const userIsParticipant = event.participantsUids?.includes(currentUser.uid);

    try {
      if (userIsParticipant) {
        await updateDoc(eventRef, {
          participantsUids: arrayRemove(currentUser.uid)
        });
        setEvent(prev => prev ? { ...prev, participantsUids: prev.participantsUids.filter(uid => uid !== currentUser.uid) } : null);
        toast({ title: "Success", description: "You have left the event." });
      } else {
        // Check if event is full before joining
        const isEventFull = typeof event.maxParticipants === 'number' && 
                            event.participantsUids.length >= event.maxParticipants;
        if (isEventFull) {
          toast({ title: "Event Full", description: "Sorry, this event is already full.", variant: "destructive" });
          setIsJoining(false);
          return;
        }
        await updateDoc(eventRef, {
          participantsUids: arrayUnion(currentUser.uid)
        });
        setEvent(prev => prev ? { ...prev, participantsUids: [...prev.participantsUids, currentUser.uid] } : null);
        toast({ title: "Success", description: "You have joined the event!" });
      }
    } catch (error) {
      console.error("Error joining/leaving event:", error);
      toast({ title: "Error", description: "Could not update participation status.", variant: "destructive" });
    } finally {
      setIsJoining(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!event) return;
    try {
      await deleteDoc(doc(db, "events", event.id));
      toast({ title: "Success", description: "Event deleted successfully." });
      router.push("/events");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({ title: "Error", description: "Failed to delete event.", variant: "destructive" });
    }
  };

  if (loading || !event) {
    return (
      <div className="container mx-auto py-8">
        <Card className="shadow-xl">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <Skeleton className="w-full h-64" />
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-28" />
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  const userIsParticipant = currentUser && event.participantsUids?.includes(currentUser.uid);
  const canEditOrDelete = currentUser?.uid === event.createdByUid || isAdmin;

  // Determine if the event is full
  const isEventFull = typeof event.maxParticipants === 'number' && 
                      event.participantsUids.length >= event.maxParticipants;

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="relative p-0">
          <Image 
            src={heroImageSrc}
            alt={heroImageAlt} 
            width={1200} 
            height={400} 
            className="w-full h-64 object-cover"
            priority
            onError={() => {
              const fallbackDetails = getEventImagePathDetails(event?.sportCategory);
              setHeroImageSrc(`https://placehold.co/1200x400.png?text=${encodeURIComponent(fallbackDetails.placeholderText)}`);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <CardTitle className="text-4xl font-bold text-white shadow-sm">{event.name}</CardTitle>
            <CardDescription className="text-lg text-primary-foreground/80">{event.sportCategory}</CardDescription>
          </div>
           {canEditOrDelete && (
            <div className="absolute top-4 right-4 flex gap-2">
              <Button variant="secondary" size="icon" asChild>
                <Link href={`/events/${event.id}/edit`} title="Edit Event">
                  <Edit3 className="h-5 w-5" />
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon" title="Delete Event">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the event "{event.name}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteEvent}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="pt-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold flex items-center"><Info className="mr-2 h-5 w-5 text-primary" /> About this event</h3>
              <p className="text-foreground/80 leading-relaxed">{event.description}</p>
            </div>
            
            {creatorProfile && (
               <div className="space-y-1 bg-secondary/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Organized by</h3>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={creatorProfile.photoURL || undefined} alt={creatorProfile.displayName || "Creator"} />
                    <AvatarFallback>{creatorProfile.displayName?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <span>{creatorProfile.displayName || 'SportUp User'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 md:border-l md:pl-6">
            <h3 className="text-xl font-semibold">Event Details</h3>
            <p className="flex items-start text-foreground/90">
              <MapPin className="mr-3 h-5 w-5 text-primary flex-shrink-0 mt-1" /> 
              <span>{event.area}, {event.city}</span>
            </p>
            <p className="flex items-start text-foreground/90">
              <CalendarDays className="mr-3 h-5 w-5 text-primary flex-shrink-0 mt-1" /> 
              <span>{format(event.dateTime.toDate(), 'EEEE, MMMM d, yyyy')} at {format(event.dateTime.toDate(), 'p')}</span>
            </p>
            <p className="flex items-start text-foreground/90">
              <Users className="mr-3 h-5 w-5 text-primary flex-shrink-0 mt-1" /> 
              <span>
                {event.participantsUids?.length || 0}
                {event.maxParticipants ? ` / ${event.maxParticipants}` : ''} participants
                {event.maxParticipants && event.participantsUids?.length >= event.maxParticipants && <span className="ml-2 text-sm font-medium text-destructive">(Full)</span>}
              </span>
            </p>
             {currentUser && (
              <Button 
                onClick={handleJoinLeaveEvent} 
                disabled={isJoining || (!userIsParticipant && isEventFull)}
                className="w-full mt-4"
                variant={userIsParticipant ? "outline" : "default"}
              >
                {isJoining ? (userIsParticipant ? "Leaving..." : "Joining...") : (userIsParticipant ? <UserMinus className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />)}
                {userIsParticipant ? "Leave Event" : "Join Event"}
              </Button>
            )}
            {!currentUser && (
                 <Button asChild className="w-full mt-4">
                    <Link href="/login">Login to Join</Link>
                 </Button>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4">
           <p className="text-xs text-muted-foreground">Event created on {format(event.createdAt.toDate(), 'PP')}. Last updated {format(event.updatedAt.toDate(), 'PPp')}</p>
        </CardFooter>
      </Card>
    </div>
  );
}
