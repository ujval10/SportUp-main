
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormReset } from "react-hook-form"; // Import UseFormReset
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db, storage, auth } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, FieldValue } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile as updateAuthProfile } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback } from "react"; // Import useCallback
import { Mail, UserCircle, Award, Shield, Edit2, ImageUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserProfile } from "@/types";

const profileFormSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters.").max(50),
  favoriteSports: z.string().optional(),
  skillLevel: z.string().min(1, "Please select a skill level."),
  photoFile: z.instanceof(File).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const skillLevels = ["Beginner", "Intermediate", "Advanced", "Professional"];
const sportOptions = ["Football", "Basketball", "Tennis", "Volleyball", "Badminton", "Running", "Cycling", "Yoga", "Hiking", "Swimming", "Cricket", "Table Tennis"];


export default function ProfilePage() {
  const { currentUser, userProfile, loading: authLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  const [formLoading, setFormLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
      favoriteSports: "",
      skillLevel: "Beginner",
      photoFile: undefined,
    },
  });

  // Destructure reset for stable reference if needed as dependency
  const { reset: formReset } = form;

  useEffect(() => {
    if (authLoading) return; 

    let defaultVals: ProfileFormValues = {
      displayName: "",
      favoriteSports: "",
      skillLevel: "Beginner",
      photoFile: undefined,
    };

    if (userProfile) {
      defaultVals = {
        displayName: userProfile.displayName || currentUser?.displayName || "",
        favoriteSports: userProfile.favoriteSports?.join(", ") || "",
        skillLevel: userProfile.skillLevel || "Beginner",
        photoFile: undefined,
      };
      setPreviewImage(userProfile.photoURL || currentUser?.photoURL || null);
    } else if (currentUser) { 
      defaultVals = {
        displayName: currentUser.displayName || "",
        favoriteSports: "",
        skillLevel: "Beginner",
        photoFile: undefined,
      };
      setPreviewImage(currentUser.photoURL || null);
    } else {
        setPreviewImage(null);
    }
    formReset(defaultVals); // Use the stable formReset reference

  }, [userProfile, currentUser, authLoading, formReset]); // Depend on formReset

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("photoFile", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      form.setValue("photoFile", undefined); 
      setPreviewImage(userProfile?.photoURL || currentUser?.photoURL || null);
    }
  };

  async function onSubmit(values: ProfileFormValues) {
    if (!currentUser) return;
    setFormLoading(true);

    try {
      let newPhotoURL = userProfile?.photoURL || currentUser?.photoURL || null;
      if (values.photoFile) {
        const storageRef = ref(storage, `profile_pictures/${currentUser.uid}/${values.photoFile.name}`);
        await uploadBytes(storageRef, values.photoFile);
        newPhotoURL = await getDownloadURL(storageRef);
      }

      const profileDataToSave: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt' | 'email'> & { email?: string | null, updatedAt: FieldValue, createdAt?: FieldValue } = {
        displayName: values.displayName,
        photoURL: newPhotoURL,
        favoriteSports: values.favoriteSports?.split(",").map(s => s.trim()).filter(Boolean) || [],
        skillLevel: values.skillLevel,
        roles: userProfile?.roles || ['user'], 
        updatedAt: serverTimestamp(),
      };
      
      if (currentUser.email) { // Ensure email is only added if present
          profileDataToSave.email = currentUser.email;
      }
      
      if (!userProfile) {
        profileDataToSave.createdAt = serverTimestamp();
         if (!profileDataToSave.email && currentUser.email) { // ensure email on creation if not set
            profileDataToSave.email = currentUser.email;
        }
      }

      const userDocRef = doc(db, "users", currentUser.uid);
      await setDoc(userDocRef, profileDataToSave, { merge: true });

      if (auth.currentUser) {
         await updateAuthProfile(auth.currentUser, {
            displayName: values.displayName,
            photoURL: newPhotoURL,
         });
      }
      
      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
      setEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    } finally {
      setFormLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader className="items-center text-center">
            <Skeleton className="h-24 w-24 rounded-full mb-4" />
            <Skeleton className="h-7 w-1/2 mb-1" />
            <Skeleton className="h-5 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!currentUser && !authLoading) {
    return <div className="container mx-auto py-8 text-center">Please log in to view your profile.</div>;
  }
  
  const displayDisplayName = editing ? form.getValues("displayName") : (userProfile?.displayName || currentUser?.displayName || "User");
  const displayEmail = currentUser?.email; // currentUser is guaranteed to exist here
  const displayPhotoURL = previewImage || userProfile?.photoURL || currentUser?.photoURL;
  const displayFavoriteSports = editing? form.getValues("favoriteSports") : (userProfile?.favoriteSports?.join(', ') || "Not specified");
  const displaySkillLevel = editing ? form.getValues("skillLevel") : (userProfile?.skillLevel || "Not specified");


  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="items-center text-center relative">
          <div className="relative group">
            <Avatar className="w-24 h-24 text-3xl mb-4 border-4 border-primary/50 shadow-md">
              <AvatarImage src={displayPhotoURL || undefined} alt={displayDisplayName} />
              <AvatarFallback>{displayDisplayName?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            {editing && (
              <label htmlFor="photoFile" className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <ImageUp className="h-8 w-8 text-white" />
                <input type="file" id="photoFile" className="hidden" onChange={handleFileChange} accept="image/*" />
              </label>
            )}
          </div>
          <CardTitle className="text-3xl font-bold">{displayDisplayName}</CardTitle>
          {displayEmail && (
            <CardDescription className="text-lg text-muted-foreground flex items-center">
              <Mail className="mr-2 h-4 w-4"/>{displayEmail}
            </CardDescription>
          )}
          {isAdmin && <p className="text-sm text-accent font-semibold flex items-center mt-1"><Shield className="mr-1 h-4 w-4"/>Administrator</p>}
          {!editing && currentUser && ( // Ensure currentUser exists before showing edit button
             <Button variant="outline" size="sm" className="absolute top-4 right-4" onClick={() => setEditing(true)}>
              <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="favoriteSports"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Favorite Sports</FormLabel>
                      <FormControl>
                         <Input placeholder="e.g., Football, Tennis, Basketball" {...field} />
                      </FormControl>
                      <FormDescription>Comma-separated list of your favorite sports.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="skillLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your skill level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {skillLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Hidden input for photoFile is handled by handleFileChange and form.setValue */}
                <div className="flex gap-4">
                  <Button type="submit" disabled={formLoading}>
                    {formLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setEditing(false);
                    // Reset form to original (or default) values
                    let resetVals: ProfileFormValues = {
                        displayName: userProfile?.displayName || currentUser?.displayName || "",
                        favoriteSports: userProfile?.favoriteSports?.join(", ") || "",
                        skillLevel: userProfile?.skillLevel || "Beginner",
                        photoFile: undefined,
                    };
                    if (!userProfile && currentUser) {
                        resetVals = {
                            displayName: currentUser.displayName || "",
                            favoriteSports: "",
                            skillLevel: "Beginner",
                            photoFile: undefined,
                        };
                    } else if (!currentUser) { // Should not happen if view is protected
                         resetVals = {
                            displayName: "", favoriteSports: "", skillLevel: "Beginner", photoFile: undefined
                        };
                    }
                    form.reset(resetVals);
                    setPreviewImage(userProfile?.photoURL || currentUser?.photoURL || null);
                  }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground flex items-center"><UserCircle className="mr-2 h-5 w-5" />Display Name</Label>
                <p className="text-lg">{displayDisplayName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 lucide lucide-swords"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="m14.5 3.5-4 4L2 16l6 6 8.5-8.5 4-4L14.5 3.5z"></path><path d="m18 2-6 6"></path><path d="m2 16 6 6L22 8l-6-6-3.5 3.5Z"></path></g></svg>
                  Favorite Sports
                </Label>
                <p className="text-lg">{displayFavoriteSports}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground flex items-center"><Award className="mr-2 h-5 w-5" />Skill Level</Label>
                <p className="text-lg">{displaySkillLevel}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

