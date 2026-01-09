// Type definitions for the Five Phase Hackathon Platform

export interface User {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  role: 'participant' | 'judge' | 'admin';
  is_active: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  last_login?: string; // ISO date string
  profile_image_url?: string;
  bio?: string;
  skills?: string[];
  gdpr_consent: boolean;
}

export interface Token {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  password: string;
  gdpr_consent: boolean;
}

export interface UserProfileUpdate {
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
  bio?: string;
  skills?: string[];
}

export interface Hackathon {
  id: string;
  name: string;
  description?: string;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  registration_start: string; // ISO date string
  registration_end: string; // ISO date string
  status: 'draft' | 'registration_open' | 'ideation' | 'development' | 'submission' | 'judging' | 'finished';
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  created_by: string;
  max_teams?: number;
  max_participants?: number;
  prizes?: any; // JSON structure
  rules?: string;
  is_active: boolean;
}

export interface Phase {
  id: string;
  name: 'registration' | 'ideation' | 'development' | 'submission' | 'judging';
  display_name: string;
  start_time: string; // ISO date string
  end_time: string; // ISO date string
  hackathon_id: string;
  is_active: boolean;
  is_current: boolean;
  order: number;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  hackathon_id: string;
  owner_id: string;
  max_members: number;
  current_members: number;
  status: 'active' | 'inactive' | 'archived';
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  my_role: 'member' | 'admin' | 'owner';
}

export interface Submission {
  id: string;
  team_id: string;
  hackathon_id: string;
  phase_id: string;
  title: string;
  description: string;
  repository_url?: string;
  demo_url?: string;
  video_url?: string;
  additional_files?: string[]; // Array of file URLs/paths
  submitted_at: string; // ISO date string
  updated_at: string; // ISO date string
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  submitted_by: string;
  team?: {
    id: string;
    name: string;
  };
  files?: SubmissionFile[];
}

export interface SubmissionFile {
  id: string;
  submission_id: string;
  filename: string;
  file_path: string;
  file_size: number; // in bytes
  mime_type: string;
  uploaded_at: string; // ISO date string
  uploaded_by: string;
  is_source_code: boolean;
}

export interface Evaluation {
  id: string;
  submission_id: string;
  judge_id: string; // UUID of the judge user
  scores: Record<string, number>; // Object with criteria as keys and scores as values
  total_score: number;
  feedback?: string;
  evaluated_at: string; // ISO date string
  updated_at: string; // ISO date string
  status: 'pending' | 'in_progress' | 'completed';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'phase_change' | 'deadline' | 'announcement' | 'submission_result';
  is_read: boolean;
  sent_at: string; // ISO date string
  read_at?: string; // ISO date string
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date?: string; // ISO date string
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  assigned_to?: string; // User ID
  created_by: string; // User ID
  project_id?: string;
  tags?: string[];
}