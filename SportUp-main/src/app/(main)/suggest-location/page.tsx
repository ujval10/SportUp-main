
import { LocationSuggestionForm } from "@/components/forms/LocationSuggestionForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export default function SuggestLocationPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <Lightbulb className="h-8 w-8 text-accent" /> AI Location Suggester
          </CardTitle>
          <CardDescription>
            Let our AI help you find the perfect spot for your next sports event.
            Provide details about your event and participant distribution, and we&apos;ll suggest an optimal location.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LocationSuggestionForm />
        </CardContent>
      </Card>
    </div>
  );
}
