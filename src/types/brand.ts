export interface ServiceZone {
  id: number;
  coordinates: {
    type: string;
    coordinates: { lat: number; lon: number }[];
  };
}

export interface Branch {
  id: number;
  name: string;
  location_lat: number;
  location_lon: number;
  created_at: string;
  service_zone: ServiceZone;
  service_zone_id: number;
  drivers?: {
    id: number;
    name: string;
    // Add other driver properties as needed
  }[];
}

export interface Brand {
  id: number;
  name: string;
  branches: Branch[];
} 