export type UserRole = "member" | "mentor" | "curator" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  city: string;
  age: number;
  maritalStatus: string;
  occupation: string;
  interests: string[];
  priorities: string[];
  avatar?: string;
  role: UserRole;
}

export interface Mentor {
  id: string;
  name: string;
  specialization: string;
  description: string;
  topics: string[];
  rating: number;
  reviews: number;
  materialsCount: number;
  events: EventPreview[];
  groups: GroupPreview[];
  avatar?: string;
  experience: string;
}

export interface Event {
  id: string;
  title: string;
  mentor: string;
  date: string;
  time: string;
  description: string;
  spots: number;
  spotsTotal: number;
  type: "online" | "offline";
  price: number;
  cover?: string;
  location?: string;
}

export type EventPreview = Omit<Event, "spots" | "spotsTotal" | "description" | "location">;

export interface Group {
  id: string;
  title: string;
  description: string;
  curator: string;
  spots: number;
  spotsTotal: number;
  startDate: string;
  duration: string;
  cover?: string;
  avatar?: string;
}

export type GroupPreview = Pick<Group, "id" | "title" | "startDate">;

export type ContentType = "article" | "audio" | "video" | "practice" | "collection";

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  topic: string;
  description: string;
  author: string;
  duration?: string;
  cover?: string;
  date: string;
}

export interface Topic {
  id: string;
  name: string;
  emoji: string;
  description: string;
  contentCount: number;
}

export interface Notification {
  id: string;
  type: "material" | "reply" | "message" | "event" | "group" | "reminder";
  title: string;
  body: string;
  date: string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface CommunityPost {
  id: string;
  author: string;
  avatar?: string;
  title: string;
  content: string;
  type: "introduction" | "news" | "discussion";
  date: string;
  likes: number;
  comments: number;
}
