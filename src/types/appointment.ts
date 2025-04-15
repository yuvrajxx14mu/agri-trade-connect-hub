export interface Appointment {
  id: string;
  trader_id: string;
  farmer_id: string;
  title: string;
  appointment_date: string;
  appointment_time: string;
  location: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentDto {
  trader_id: string;
  farmer_id: string;
  title: string;
  appointment_date: string;
  appointment_time: string;
  location: string;
  status: string;
}

export interface UpdateAppointmentDto {
  title?: string;
  appointment_date?: string;
  appointment_time?: string;
  location?: string;
  status?: string;
} 