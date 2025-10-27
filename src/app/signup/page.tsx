'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, KeyRound, User as UserIcon, Mail } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function SignupPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = () => {
    // In a real app, this would be a registration API call.
    // For this mock app, we'll show a success message and redirect.
    toast({
        title: 'Signup Successful',
        description: "You can now log in with the default credentials.",
    });
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <GraduationCap className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Join CampusConnect today! Fill out the form to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="username" placeholder="Choose a username" className="pl-9" />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="Enter your email" className="pl-9" />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="Create a password" className="pl-9" />
                </div>
            </div>
            <Button onClick={handleSignup} className="w-full">
              Sign Up
            </Button>
             <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link href="/login" className="underline">
                    Sign in
                </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
