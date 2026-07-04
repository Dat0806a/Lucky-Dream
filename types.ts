
export enum GarmentType {
  TOP = 'TOP',
  BOTTOM = 'BOTTOM',
  FULL_BODY = 'FULL_BODY'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  level: string;
  provider: 'email';
}

export interface Garment {
  id: string;
  type: GarmentType;
  image: string; // base64
  name: string;
}

export interface Comment {
  id: string;
  userName: string;
  content: string;
}

export interface Message {
  id: string;
  text: string;
  time: string;
  isMe: boolean;
  isEdited?: boolean;
  isRecalled?: boolean;
  reaction?: string;
  replyTo?: {
    userName: string;
    text: string;
  };
}

export interface ChatConversation {
  id: string;
  userName: string;
  userLevel: string;
  avatar: string;
  lastMessage: string;
  messages: Message[];
  isVirtual?: boolean;
  virtualPost?: {
    id: string;
    topImage: string;
    bottomImage: string;
    description: string;
    actionType: string;
  };
}

export type TransactionType = 'Bán' | 'Mua' | 'Thuê' | 'Chia sẻ';

export interface Post {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    level: string;
  };
  time: string;
  description: string;
  topImage: string;
  bottomImage: string;
  location: string;
  tags: string[];
  transactionType?: TransactionType;
  stats: {
    likes: number;
    comments: number;
  };
  sampleComments: Comment[];
  isDraft?: boolean;
  isVirtual?: boolean;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'system' | 'mention';
  message: string;
  avatar?: string;
  read: boolean;
  createdAt: string;
}

export interface FashionStyle {
  id: string;
  name: string;
  icon: string;
  bannerImage: string;
  description: string;
  knowledge: string;
  characteristics: string[];
  characteristicItems: string[];
  representativeOutfit: {
    name: string;
    description: string;
    image: string;
  };
  gallery: string[];
  stylingTips: string[];
  accessories: string[];
}

export interface TravelLocation {
  name: string;
  address: string;
  description: string;
  specialtyFood: string;
  foodAddress: string;
}

export interface TravelPlan {
  luxury: TravelLocation[];
  local: TravelLocation[];
  transportation: {
    service: string;
    description: string;
    contactInfo: string;
  }[];
  culturalNote: string;
}

export interface OutfitAnalysis {
  score: number;
  style: string;
  items: string[];
  tags: string[];
  advice: string[];
  timestamp: string;
}

export interface GeminiOutfitResponse {
  outfits: {
    topIndex?: number;
    bottomIndex?: number;
    fullBodyIndex?: number;
    name: string;
    description: string;
    personality: string;
    locations: string[];
  }[];
  body_analysis?: {
    enabled: boolean;
    silhouette: string;
    confidence: number;
    ratios: {
      shoulder_waist_hip: string;
      leg_body_ratio: string;
    };
    estimated_metrics: {
      bmi: string;
      weight_range: string;
      bust_waist_hip: string;
    };
  };
  avatar?: {
    generated: boolean;
    type: string;
    views: string[];
  };
  smart_try_on?: {
    enabled: boolean;
    image: string;
    fit_score: number;
    analysis: {
      style_match: string;
      body_compatibility: string;
      recommendation: string;
    };
  };
  fallback_mode: boolean;
}
