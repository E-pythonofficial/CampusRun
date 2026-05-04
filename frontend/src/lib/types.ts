export type UserRole = 'REQUESTER' | 'DISPATCHER' | 'ADMIN';

// Matching your backend fork for Requesters
export type UserType = 'STUDENT' | 'STAFF' | null;

export type DeliveryStatus =
  | 'CREATED'
  | 'ACCEPTED'
  | 'ON_MY_WAY'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'ARRIVED'
  | 'PIN_VERIFIED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'DISPUTED';

export interface User {
  id: string;
  fullName: string;      // Changed to camelCase to match typical Prisma/JS standards
  email: string;
  role: UserRole;
  userType: UserType;
  isVerified: boolean;    // ADDED: Crucial for the login gate logic
  
  // Requester/Student Specific
  matricNumber?: string;
  hostel?: string;
  college?: string;
  department?: string;
  
  // Staff Specific
  staffId?: string;       // Matches staffIdUsername in some of your earlier drafts

  // Dispatcher Specific
  bio?: string;
  idCardUrl?: string;     // Path to the file in /uploads
  selfieUrl?: string;     // Path to the file in /uploads
  isApproved: boolean;    // The critical gatekeeper for Dispatchers
  
  // General Profile
  phone?: string;
  username?: string;
  createdAt?: string | Date;
}

export interface Delivery {
  id: string;
  requesterId: string;
  requesterName: string;
  dispatcherId?: string;
  dispatcherName?: string;
  itemDescription: string;
  itemValue: number;
  fee: number;
  pickupLocation: string;
  dropoffLocation: string;
  pin: string;
  status: DeliveryStatus;
  createdAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  rating?: number;
  comment?: string;
}

export interface DispatcherStats {
  totalAccepted: number;
  completed: number;
  revoked: number;
  strikes: number;
  averageRating: number;
  reliability: number;
  totalEarnings: number;
}

export interface LeaderboardEntry {
  rank: number;
  dispatcherId: string;
  name: string;
  completed: number;
  reliability: number;
  rating: number;
  badge: 'gold' | 'silver' | 'bronze' | null;
}