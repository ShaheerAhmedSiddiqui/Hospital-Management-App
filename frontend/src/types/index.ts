import type { ReactNode } from "react";

export interface User {
  _id:            string;
  name:           string;
  email:          string;
  role:           'admin' | 'doctor' | 'patient';
  specialization?: string; 
  profileImage?:   string; 
  phoneNumber?:    string; 
  createdAt?:      string;
}

export interface DoctorRequest {
  _id:            string;
  name:           string;
  email:          string;
  address:        string;
  specialization: string;
  emailStatus:    'pending' | 'email_verified' | 'email_not_verified';
  approvalStatus: 'pending' | 'registeration_approved' | 'registeration_rejected' | 'account_created';
  createdAt:      string;
}

export interface Appointment {
  date: string | number | Date;
  time: ReactNode;
  _id:             string;
 
  doctorId: { 
    _id: string; 
    specialization: string; 
    userId: { _id: string; name: string; email: string }
  };
  patientId: { 
    _id: string; 
    userId: { _id: string; name: string; email: string } 
  };
  appointmentDate: string; 
  timeSlot:        string; 
  status:          'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?:          string;
  fees?:           number;
  prescription?:   string;
}

export interface DashboardStats {
  totalUsers:        number;
  totalDoctors:      number;
  totalPatients:     number;
  totalAppointments: number;
}

export interface Doctor {
  _id:            string;
  specialization: string;
  fee:            number;
  experience?:    number;
  userId:         { name: string };
  availability?:  { day: string; startTime: string; endTime: string }[];
}