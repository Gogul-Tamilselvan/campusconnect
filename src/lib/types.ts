export type UserRole = 'Admin' | 'Teacher' | 'Student';

export type User = {
  uid: string;
  id: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
  email: string;
  department?: string;
  semester?: string;
};
