
import type { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  roles: ('user' | 'admin')[];
  favoriteSports: string[];
  skillLevel: string; // e.g., Beginner, Intermediate, Advanced
}

export interface SportEvent {
  id: string;
  name: string;
  sportCategory: string;
  city: string;
  area: string;
  dateTime: Timestamp;
  description: string;
  createdByUid: string;
  creatorName: string | null;
  maxParticipants?: number;
  participantsUids: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // heroImageUri?: string; // Field removed
}

// For AI Location Suggestion Form
export interface LocationSuggestionInput {
  userPreferences: string;
  sportsCategory: string;
  city: string;
  areaPreferences: string;
  geographicalDistribution: string;
}
