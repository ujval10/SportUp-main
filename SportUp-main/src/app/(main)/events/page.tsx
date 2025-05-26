
"use client";
import { useState, useEffect, useMemo } from "react";
import type { SportEvent } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { collection, getDocs, query, where, Timestamp, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { format, parseISO } from 'date-fns';
import { MapPin, CalendarDays, Users, Trash2, Edit3, Search, FilterX, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
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
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

// Dummy data for categories and cities, replace with Firestore data if available
const sportCategories = ["Football", "Basketball", "Tennis", "Volleyball", "Badminton", "Running", "Cycling", "Yoga", "Hiking", "Swimming", "Cricket", "Table Tennis"];
const cities = ["New York", "London", "Paris", "Tokyo", "Berlin", "Toronto"];

// Define a mapping for sport categories to their image extensions for cards
const cardSportImageExtensions: { [key: string]: string } = {
  'badminton': 'jpg',
  'basketball': 'png', // Keeping basketball
  'cycling': 'jpg',
  'football': 'png',
  'hiking': 'jpg',
  'running': 'jpg',
  'swimming': 'jpg',
  'tennis': 'jpg',
  'volleyball': 'jpeg',
  'yoga': 'jpg',
  // Add other categories and their extensions here
};

const getEventCardImagePathDetails = (category?: string): { path: string, placeholderText: string } => {
  const defaultPlaceholderText = 'Event';
  const defaultImagePath = `https://placehold.co/600x300.png?text=${encodeURIComponent(defaultPlaceholderText)}`;

  if (!category) {
    return { path: defaultImagePath, placeholderText: defaultPlaceholderText };
  }

  const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
  const extension = cardSportImageExtensions[categorySlug];

  if (extension) {
    return {
      path: `/images/event-categories/${categorySlug}.${extension}`,
      placeholderText: category,
    };
  }
  // Fallback if category or its extension is not in our map
  return { 
    path: `https://placehold.co/600x300.png?text=${encodeURIComponent(category)}`, 
    placeholderText: category 
  };
};

interface EventCardImageProps {
  sportCategory?: string;
  eventName: string;
}

const EventCardImage: React.FC<EventCardImageProps> = ({ sportCategory, eventName }) => {
  const initialDetails = getEventCardImagePathDetails(sportCategory);
  const [imageSrc, setImageSrc] = useState<string>(initialDetails.path);
  const [imageAlt, setImageAlt] = useState<string>(eventName || initialDetails.placeholderText);

  useEffect(() => {
    const details = getEventCardImagePathDetails(sportCategory);
    setImageSrc(details.path);
    setImageAlt(eventName || details.placeholderText);
  }, [sportCategory, eventName]);

  return (
    <Image 
      src={imageSrc}
      alt={imageAlt} 
      width={600} 
      height={300} 
      className="w-full h-48 object-cover"
      onError={() => {
        const fallbackDetails = getEventCardImagePathDetails(sportCategory);
        setImageSrc(`https://placehold.co/600x300.png?text=${encodeURIComponent(fallbackDetails.placeholderText)}`);
      }}
    />
  );
};


export default function EventsPage() {
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<SportEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [sportFilter, setSportFilter] = useState<string>("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { toast } = useToast();
  const { currentUser, isAdmin } = useAuth();


  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const eventsCollection = collection(db, "events");
        const q = query(eventsCollection, orderBy("dateTime", "asc"));
        const querySnapshot = await getDocs(q);
        const fetchedEvents: SportEvent[] = [];
        querySnapshot.forEach((doc) => {
          fetchedEvents.push({ id: doc.id, ...doc.data() } as SportEvent);
        });
        setEvents(fetchedEvents);
        setFilteredEvents(fetchedEvents); 
      } catch (error) {
        console.error("Error fetching events:", error);
        toast({ title: "Error", description: "Could not fetch events.", variant: "destructive" });
      }
      setLoading(false);
    };
    fetchEvents();
  }, [toast]);

  useEffect(() => {
    let currentEvents = [...events];

    if (selectedDate) {
      currentEvents = currentEvents.filter(event => 
        event.dateTime && format(event.dateTime.toDate(), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
      );
    }
    if (sportFilter) {
      currentEvents = currentEvents.filter(event => event.sportCategory === sportFilter);
    }
    if (cityFilter) {
      currentEvents = currentEvents.filter(event => event.city === cityFilter);
    }
    if (searchTerm) {
      currentEvents = currentEvents.filter(event => 
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredEvents(currentEvents);
  }, [selectedDate, sportFilter, cityFilter, searchTerm, events]);
  
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const clearFilters = () => {
    setSelectedDate(undefined);
    setSportFilter("");
    setCityFilter("");
    setSearchTerm("");
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, "events", eventId));
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      toast({ title: "Success", description: "Event deleted successfully." });
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({ title: "Error", description: "Failed to delete event.", variant: "destructive" });
    }
  };
  
  const eventDates = useMemo(() => {
    return events.map(event => event.dateTime.toDate());
  }, [events]);

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Browse Sports Events</CardTitle>
          <CardDescription>Find and join sports activities happening near you or online.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold mb-2">Filter Events</h3>
            <Input 
              placeholder="Search by name, area, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              prefixIcon={<Search className="h-4 w-4 text-muted-foreground" />}
            />
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by Sport" />
              </SelectTrigger>
              <SelectContent>
                {sportCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by City" />
              </SelectTrigger>
              <SelectContent>
                {cities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={clearFilters} variant="outline" className="w-full">
              <FilterX className="mr-2 h-4 w-4" /> Clear Filters
            </Button>
             <h3 className="text-lg font-semibold pt-4 mb-2">Select Date</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border shadow-sm w-full"
              modifiers={{ eventDates }}
              modifiersClassNames={{ eventDates: 'bg-primary/20 rounded-full' }}
            />
          </div>
          <div className="md:col-span-2 space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1,2].map(i => (
                  <Card key={i} className="flex flex-col overflow-hidden">
                    <Skeleton className="w-full h-48" />
                    <CardHeader>
                      <Skeleton className="h-6 bg-muted rounded w-3/4 mb-1"></Skeleton>
                      <Skeleton className="h-4 bg-muted rounded w-1/2"></Skeleton>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                      <Skeleton className="h-4 bg-muted rounded w-full"></Skeleton>
                      <Skeleton className="h-4 bg-muted rounded w-5/6"></Skeleton>
                    </CardContent>
                    <CardFooter>
                       <Skeleton className="h-8 bg-muted rounded w-1/4"></Skeleton>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <EventCardImage sportCategory={event.sportCategory} eventName={event.name} />
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-primary">{event.name}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">{event.sportCategory}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                      <p className="flex items-center text-sm"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" /> {event.area}, {event.city}</p>
                      <p className="flex items-center text-sm"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" /> {format(event.dateTime.toDate(), 'PPP p')}</p>
                      <p className="text-sm line-clamp-2">{event.description}</p>
                      <p className="flex items-center text-sm"><Users className="mr-2 h-4 w-4 text-muted-foreground" /> {event.participantsUids?.length || 0} / {event.maxParticipants || 'Unlimited'} participants</p>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center pt-4 border-t">
                       <Button variant="ghost" size="sm" asChild>
                         <Link href={`/events/${event.id}`}>
                           <span className="flex items-center"> {/* Wrapped content in a span */}
                             View Details <ExternalLink className="ml-2 h-4 w-4" />
                           </span>
                          </Link>
                       </Button>
                      {(currentUser?.uid === event.createdByUid || isAdmin) && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" asChild>
                             <Link href={`/events/${event.id}/edit`} title="Edit Event">
                               <Edit3 className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon" title="Delete Event">
                                <Trash2 className="h-4 w-4" />
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
                                <AlertDialogAction onClick={() => handleDeleteEvent(event.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-lg text-muted-foreground">No events found matching your criteria.</p>
                  <p className="text-sm">Try adjusting your filters or selected date.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    