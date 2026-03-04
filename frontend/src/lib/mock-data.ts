import { Delivery, DispatcherStats, LeaderboardEntry, User } from './types';

export const mockUser: User = {
  id: '1',
  fullName: 'Adebayo Oluwaseun',
  phone: '08012345678',
  matricNumber: 'CSC/2021/001',
  department: 'Computer Science',
  role: 'requester',
};

export const mockDeliveries: Delivery[] = [
  {
    id: 'd1',
    requesterId: '1',
    requesterName: 'Adebayo Oluwaseun',
    dispatcherId: '2',
    dispatcherName: 'Chinwe Okafor',
    itemDescription: 'Course textbook - MTH201',
    itemValue: 5000,
    pickupLocation: 'Faculty of Science Building',
    dropoffLocation: 'Hall 3, Room 214',
    pin: '4829',
    status: 'IN_TRANSIT',
    createdAt: new Date(Date.now() - 1800000),
    acceptedAt: new Date(Date.now() - 1200000),
  },
  {
    id: 'd2',
    requesterId: '1',
    requesterName: 'Adebayo Oluwaseun',
    dispatcherId: '3',
    dispatcherName: 'Emeka Nwosu',
    itemDescription: 'Lab coat',
    itemValue: 3000,
    pickupLocation: 'Campus Gate',
    dropoffLocation: 'Chemistry Lab',
    pin: '7156',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 86400000),
    acceptedAt: new Date(Date.now() - 85800000),
    completedAt: new Date(Date.now() - 84000000),
    rating: 5,
    comment: 'Very fast delivery!',
  },
  {
    id: 'd3',
    requesterId: '4',
    requesterName: 'Fatima Bello',
    dispatcherId: '2',
    dispatcherName: 'Chinwe Okafor',
    itemDescription: 'Laptop charger',
    itemValue: 8000,
    pickupLocation: 'SUB Building',
    dropoffLocation: 'Engineering Faculty',
    pin: '3291',
    status: 'ACCEPTED',
    createdAt: new Date(Date.now() - 600000),
    acceptedAt: new Date(Date.now() - 300000),
  },
  {
    id: 'd4',
    requesterId: '5',
    requesterName: 'Ibrahim Musa',
    itemDescription: 'Assignment notebook',
    itemValue: 1500,
    pickupLocation: 'Library',
    dropoffLocation: 'Hall 5, Room 102',
    pin: '8834',
    status: 'CREATED',
    createdAt: new Date(Date.now() - 120000),
  },
];

export const mockDispatcherStats: DispatcherStats = {
  totalAccepted: 47,
  completed: 42,
  revoked: 3,
  strikes: 2,
  averageRating: 4.7,
  reliability: 83,
};

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, dispatcherId: '10', name: 'Chinwe Okafor', completed: 89, reliability: 96, rating: 4.9, badge: 'gold' },
  { rank: 2, dispatcherId: '11', name: 'Emeka Nwosu', completed: 76, reliability: 94, rating: 4.8, badge: 'silver' },
  { rank: 3, dispatcherId: '12', name: 'Amina Yusuf', completed: 71, reliability: 92, rating: 4.7, badge: 'bronze' },
  { rank: 4, dispatcherId: '13', name: 'David Obi', completed: 64, reliability: 90, rating: 4.6, badge: null },
  { rank: 5, dispatcherId: '14', name: 'Grace Eze', completed: 58, reliability: 88, rating: 4.5, badge: null },
];

export const mockUsers: User[] = [
  mockUser,
  { id: '2', fullName: 'Chinwe Okafor', phone: '08023456789', matricNumber: 'ENG/2020/045', department: 'Engineering', role: 'dispatcher', dispatcherStatus: 'approved' },
  { id: '3', fullName: 'Emeka Nwosu', phone: '08034567890', matricNumber: 'BUS/2021/012', department: 'Business Admin', role: 'dispatcher', dispatcherStatus: 'approved' },
  { id: '4', fullName: 'Fatima Bello', phone: '08045678901', matricNumber: 'MED/2022/008', department: 'Medicine', role: 'requester' },
  { id: '5', fullName: 'Ibrahim Musa', phone: '08056789012', matricNumber: 'LAW/2021/023', department: 'Law', role: 'requester' },
  { id: '6', fullName: 'Ngozi Adamu', phone: '08067890123', matricNumber: 'ART/2023/019', department: 'Fine Arts', role: 'dispatcher', dispatcherStatus: 'pending' },
];
