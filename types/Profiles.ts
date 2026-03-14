export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  university_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  role?: 'student' | 'driver';
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
export interface Ride {
  id: string;
  driver_id: string;
  pickup_lat: number;
  pickup_lng: number;
  destination_lat: number;
  destination_lng: number;
  seats_available: number;
  departure_time: string;
  status: 'active' | 'full' | 'completed' | 'cancelled';
  created_at?: string;
}

export interface RideRequest {
  id: string;
  ride_id: string;
  student_id: string;
  seats_requested: number;
  meetup_lat?: number;
  meetup_lng?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at?: string;
}
