
"use client";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Users, ListChecks, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminPage() {
  const { userProfile, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/dashboard"); // Redirect non-admins
    }
  }, [userProfile, isAdmin, loading, router]);

  if (loading) {
    return <div className="container mx-auto py-8 text-center">Loading admin panel...</div>;
  }

  if (!isAdmin) {
    // This should ideally be caught by the redirect, but as a fallback
    return <div className="container mx-auto py-8 text-center">Access Denied.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center">
            <ShieldCheck className="mr-3 h-8 w-8 text-primary" />
            Admin Panel
          </CardTitle>
          <CardDescription>Manage users, events, and application settings.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-6 w-6 text-primary" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>View and manage user accounts, roles, and permissions.</p>
            <Button asChild className="mt-4 w-full sm:w-auto" variant="outline">
              <Link href="/admin/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ListChecks className="h-6 w-6 text-primary" />
              Event Moderation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Review, approve, or remove event listings submitted by users.</p>
             <Button asChild className="mt-4 w-full sm:w-auto" variant="outline">
              <Link href="/admin/events">Moderate Events</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Map className="h-6 w-6 text-primary" />
              Manage Categories & Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Add, edit, or remove sports categories, cities, and areas.</p>
             <Button asChild className="mt-4 w-full sm:w-auto" variant="outline">
              <Link href="/admin/settings">App Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
       <Card className="mt-8">
        <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>Key metrics and quick stats (placeholder).</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Total Users: [Count]</p>
            <p>Active Events: [Count]</p>
            <p>Pending Moderation: [Count]</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Placeholder pages for admin sections (to be implemented)
// src/app/(main)/admin/users/page.tsx
// src/app/(main)/admin/events/page.tsx
// src/app/(main)/admin/settings/page.tsx
