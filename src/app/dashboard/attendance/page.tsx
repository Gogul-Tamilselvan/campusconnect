'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { attendanceRecords } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';

const TeacherAttendance = () => {
    const [qrVisible, setQrVisible] = useState(false);
    const qrCodeImage = PlaceHolderImages.find(img => img.id === 'qr-code');

    return (
        <Card>
            <CardHeader>
                <CardTitle>Generate Attendance QR Code</CardTitle>
                <CardDescription>Select a subject and generate a QR code for students to scan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <Select>
                        <SelectTrigger className="w-full sm:w-[280px]">
                            <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ds">Data Structures</SelectItem>
                            <SelectItem value="os">Operating Systems</SelectItem>
                            <SelectItem value="dbms">Database Systems</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={() => setQrVisible(true)}>Generate QR Code</Button>
                </div>
                {qrVisible && qrCodeImage && (
                    <div className="mt-6 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8">
                        <Image
                            src={qrCodeImage.imageUrl}
                            alt={qrCodeImage.description}
                            width={200}
                            height={200}
                            data-ai-hint={qrCodeImage.imageHint}
                        />
                        <p className="mt-4 text-sm text-muted-foreground">
                            QR code for Data Structures - Valid for 5 minutes.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const StudentAttendance = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>My Attendance Record</CardTitle>
                <CardDescription>Here is your attendance history across all subjects.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attendanceRecords.map((record, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{record.date}</TableCell>
                                <TableCell>{record.subject}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={record.status === 'Present' ? 'default' : 'destructive'} className={record.status === 'Present' ? 'bg-green-500' : 'bg-red-500'}>
                                        {record.status}
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

export default function AttendancePage() {
    const { user } = useAuth();
    
    return (
        <div className="space-y-6">
            {user?.role === 'Teacher' && <TeacherAttendance />}
            {user?.role === 'Student' && <StudentAttendance />}
            {user?.role === 'Admin' && <p>Admin attendance overview will be displayed here.</p>}
        </div>
    );
}
