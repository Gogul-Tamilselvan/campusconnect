'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useFirebase } from '@/firebase';
import { getFirestore, collection } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { User } from '@/lib/types';
import { Shield, User as UserIcon } from 'lucide-react';

export default function ManageUsersPage() {
    const { user } = useAuth();
    const { app } = useFirebase();
    const db = getFirestore(app);
    const usersQuery = collection(db, 'users');
    const { data: users, loading } = useCollection<User>(usersQuery);

    if (user?.role !== 'Admin') {
        return <p>You do not have permission to view this page.</p>;
    }

    const getRoleIcon = (role: string) => {
        switch(role) {
            case 'Admin': return <Shield className="h-4 w-4 text-red-500" />;
            case 'Teacher': return <UserIcon className="h-4 w-4 text-blue-500" />;
            default: return <UserIcon className="h-4 w-4 text-gray-500" />;
        }
    };


    return (
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
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && <TableRow><TableCell colSpan={3} className="text-center">Loading users...</TableCell></TableRow>}
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
                                     <Badge variant="outline" className="flex items-center gap-2">
                                        {getRoleIcon(u.role)}
                                        {u.role}
                                     </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
