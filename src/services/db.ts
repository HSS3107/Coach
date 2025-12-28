import { supabase } from '../lib/supabase';
import type { User, Goal, MasterLog, Resource, Chat, ChatMessage } from '../types/schema';

// --- USER ---
export const getUserByEmail = async (_db: any, email: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
    console.error('Error fetching user:', error);
  }
  return data || null;
};

export const getUserById = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user by ID:', error);
  }
  return data || null;
};

export const createUser = async (_db: any, email: string, name: string | undefined, id: string): Promise<User> => {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      id, // CRITICAL: Sync with Supabase Auth ID
      email,
      name: name || email.split('@')[0],
      email_verified: true
      // google_sub removed - effectively null
    }])
    .select()
    .single();

  if (error) {
    console.error("DB Create User Error:", error);
    throw error;
  }
  return data;
};

export const updateUserProfile = async (_db: any, userId: string, data: Partial<User>): Promise<User> => {
  const { data: updated, error } = await supabase
    .from('users')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return updated;
};

// --- GOALS ---
export const getActiveGoal = async (_db: any, userId: string): Promise<Goal | null> => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') console.error(error);
  return data || null;
};

export const createGoal = async (_db: any, userId: string, goalData: Partial<Goal>): Promise<Goal> => {
  // Parse numeric fields to ensure they satisfy float/numeric types
  const startWeight = typeof goalData.start_weight_kg === 'string' ? parseFloat(goalData.start_weight_kg) : goalData.start_weight_kg;
  const targetWeight = typeof goalData.target_weight_kg === 'string' ? parseFloat(goalData.target_weight_kg) : goalData.target_weight_kg;

  // Archive old goals
  await supabase
    .from('goals')
    .update({ status: 'ARCHIVED' })
    .eq('user_id', userId)
    .eq('status', 'ACTIVE');

  const { data, error } = await supabase
    .from('goals')
    .insert([{
      user_id: userId,
      goal_type: goalData.goal_type,
      description: goalData.description,
      start_date: goalData.start_date || new Date().toISOString(),
      target_date: goalData.target_date,
      start_weight_kg: startWeight,
      target_weight_kg: targetWeight,
      status: 'ACTIVE'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateGoal = async (_db: any, userId: string, goalId: string, updates: Partial<Goal>): Promise<Goal> => {
  const { data, error } = await supabase
    .from('goals')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', goalId)
    .eq('user_id', userId) // Security check
    .select()
    .single();

  if (error) throw error;
  return data;
};

// --- LOGS ---
export const getRecentLogs = async (_db: any, userId: string, limit = 50): Promise<MasterLog[]> => {
  const { data, error } = await supabase
    .from('master_logs')
    .select('*')
    .eq('user_id', userId)
    .order('log_timestamp', { ascending: false })
    .limit(limit);

  if (error) console.error(error);
  return data || [];
};

export const createLog = async (_db: any, logData: Partial<MasterLog>): Promise<MasterLog> => {
  const { data, error } = await supabase
    .from('master_logs')
    .insert([{
      user_id: logData.user_id,
      goal_id: logData.goal_id,
      log_timestamp: logData.log_timestamp,
      log_type: logData.log_type,
      raw_text: logData.raw_text,
      structured_data: logData.structured_data || {},
      resource_ids: logData.resource_ids || [],
      ai_status: 'PENDING'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// --- RESOURCES ---
export const createResource = async (_db: any, resData: Partial<Resource>): Promise<Resource> => {
  const { data, error } = await supabase
    .from('resources')
    .insert([{
      user_id: resData.user_id,
      storage_path: resData.storage_path, // Base64 for now as per previous logic, or URL
      resource_type: resData.resource_type,
      category: resData.category,
      mime_type: resData.mime_type
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// --- CHATS ---
export const getChatForLog = async (_db: any, logId: string): Promise<Chat | null> => {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('master_log_id', logId)
    .single();

  if (error && error.code !== 'PGRST116') console.error(error);
  return data || null;
};

export const createChat = async (_db: any, userId: string, logId: string | null): Promise<Chat> => {
  const { data, error } = await supabase
    .from('chats')
    .insert([{
      user_id: userId,
      master_log_id: logId || null
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const addMessage = async (_db: any, chatId: string, userId: string, sender: string, content: string): Promise<ChatMessage> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([{
      chat_id: chatId,
      user_id: userId,
      sender_type: sender,
      content: content
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getMessages = async (chatId: string): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) console.error(error);
  return data || [];
};
