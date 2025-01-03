import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tree Inspections',
    short_name: 'TreeInspect',
    description: 'Manage and track tree inspections efficiently',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#00ff00',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons-256.png',
        sizes: '256x256',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
    shortcuts: [
      {
        name: 'New Inspection',
        short_name: 'New',
        description: 'Start a new tree inspection',
        url: '/inspections/new',
        icons: [{ src: '/icons-192.png', sizes: '192x192' }]
      },
      {
        name: 'View Map',
        short_name: 'Map',
        description: 'View inspection locations',
        url: '/map',
        icons: [{ src: '/icons-192.png', sizes: '192x192' }]
      }
    ],
    related_applications: [],
    prefer_related_applications: false,
    categories: ['business', 'utilities'],
    screenshots: [],
    share_target: {
      action: '/inspections/new',
      method: 'post',
      enctype: 'multipart/form-data',
      params: [
        { name: 'title', value: 'title' },
        { name: 'text', value: 'text' },
        { name: 'url', value: 'url' }
      ],
      files: [
        {
          name: 'images',
          accept: ['image/*']
        }
      ]
    }
  }
}

