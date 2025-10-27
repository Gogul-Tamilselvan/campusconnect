'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, KeyRound, User as UserIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import type { UserRole } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [role, setRole] = useState<UserRole | ''>('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = () => {
    if (role) {
      login(role as UserRole);
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <GraduationCap className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">CampusConnect</CardTitle>
          <CardDescription>Welcome back! Please select your role to sign in.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="username" placeholder="Enter your username" className="pl-9" />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="Enter your password" className="pl-9" />
                </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select onValueChange={(value) => setRole(value as UserRole)} value={role}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Teacher">Teacher</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleLogin} disabled={!role} className="w-full">
              Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
