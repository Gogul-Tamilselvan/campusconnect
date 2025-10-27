'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useFirebase } from '@/firebase';
import { getFirestore, collection, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { User, UserRole } from '@/lib/types';
import { Shield, User as UserIcon, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const EditUserDialog = ({ user, open, onOpenChange, onUserUpdate }: { user: User | null, open: boolean, onOpenChange: (open: boolean) => void, onUserUpdate: () => void }) => {
    const { toast } = useToast();
    const { app } = useFirebase();
    const db = getFirestore(app);
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>('Student');
    const [department, setDepartment] = useState('');
    const [semester, setSemester] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const departmentsQuery = query(collection(db, 'departments'), orderBy('name', 'asc'));
    const { data: departments, loading: departmentsLoading } = useCollection<{id:string, name:string}>(departmentsQuery);

    const semestersQuery = query(collection(db, 'semesters'), orderBy('name', 'asc'));
    const { data: semesters, loading: semestersLoading } = useCollection<{id:string, name:string}>(semestersQuery);
    
    useEffect(() => {
        if (user) {
            setName(user.name);
            setRole(user.role);
            setDepartment(user.department || '');
            setSemester(user.semester || '');
        }
    }, [user]);


    const handleUpdate = async () => {
        if (!user) return;
        setIsSaving(true);

        const userDocRef = doc(db, 'users', user.uid);
        const dataToUpdate: Partial<User> = {
            name,
            role,
        };
        
        if (role === 'Student') {
            dataToUpdate.department = department;
            dataToUpdate.semester = semester;
        } else {
            // Clear department and semester if user is not a student
            dataToUpdate.department = '';
            dataToUpdate.semester = '';
        }

        try {
            await updateDoc(userDocRef, dataToUpdate as any);
            toast({ title: 'Success', description: 'User updated successfully.' });
            onUserUpdate();
            onOpenChange(false);
        } catch (error) {
            console.error("Error updating user:", error);
            toast({ title: 'Error', description: 'Failed to update user.', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit User: {user.name}</DialogTitle>
                     <DialogDescription>
                        Modify the user's details below.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Student">Student</SelectItem>
                                <SelectItem value="Teacher">Teacher</SelectItem>
                                <SelectItem value="Admin">Admin</SelectItem>
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
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleUpdate} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function ManageUsersPage() {
    const { user: currentUser } = useAuth();
    const { app } = useFirebase();
    const db = getFirestore(app);
    // Correctly query all users without any filters.
    const usersQuery = query(collection(db, 'users'), orderBy('name', 'asc'));
    const { data: users, loading, refetch: refetchUsers } = useCollection<User>(usersQuery);

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    if (currentUser?.role !== 'Admin') {
        return <p>You do not have permission to view this page.</p>;
    }

    const handleEditClick = (userToEdit: User) => {
        setSelectedUser(userToEdit);
        setIsEditDialogOpen(true);
    };

    const getRoleIcon = (role: string) => {
        switch(role) {
            case 'Admin': return <Shield className="h-4 w-4 text-red-500" />;
            case 'Teacher': return <UserIcon className="h-4 w-4 text-blue-500" />;
            default: return <UserIcon className="h-4 w-4 text-gray-500" />;
        }
    };


    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>View and manage all users in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="hidden md:table-cell">Department</TableHead>
                                <TableHead className="hidden md:table-cell">Semester</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && <TableRow><TableCell colSpan={6} className="text-center">Loading users...</TableCell></TableRow>}
                            {users && users.map(u => (
                                <TableRow key={u.uid}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={u.avatarUrl} alt={u.name} />
                                                <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{u.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="flex items-center gap-2 w-fit">
                                            {getRoleIcon(u.role)}
                                            {u.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{u.department || 'N/A'}</TableCell>
                                    <TableCell className="hidden md:table-cell">{u.semester || 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(u)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!loading && users?.length === 0 && (
                                 <TableRow>
                                    <TableCell colSpan={6} className="text-center">No users found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <EditUserDialog 
                user={selectedUser} 
                open={isEditDialogOpen} 
                onOpenChange={setIsEditDialogOpen} 
                onUserUpdate={refetchUsers}
            />
        </>
    );
}
