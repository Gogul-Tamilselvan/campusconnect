export type UserRole = 'Admin' | 'Teacher' | 'Student';

export type User = {
  uid: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
  email: string;
};
