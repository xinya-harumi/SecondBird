export interface User {
  id: string
  secondmeId: string
  email?: string
  name?: string
  avatarUrl?: string
}

export interface Bird {
  id: string
  userId: string
  speciesId: string
  name: string
  personality: string
  preferences: string
  currentLat: number
  currentLng: number
  currentLocation: string
}

export interface BirdWithSpecies extends Bird {
  species: {
    id: string
    name: string
    englishName: string
    description: string
  }
}

export interface Encounter {
  id: string
  birdId: string
  metBirdId: string
  location: string
  lat: number
  lng: number
  weather?: string
  scene?: string
  story?: string
  encounteredAt: Date
}

export interface BirdRelationship {
  id: string
  birdId: string
  relatedBirdId: string
  type: 'friendship' | 'love'
  strength: number
  startedAt: Date
}

export interface SecondMeUserInfo {
  email?: string
  name?: string
  avatarUrl?: string
  route?: string
}

export interface SecondMeShade {
  id: string
  name: string
  description?: string
}

export interface Conversation {
  id: string
  encounterId: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  attractionScore: number
  createdAt: Date
  completedAt?: Date
  messages?: Message[]
}

export interface Message {
  id: string
  conversationId: string
  speakerBirdId: string
  content: string
  round: number
  createdAt: Date
  speakerBird?: Bird
}

export interface AttractionResult {
  score: number
  factors: {
    shadesMatch: number
    personalityMatch: number
    speciesAffinity: number
    locationBonus: number
  }
}

export interface BirdWithUser extends Bird {
  species: {
    id: string
    name: string
    englishName: string
    description: string
  }
  user: {
    id: string
    name?: string | null
    avatarUrl?: string | null
    accessToken: string
    secondmeId: string
  }
}
