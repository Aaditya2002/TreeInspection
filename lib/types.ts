export interface Inspection {
  id: string
  title: string
  status: 'Pending' | 'In-Progress' | 'Completed'
  location: {
    address: string;
    latitude: number;
    longitude: number;
  }
  scheduledDate: string
  inspector: {
    name: string
    id: string
  }
  communityBoard: string
  details: string
  images: string[]
  createdAt: string
  updatedAt: string
  synced: boolean
  dynamicsId?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: 'inspector' | 'admin'
  avatar?: string
}

