export interface Dynamics365InspectionSchema {
    new_treeinspectionid: string
    new_name: string
    new_offlineid: string
    new_latitude: number
    new_longitude: number
    new_address: string
    new_postalcode: string
    new_status: number
    new_createdon: string
    new_modifiedon: string
    new_inspectorid: string
    new_inspectorname: string
    new_description: string
    new_communityboard: string
    new_primaryimageurl: string
    new_additionalimages: string
    new_syncstatus: boolean
    new_lastsyncedon: string
    new_syncattempts: number
  }
  
  export const DynamicsStatusMapping = {
    Pending: 1,
    'In-Progress': 2,
    Completed: 3,
  } as const
  
  export const DynamicsStatusReverseMapping = {
    1: 'Pending',
    2: 'In-Progress',
    3: 'Completed',
  } as const
  
  