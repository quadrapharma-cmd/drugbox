export interface Profile {
  id: string
  name: string
  email?: string
  headline?: string
  company?: string
  country?: string
  sector?: string
  bio?: string
  avatar_color?: string
  verified?: boolean
  certs?: string
  website?: string
  phone?: string
  specs?: string[]
  created_at?: string
}

export interface Post {
  id: string
  user_id: string
  body: string
  category: string
  created_at: string
  author?: Profile
}

export interface Listing {
  id: string
  user_id: string
  type: string
  sector: string
  title: string
  description: string
  emoji: string
  price?: string
  moq?: string
  certs?: string
  tag?: string
  created_at: string
  seller?: Profile
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  body: string
  read: boolean
  created_at: string
}

export interface Connection {
  id: string
  requester: string
  addressee: string
  status: string
  created_at: string
}

export interface Group {
  id: string
  name: string
  description: string
  emoji: string
  sector: string
  created_by: string
  created_at: string
}
