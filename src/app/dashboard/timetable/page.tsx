'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { User } from '@/lib/types';

type TimetableEntry = {
    id: string;
    day: string;
    time: string;
    subject: string;
    teacher: string;
    department: string;
    semester: string;
};

const CreateTimetableForm = ({ onUpdate }: { onUpdate: () => void }) => {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const { app } = useFirebase();
    const db = getFirestore(app);

    const departmentsQuery = query(collection(db, 'departments'), orderBy('name', 'asc'));
    const {data: departments, loading: departmentsLoading } = useCollection<{id:string, name:string}>(departmentsQuery, { listen: false });

    const semestersQuery = query(collection(db, 'semesters'), orderBy('name', 'asc'));
    const {data: semesters, loading: semestersLoading } = useCollection<{id:string, name:string}>(semestersQuery, { listen: false });
    
    const subjectsQuery = query(collection(db, 'subjects'), orderBy('name', 'asc'));
    const {data: subjects, loading: subjectsLoading } = useCollection<{id:string, name:string}>(subjectsQuery, { listen: false });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        if (Object.values(data).some(val => !val)) {
            toast({ title: 'Error', description: 'All fields are required.', variant: 'destructive' });
            return;
        }

        try {
            await addDoc(collection(db, 'timetables'), {
                ...data,
                createdAt: serverTimestamp()
            });
            toast({ title: 'Success', description: 'Timetable entry added.' });
            setOpen(false);
            onUpdate();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to add timetable entry.', variant: 'destructive' });
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Timetable Entry
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Timetable Entry</DialogTitle>
                        <DialogDescription>Fill in the details for the new class schedule.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className='space-y-2'>
                            <Label>Department</Label>
                            <Select name="department">
                                <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                                <SelectContent>
                                    {departmentsLoading ? <SelectItem value="loading" disabled>Loading...</SelectItem> : 
                                      departments?.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                         <div className='space-y-2'>
                            <Label>Semester</Label>
                            <Select name="semester">
                                <SelectTrigger><SelectValue placeholder="Select Semester" /></SelectTrigger>
                                <SelectContent>
                                     {semestersLoading ? <SelectItem value="loading" disabled>Loading...</SelectItem> :
                                        semesters?.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)
                                     }
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='space-y-2'>
                            <Label>Day</Label>
                            <Select name="day">
                                <SelectTrigger><SelectValue placeholder="Select Day" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Monday">Monday</SelectItem>
                                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                                    <SelectItem value="Thursday">Thursday</SelectItem>
                                    <SelectItem value="Friday">Friday</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor="time">Time Slot</Label>
                            <Input id="time" name="time" placeholder="e.g., 9-10 AM" />
                        </div>
                         <div className='space-y-2'>
                            <Label>Subject</Label>
                             <Select name="subject">
                                <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                                <SelectContent>
                                     {subjectsLoading ? <SelectItem value="loading" disabled>Loading...</SelectItem> :
                                        subjects?.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)
                                     }
                                </SelectContent>
                            </Select>
                        </div>
                         <div className='space-y-2'>
                            <Label htmlFor="teacher">Teacher</Label>
                            <Input id="teacher" name="teacher" placeholder="e.g., Dr. Smith" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Add Entry</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default function TimetablePage() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';
    const { app } = useFirebase();
    const db = getFirestore(app);
    const timetableQuery = query(collection(db, 'timetables'), orderBy('createdAt', 'desc'));
    const {data: timetableData, loading, refetch} = useCollection<TimetableEntry>(timetableQuery, { listen: false });
    
    const filteredTimetable = useMemo(() => {
        if (!user || !timetableData) return [];
        if (user.role === 'Student') {
            return timetableData.filter(
                (item) => item.department === user.department && item.semester === user.semester
            );
        }
        if (user.role === 'Teacher') {
            return timetableData.filter(
                (item) => item.teacher === user.name
            );
        }
        return timetableData;
    }, [user, timetableData]);

    const department = user?.department || 'All Departments';
    const semester = user?.semester || 'All Semesters';

    return (
        <div className="space-y-6">
            {isAdmin && (
                <div className="flex justify-end">
                    <CreateTimetableForm onUpdate={refetch} />
                </div>
            )}
            <Card>
                <CardHeader>
                    <CardTitle>Weekly Timetable</CardTitle>
                    <CardDescription>
                        { user?.role === 'Student' ? `Showing schedule for ${department}, ${semester}.` : user?.role === 'Teacher' ? 'Showing your schedule.' : 'Showing all schedules.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Day</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Teacher</TableHead>
                                    {user?.role !== 'Student' && <TableHead>Department</TableHead>}
                                    {user?.role !== 'Student' && <TableHead>Semester</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && <TableRow><TableCell colSpan={user?.role === 'Student' ? 4 : 6} className="text-center">Loading...</TableCell></TableRow>}
                                {!loading && filteredTimetable.length > 0 ? filteredTimetable.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.day}</TableCell>
                                        <TableCell>{item.time}</TableCell>
                                        <TableCell>{item.subject}</TableCell>
                                        <TableCell>{item.teacher}</TableCell>
                                        {user?.role !== 'Student' && <TableCell>{item.department}</TableCell>}
                                        {user?.role !== 'Student' && <TableCell>{item.semester}</TableCell>}
                                    </TableRow>
                                )) : !loading && (
                                    <TableRow>
                                        <TableCell colSpan={user?.role === 'Student' ? 4 : 6} className="text-center">
                                            No timetable data available.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
