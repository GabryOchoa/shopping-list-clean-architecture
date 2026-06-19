export type ListRole = 'owner' | 'editor' | 'viewer';

export type Profile = {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  created_at: string;
};

export type List = {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type Item = {
  id: string;
  list_id: string;
  name: string;
  quantity: number;
  is_checked: boolean;
  created_at: string;
};

export type ListMember = {
  id: string;
  list_id: string;
  user_id: string;
  role: 'viewer' | 'editor';
  joined_at: string;
};
