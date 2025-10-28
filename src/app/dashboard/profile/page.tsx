'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { doc, updateDoc, getFirestore, collection, query, orderBy } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCollection } from '@/firebase/firestore/use-collection';

export default function ProfilePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { app } = useFirebase();
    const db = getFirestore(app);
    const [name, setName] = useState(user?.name || '');
    const [department, setDepartment] = useState(user?.department || '');
    const [semester, setSemester] = useState(user?.semester || '');
    const [isSaving, setIsSaving] = useState(false);

    const departmentsQuery = query(collection(db, 'departments'), orderBy('name', 'asc'));
    const { data: departments, loading: departmentsLoading } = useCollection<{id:string, name:string}>(departmentsQuery, { listen: false });

    const semestersQuery = query(collection(db, 'semesters'), orderBy('name', 'asc'));
    const { data: semesters, loading: semestersLoading } = useCollection<{id:string, name:string}>(semestersQuery, { listen: false });
    
    useEffect(() => {
        if(user) {
            setName(user.name);
            setDepartment(user.department || '');
            setSemester(user.semester || '');
        }
    }, [user])


    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !name) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Name cannot be empty.',
            });
            return;
        }

        setIsSaving(true);
        const userDocRef = doc(db, 'users', user.uid);
        
        const dataToUpdate:any = { name };
        if (department) dataToUpdate.department = department;
        if (semester) dataToUpdate.semester = semester;

        try {
            await updateDoc(userDocRef, dataToUpdate);
            toast({
                title: 'Success!',
                description: 'Your profile has been updated.',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: 'Could not update your profile.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return <p>Loading...</p>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>My Profile</CardTitle>
                    <CardDescription>Manage your personal information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-xl font-bold">{user.name}</h2>
                            <p className="text-muted-foreground">{user.email}</p>
                            <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                        </div>
                    </div>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        
                        {user.role === 'Student' && (
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

                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
