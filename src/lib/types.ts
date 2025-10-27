export type UserRole = 'Admin' | 'Teacher' | 'Student';

export type User = {
  name: string;
  role: UserRole;
  avatarUrl: string;
};
