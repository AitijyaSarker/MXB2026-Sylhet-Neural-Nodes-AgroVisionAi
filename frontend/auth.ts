import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/auth` : 'http://localhost:5000/api/auth';

export const login = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data;
};

export const register = async (name: string, email: string, password: string, role?: string) => {
  const response = await axios.post(`${API_URL}/register`, { name, email, password, role: role || 'farmer' });
  return response.data;
};