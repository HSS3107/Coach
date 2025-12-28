export interface User {
  id: string;
  google_sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture_url?: string;
  gender?: string;
  dob?: string; // Date string
  height_cm?: number;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  goal_type: string;
  description: string;
  start_date: string;
  target_date?: string;
  start_weight_kg?: number;
  target_weight_kg: number;
  constraints?: Record<string, any>;
  preferences?: Record<string, any>;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  user_id: string;
  storage_path: string;
  resource_type: 'IMAGE' | 'PDF';
  category?: string;
  mime_type?: string;
  file_size_bytes?: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export type LogType = 'WEIGHT' | 'FOOD' | 'BODY_PHOTO' | 'MEDICAL' | 'NOTE';
export type AiStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface MasterLog {
  id: string;
  user_id: string;
  goal_id?: string;
  log_timestamp: string;
  created_at: string;
  log_type: LogType;
  source?: string;
  raw_text?: string;
  structured_data: Record<string, any>;
  resource_ids?: string[];
  ai_status: AiStatus;
  ai_coach_remark?: Record<string, any>;
  validation_meta?: Record<string, any>;
  tags?: string[];
}

export interface Chat {
  id: string;
  user_id: string;
  goal_id?: string;
  master_log_id?: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

export type SenderType = 'USER' | 'AI' | 'SYSTEM';

export interface ChatMessage {
  id: string;
  chat_id: string;
  user_id: string;
  sender_type: SenderType;
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Summary {
  id: string;
  user_id: string;
  scope_type: 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'LIFETIME';
  period_start?: string;
  period_end?: string;
  summary_text: string;
  metrics?: Record<string, any>;
  status: 'ACTIVE' | 'STALE';
  created_at: string;
}
