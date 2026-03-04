export type UserRole = 'requester' | 'dispatcher' | 'admin';

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

export type DispatcherApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  fullName: string;
  phone: string;
  matricNumber: string;
  department: string;
  role: UserRole;
  dispatcherStatus?: DispatcherApprovalStatus;
}

export interface Delivery {
  id: string;
  requesterId: string;
  requesterName: string;
  dispatcherId?: string;
  dispatcherName?: string;
  itemDescription: string;
  itemValue: number;
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
