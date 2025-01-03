import { Inspection } from './types';

export const dummyInspections: Inspection[] = [
  {
    id: '5148440',
    title: 'Dead tree removal required',
    status: 'Pending',
    location: {
      address: '2327 WALLACE AVENUE',
      latitude: 40.7128,
      longitude: -73.8675
    },
    scheduledDate: '2024-01-26T20:30:00.000Z',
    inspector: {
      name: 'Meet Desai',
      id: 'MD001'
    },
    communityBoard: '211',
    details: 'LOCATION: IN FRONT OF THE BUILDING. DESCRIPTION: DEAD TREE NEEDS TO BE REMOVED. BRANCHES ARE FALLING AND POSING RISK TO PEDESTRIANS. INSPECTION REQUIRED TO ASSESS THE CONDITION AND DETERMINE THE SCOPE OF WORK.',
    images: ['/placeholder.svg?height=400&width=400'],
    createdAt: '2024-01-20T10:00:00.000Z',
    updatedAt: '2024-01-20T10:00:00.000Z',
    synced: false,
    dynamicsId: undefined
  },
  {
    id: '5148441',
    title: 'Tree pruning inspection',
    status: 'In-Progress',
    location: {
      address: '1845 MORRIS AVENUE',
      latitude: 40.7225,
      longitude: -73.8995
    },
    scheduledDate: '2024-01-27T15:00:00.000Z',
    inspector: {
      name: 'Meet Desai',
      id: 'MD001'
    },
    communityBoard: '211',
    details: 'Regular maintenance inspection for tree pruning assessment.',
    images: ['/placeholder.svg?height=400&width=400'],
    createdAt: '2024-01-20T11:00:00.000Z',
    updatedAt: '2024-01-20T11:00:00.000Z',
    synced: false,
    dynamicsId: undefined
  },
  {
    id: '5148442',
    title: 'New tree planting site',
    status: 'Pending',
    location: {
      address: '3561 DEKALB AVENUE',
      latitude: 40.7318,
      longitude: -73.8825
    },
    scheduledDate: '2024-01-28T14:00:00.000Z',
    inspector: {
      name: 'Meet Desai',
      id: 'MD001'
    },
    communityBoard: '211',
    details: 'Site assessment for new tree planting location.',
    images: ['/placeholder.svg?height=400&width=400'],
    createdAt: '2024-01-20T12:00:00.000Z',
    updatedAt: '2024-01-20T12:00:00.000Z',
    synced: false,
    dynamicsId: undefined
  }
];
