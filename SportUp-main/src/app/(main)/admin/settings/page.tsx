
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminSettingsPage() {
  // TODO: Implement forms for managing sports categories, cities, areas
  return (
    <div className="container mx-auto py-8">
       <Button variant="outline" asChild className="mb-4">
        <Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin Panel</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>Manage sports categories, cities, and allowed areas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Sports Categories</h3>
            <p className="text-muted-foreground">Manage the list of available sports categories here.</p>
            {/* Add form/table for categories */}
          </div>
          <div>
            <h3 className="text-lg font-semibold">Cities</h3>
            <p className="text-muted-foreground">Manage the list of supported cities.</p>
            {/* Add form/table for cities */}
          </div>
          <div>
            <h3 className="text-lg font-semibold">Areas</h3>
            <p className="text-muted-foreground">Manage allowed areas within cities.</p>
            {/* Add form/table for areas, possibly linked to cities */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
