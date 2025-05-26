
"use client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarDays, PlusCircle, Lightbulb, User } from "lucide-react";
// Image import is no longer needed if we remove the specific image component and don't add another one
// import Image from "next/image"; 

export default function DashboardPage() {
  const { userProfile } = useAuth();

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 shadow-lg border-none bg-gradient-to-r from-primary to-accent text-primary-foreground overflow-hidden">
        <CardHeader className="pb-2 text-center"> {/* Centered text for all screen sizes */}
          <CardTitle className="text-3xl font-bold">Welcome back, {userProfile?.displayName || "Sport Enthusiast"}!</CardTitle>
          <CardDescription className="text-primary-foreground/80 text-lg">
            Ready to find or create your next game?
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center gap-4 pt-2 px-6"> {/* Modified classes for centering */}
          <p className="text-base max-w-2xl">
            SportUp is your hub for all things sports. Discover local events, create your own,
            get smart location suggestions, and manage your profile. Let's get active!
          </p>
           {/* Image removed from here */}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarDays className="h-6 w-6 text-primary" />
              Browse Events
            </CardTitle>
            <CardDescription>Find upcoming sports events in your area.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Filter by sport, location, and date to find the perfect game for you.</p>
            <Button asChild className="mt-4 w-full sm:w-auto">
              <Link href="/events">Explore Events</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <PlusCircle className="h-6 w-6 text-primary" />
              Create an Event
            </CardTitle>
            <CardDescription>Organize your own sports match or tournament.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Set up your event details and invite others to join the fun.</p>
            <Button asChild className="mt-4 w-full sm:w-auto">
              <Link href="/events/new">Create New Event</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Lightbulb className="h-6 w-6 text-accent" />
              Suggest Location (AI)
            </CardTitle>
            <CardDescription>Get AI-powered recommendations for event venues.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Our smart AI helps you find the optimal location based on your preferences.</p>
            <Button asChild variant="outline" className="mt-4 w-full sm:w-auto">
              <Link href="/suggest-location">Get Suggestions</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-6 w-6 text-primary" />
              Manage Your Profile
            </CardTitle>
            <CardDescription>Keep your sports preferences and details up to date.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Update your favorite sports, skill level, and personal information.</p>
            <Button asChild variant="outline" className="mt-4 w-full sm:w-auto">
              <Link href="/profile">View Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
