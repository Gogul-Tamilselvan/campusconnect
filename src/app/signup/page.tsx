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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirebase } from '@/firebase';
import { getFirestore, collection, query, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  
  const { app } = useFirebase();
  const db = getFirestore(app);

  const departmentsQuery = query(collection(db, 'departments'), orderBy('name', 'asc'));
  const { data: departments, loading: departmentsLoading } = useCollection<{id:string, name:string}>(departmentsQuery);

  const semestersQuery = query(collection(db, 'semesters'), orderBy('name', 'asc'));
  const { data: semesters, loading: semestersLoading } = useCollection<{id:string, name:string}>(semestersQuery);


  const handleSignup = async () => {
    if(!username || !email || !password || !department || !semester) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await signup(email, password, username, department, semester);
      toast({
          title: 'Signup Successful',
          description: "You can now log in with your credentials.",
      });
      router.push('/login');
    } catch(error: any) {
       toast({
        title: 'Signup Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
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
                    <Input id="username" placeholder="Choose a username" className="pl-9" value={username} onChange={e => setUsername(e.target.value)} />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="Enter your email" className="pl-9" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="Create a password" className="pl-9" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Department</Label>
                    <Select onValueChange={setDepartment} value={department}>
                        <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                        <SelectContent>
                            {departmentsLoading ? <SelectItem value="loading" disabled>Loading...</SelectItem> : 
                              departments?.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)
                            }
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label>Semester</Label>
                    <Select onValueChange={setSemester} value={semester}>
                        <SelectTrigger><SelectValue placeholder="Select Semester" /></SelectTrigger>
                        <SelectContent>
                             {semestersLoading ? <SelectItem value="loading" disabled>Loading...</SelectItem> :
                                semesters?.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)
                             }
                        </SelectContent>
                    </Select>
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
