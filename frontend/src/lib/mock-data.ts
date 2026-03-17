import { Delivery, DispatcherStats, LeaderboardEntry, User } from './types';

// Updated to export mockUsers as an array to support the Admin Dashboard
export const mockUsers: User[] = [
  {
    id: '1',
    fullName: 'Adebayo Oluwaseun',
    phone: '08012345678',
    matricNumber: 'CSC/2021/001',
    department: 'Computer Science',
    role: 'dispatcher',
    dispatcherStatus: 'approved',
    email: 'johnnydrille28@gmail.com'
  },
  {
    id: '2',
    fullName: 'Chinwe Okafor',
    phone: '08022223333',
    matricNumber: 'BUS/2022/120',
    department: 'Business Admin',
    role: 'dispatcher',
    dispatcherStatus: 'approved',
    email: 'chinwe@campusrun.com'
  },
  {
    id: '3',
    fullName: 'Emeka Nwosu',
    phone: '08044445555',
    matricNumber: 'ENG/2021/088',
    department: 'Mechanical Engineering',
    role: 'dispatcher',
    dispatcherStatus: 'approved',
    email: 'emeka@student.edu'
  },
  {
    id: '4',
    fullName: 'Fatima Bello',
    phone: '07011119999',
    matricNumber: 'LAW/2023/042',
    department: 'Law',
    role: 'dispatcher',
    email: 'fatima@student.edu'
  },
  {
    id: '5',
    fullName: 'Kola Abiola',
    phone: '09012344321',
    matricNumber: 'MED/2020/015',
    department: 'Medicine',
    role: 'dispatcher',
    dispatcherStatus: 'pending', // This will now correctly appear in the Approval Queue
    email: 'kola@student.edu'
  }
];

// Keep single mockUser export for parts of the app that expect only the current user
export const mockUser: User = mockUsers[0];

export const mockDeliveries: Delivery[] = [
  {
    id: 'd1',
    requesterId: '1',
    requesterName: 'Adebayo Oluwaseun',
    dispatcherId: '2',
    dispatcherName: 'Chinwe Okafor',
    itemDescription: 'Course textbook - MTH201',
    itemValue: 5000,
    fee: 800,
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
    fee: 600,
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
    fee: 1000,
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
    fee: 400,
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
  totalEarnings: 33600, // Fixed the 'does not exist' error in DispatcherDashboard
};

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, dispatcherId: '10', name: 'Chinwe Okafor', completed: 89, reliability: 96, rating: 4.9, badge: 'gold' },
  { rank: 2, dispatcherId: '11', name: 'Emeka Nwosu', completed: 76, reliability: 94, rating: 4.8, badge: 'silver' },
  { rank: 3, dispatcherId: '12', name: 'Amina Yusuf', completed: 71, reliability: 92, rating: 4.7, badge: 'bronze' },
  { rank: 4, dispatcherId: '13', name: 'David Obi', completed: 64, reliability: 90, rating: 4.6, badge: null },
  { rank: 5, dispatcherId: '14', name: 'Grace Eze', completed: 58, reliability: 88, rating: 4.5, badge: null },
];