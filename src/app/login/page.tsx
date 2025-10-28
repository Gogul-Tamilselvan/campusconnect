'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, User as UserIcon, Mail } from 'lucide-react';

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
import { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';


const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
       <div className="text-right">
            <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
        </div>
      <Button onClick={handleLogin} className="w-full !mt-6" disabled={!email || !password}>
        Login
      </Button>
    </div>
  );
};


const SignupForm = ({ onSignupSuccess }: { onSignupSuccess: () => void }) => {
    const { signup } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<UserRole | ''>('');
    const [department, setDepartment] = useState('');
    const [semester, setSemester] = useState('');
    
    const { app } = useFirebase();
    const db = getFirestore(app);

    const departmentsQuery = query(collection(db, 'departments'), orderBy('name', 'asc'));
    const { data: departments, loading: departmentsLoading } = useCollection<{id:string, name:string}>(departmentsQuery, { listen: false });

    const semestersQuery = query(collection(db, 'semesters'), orderBy('name', 'asc'));
    const { data: semesters, loading: semestersLoading } = useCollection<{id:string, name:string}>(semestersQuery, { listen: false });


    const handleSignup = async () => {
        if(!username || !email || !password || !role) {
        toast({
            title: 'Missing Information',
            description: 'Please fill in all required fields.',
            variant: 'destructive',
        });
        return;
        }
        if (password !== confirmPassword) {
            toast({
                title: 'Passwords do not match',
                description: 'Please re-enter your password.',
                variant: 'destructive',
            });
            return;
        }
        if (role === 'Student' && (!department || !semester)) {
            toast({
                title: 'Missing Information',
                description: 'Please select a department and semester.',
                variant: 'destructive',
            });
            return;
        }

        try {
        await signup(email, password, username, role, department, semester);
        toast({
            title: 'Signup Successful',
            description: "Welcome! You will be redirected to your dashboard.",
        });
        router.push('/dashboard');
        } catch(error: any) {
        toast({
            title: 'Signup Failed',
            description: error.message,
            variant: 'destructive',
        });
        }
    };

  return (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="Choose a username" value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input id="confirm-password" type="password" placeholder="Confirm your password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        </div>
        <div className="space-y-2">
            <Label>Role</Label>
            <Select onValueChange={(value) => setRole(value as UserRole)} value={role}>
                <SelectTrigger><SelectValue placeholder="Select your role" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Teacher">Teacher</SelectItem>
                </SelectContent>
            </Select>
        </div>
            {role === 'Student' && (
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
            )}
        <Button onClick={handleSignup} className="w-full !mt-6">
            Sign Up
        </Button>
    </div>
  );
};


export default function AuthPage() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4 font-body">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {authMode === 'login' ? 'Login Form' : 'Signup Form'}
          </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex justify-center mb-6">
                 <div className="flex w-fit items-center gap-2 rounded-lg bg-muted p-1">
                    <Button
                    onClick={() => setAuthMode('login')}
                    variant={authMode === 'login' ? 'default' : 'ghost'}
                    className={cn("rounded-md px-6 py-2 transition-all", authMode === 'login' ? 'shadow-md' : '')}
                    >
                    Login
                    </Button>
                    <Button
                    onClick={() => setAuthMode('signup')}
                    variant={authMode === 'signup' ? 'default' : 'ghost'}
                    className={cn("rounded-md px-6 py-2 transition-all", authMode === 'signup' ? 'shadow-md' : '')}
                    >
                    Signup
                    </Button>
                </div>
            </div>
            
            {authMode === 'login' ? <LoginForm /> : <SignupForm onSignupSuccess={() => setAuthMode('login')}/>}

            <div className="mt-6 text-center text-sm">
                {authMode === 'login' ? (
                    <>
                        Not a member?{' '}
                        <button onClick={() => setAuthMode('signup')} className="font-semibold text-primary hover:underline">
                            Signup now
                        </button>
                    </>
                ) : (
                    <>
                        Already have an account?{' '}
                         <button onClick={() => setAuthMode('login')} className="font-semibold text-primary hover:underline">
                            Login
                        </button>
                    </>
                )}
            </div>

        </CardContent>
      </Card>
    </div>
  );
}
