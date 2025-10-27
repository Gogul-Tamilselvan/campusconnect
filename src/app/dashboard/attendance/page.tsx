'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useRef, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFirebase } from '@/firebase';
import { getFirestore, collection, query, where, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import QRCode from "react-qr-code";

type AttendanceRecord = {
    id: string;
    date: string;
    subject: string;
    status: 'Present' | 'Absent';
};

type Subject = {
    id: string;
    name: string;
}

const TeacherAttendance = () => {
    const { toast } = useToast();
    const [isScanning, setIsScanning] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const { app } = useFirebase();
    const db = getFirestore(app);

    const subjectsQuery = query(collection(db, 'subjects'), orderBy('name', 'asc'));
    const { data: subjects, loading: subjectsLoading } = useCollection<Subject>(subjectsQuery);

    useEffect(() => {
        if (isScanning) {
            const getCameraPermission = async () => {
              try {
                const stream = await navigator.mediaDevices.getUserMedia({video: true});
                setHasCameraPermission(true);
        
                if (videoRef.current) {
                  videoRef.current.srcObject = stream;
                }
              } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                  variant: 'destructive',
                  title: 'Camera Access Denied',
                  description: 'Please enable camera permissions in your browser settings to use this feature.',
                });
                setIsScanning(false);
              }
            };
        
            getCameraPermission();

            return () => {
                // Stop camera stream when component unmounts or scanning stops
                if (videoRef.current && videoRef.current.srcObject) {
                    const stream = videoRef.current.srcObject as MediaStream;
                    stream.getTracks().forEach(track => track.stop());
                }
            }
        }
      }, [isScanning, toast]);

    const handleScanClick = () => {
        if (isScanning) {
            setIsScanning(false);
        } else {
            setIsScanning(true);
            toast({
                title: "Scanner Activated",
                description: "Ready to scan student QR codes.",
            });
        }
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle>Take Attendance</CardTitle>
                <CardDescription>Scan student QR codes to mark them as present.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <Select>
                        <SelectTrigger className="w-full sm:w-[280px]">
                            <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                        <SelectContent>
                             {subjectsLoading ? (
                                <SelectItem value="loading" disabled>Loading classes...</SelectItem>
                            ) : (
                                subjects?.map((subject) => (
                                    <SelectItem key={subject.id} value={subject.name}>
                                        {subject.name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleScanClick}>
                        <Camera className="mr-2 h-4 w-4" />
                        {isScanning ? 'Stop Scanner' : 'Scan QR Code'}
                    </Button>
                </div>
                {isScanning && (
                    <div className='mt-4'>
                        <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted />
                        {hasCameraPermission === false && (
                            <Alert variant="destructive" className="mt-4">
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>
                                Please allow camera access in your browser settings to use this feature.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}
                <div className="mt-6 border-t pt-4">
                    <h3 className="font-semibold mb-2">Today's Attendance: Data Structures</h3>
                    <p className="text-sm text-muted-foreground">32/40 students present.</p>
                </div>
            </CardContent>
        </Card>
    );
};

const StudentAttendance = () => {
    const { user } = useAuth();
    const { app } = useFirebase();
    const db = getFirestore(app);
    
    const attendanceQuery = user ? query(collection(db, 'attendance'), where('studentId', '==', user.uid)) : null;
    const { data: attendanceRecords, loading } = useCollection<AttendanceRecord>(attendanceQuery);

    return (
        <div className="grid md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>My Attendance QR Code</CardTitle>
                    <CardDescription>Present this QR code to your teacher for attendance.</CardDescription>
                </CardHeader>
                <CardContent>
                    {user?.uid && (
                        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 bg-white">
                             <QRCode value={user.uid} />
                            <p className="mt-4 text-sm text-muted-foreground">
                                This code identifies you, {user?.name}.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
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
                            {loading && <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>}
                            {attendanceRecords && attendanceRecords.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-medium">{record.date}</TableCell>
                                    <TableCell>{record.subject}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={record.status === 'Present' ? 'default' : 'destructive'} className={record.status === 'Present' ? 'bg-green-500' : 'bg-red-500'}>
                                            {record.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!loading && attendanceRecords?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">No attendance records found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
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
