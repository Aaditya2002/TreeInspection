import axios from 'axios';
import { Inspection } from '../types';
import { Dynamics365InspectionSchema, DynamicsStatusMapping, DynamicsStatusReverseMapping } from '../types/dynamics365';

require('dotenv').config({ path: '.env.local' });

const DYNAMICS_CONFIG = {
  url: process.env.DYNAMICS_URL,
  apiVersion: process.env.DYNAMICS_API_VERSION,
  entityName: process.env.DYNAMICS_ENTITY_NAME,
  clientId: process.env.DYNAMICS_CLIENT_ID,
  clientSecret: process.env.DYNAMICS_CLIENT_SECRET,
  tenantId: process.env.DYNAMICS_TENANT_ID,
};

class Dynamics365Service {
  private tokenExpiry: number = 0;
  private accessToken: string = '';

  private async getValidToken(): Promise<string> {
    if (Date.now() < this.tokenExpiry && this.accessToken) {
      return this.accessToken;
    }

    const token_url = `https://login.microsoftonline.com/${DYNAMICS_CONFIG.tenantId}/oauth2/v2.0/token`;
    const token_data = {
      client_id: DYNAMICS_CONFIG.clientId,
      client_secret: DYNAMICS_CONFIG.clientSecret,
      grant_type: 'client_credentials',
      scope: `${DYNAMICS_CONFIG.url}/.default`,
    };

    try {
      const response = await axios.post(token_url, new URLSearchParams(token_data), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000 - 60000;
      return this.accessToken;
    } catch (error) {
      console.error('Error getting Dynamics 365 access token:', error);
      throw new Error('Failed to get Dynamics 365 access token');
    }
  }

  private api = axios.create({
    baseURL: `${DYNAMICS_CONFIG.url}/api/data/v${DYNAMICS_CONFIG.apiVersion}`,
    headers: {
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      Accept: 'application/json',
    },
  });

  constructor() {
    this.api.interceptors.request.use(async (config) => {
      const token = await this.getValidToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  async createInspection(inspection: Inspection): Promise<string> {
    const { title, id, location, images, status, inspector, details, communityBoard } = inspection;
    const [primaryImage, ...additionalImages] = images;

    const dynamicsInspection: Dynamics365InspectionSchema = {
      new_name: title,
      new_offlineid: id,
      new_latitude: location.latitude,
      new_longitude: location.longitude,
      new_address: location.address,
      new_status: DynamicsStatusMapping[status],
      new_inspectorid: inspector.id,
      new_inspectorname: inspector.name,
      new_description: details,
      new_communityboard: communityBoard,
      new_primaryimageurl: primaryImage,
      new_additionalimages: additionalImages.join(','),
      new_syncstatus: true,
      new_lastsyncedon: new Date().toISOString(),
      new_syncattempts: 1,
      new_treeinspectionid: '',
      new_postalcode: '',
      new_createdon: '',
      new_modifiedon: ''
    };

    try {
      const response = await this.api.post(`/${DYNAMICS_CONFIG.entityName}`, dynamicsInspection);
      return response.data.new_treeinspectionid;
    } catch (error) {
      console.error('Error creating inspection in Dynamics:', error);
      throw new Error('Failed to create inspection in Dynamics 365');
    }
  }

  async updateInspection(inspectionId: string, inspection: Partial<Inspection>): Promise<void> {
    try {
      const updateData: Partial<Dynamics365InspectionSchema> = {};
      if (inspection.title) updateData.new_name = inspection.title;
      if (inspection.status) updateData.new_status = DynamicsStatusMapping[inspection.status];
      if (inspection.location) {
        updateData.new_latitude = inspection.location.latitude;
        updateData.new_longitude = inspection.location.longitude;
        updateData.new_address = inspection.location.address;
      }
      if (inspection.details) updateData.new_description = inspection.details;
      if (inspection.images) {
        updateData.new_primaryimageurl = inspection.images[0];
        updateData.new_additionalimages = inspection.images.slice(1).join(',');
      }
      if (inspection.communityBoard) updateData.new_communityboard = inspection.communityBoard;

      await this.api.patch(`/${DYNAMICS_CONFIG.entityName}(${inspectionId})`, updateData);
    } catch (error) {
      console.error('Error updating inspection in Dynamics:', error);
      throw new Error('Failed to update inspection in Dynamics 365');
    }
  }

  async getInspections(): Promise<Inspection[]> {
    try {
      const response = await this.api.get(`/${DYNAMICS_CONFIG.entityName}`);
      return response.data.value.map(this.mapDynamicsToInspection);
    } catch (error) {
      console.error('Error fetching inspections from Dynamics:', error);
      throw new Error('Failed to fetch inspections from Dynamics 365');
    }
  }

  private mapDynamicsToInspection(item: Dynamics365InspectionSchema): Inspection {
    return {
      id: item.new_offlineid,
      title: item.new_name,
      status: DynamicsStatusReverseMapping[item.new_status],
      location: {
        latitude: item.new_latitude,
        longitude: item.new_longitude,
        address: item.new_address,
      },
      scheduledDate: item.new_createdon,
      inspector: {
        id: item.new_inspectorid,
        name: item.new_inspectorname,
      },
      communityBoard: item.new_communityboard,
      details: item.new_description,
      images: [item.new_primaryimageurl, ...(item.new_additionalimages ? item.new_additionalimages.split(',') : [])].filter(Boolean),
      createdAt: item.new_createdon,
      updatedAt: item.new_modifiedon,
      synced: item.new_syncstatus,
      dynamicsId: item.new_treeinspectionid,
    };
  }
}

export const dynamics365Service = new Dynamics365Service();
