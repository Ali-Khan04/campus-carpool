export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  university_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DriverProfile {
  id: string;
  car_model: string;
  car_color?: string;
  car_plate?: string;
  seats_available: number;
  license_number?: string;
  created_at?: string;
  updated_at?: string;
}
