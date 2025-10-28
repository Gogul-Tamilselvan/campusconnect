'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFirebase } from '@/firebase';
import { getFirestore, collection, query, where, orderBy, addDoc, serverTimestamp, getDocs, doc, getDoc } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import QRCode from "react-qr-code";
import jsQR from "jsqr";
import { User } from '@/lib/types';
import { Input } from '@/components/ui/input';

type AttendanceRecord = {
    id: string;
    date: string;
    subject: string;
    status: 'Present' | 'Absent';
    studentId: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    }
};

type Subject = {
    id: string;
    name: string;
    department: string;
    semester: string;
}

type Student = {
    id: string;
    uid: string;
    name: string;
    department: string;
    semester: string;
}

type PresentStudent = {
    id: string;
    name: string;
    timestamp: Date;
}

const TeacherAttendance = () => {
    const { toast } = useToast();
    const [isScanning, setIsScanning] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const { app } = useFirebase();
    const db = getFirestore(app);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [presentStudents, setPresentStudents] = useState<PresentStudent[]>([]);
    const [isMarkingAbsent, setIsMarkingAbsent] = useState(false);
    const animationFrameId = useRef<number | null>(null);


    const subjectsQuery = query(collection(db, 'subjects'), orderBy('name', 'asc'));
    const { data: subjects, loading: subjectsLoading } = useCollection<Subject>(subjectsQuery, { listen: false });

    const selectedSubject = useMemo(() => {
        return subjects?.find(s => s.id === selectedSubjectId);
    }, [subjects, selectedSubjectId]);

    const markAttendance = useCallback(async (studentId: string, subject: Subject) => {
        if (!studentId || !subject) return;

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        if (presentStudents.some(p => p.id === studentId)) {
            toast({ title: "Already Marked", description: "This student's attendance has already been recorded for this session.", variant: "default" });
            return;
        }

        try {
            const attendanceQuery = query(
                collection(db, 'attendance'),
                where('studentId', '==', studentId),
                where('subject', '==', subject.name),
                where('date', '==', today)
            );

            const querySnapshot = await getDocs(attendanceQuery);
            if (!querySnapshot.empty) {
                toast({ title: "Already Marked", description: "This student's attendance was already recorded today.", variant: "default" });
                return;
            }

            const userDocRef = doc(db, "users", studentId);
            const userDoc = await getDoc(userDocRef);

            let studentName = 'Unknown Student';
            if (userDoc.exists()) {
                studentName = userDoc.data().name;
            } else {
                 toast({ title: "Error", description: "Student not found in the system.", variant: "destructive" });
                 return;
            }

            const attendanceRecord = {
                studentId: studentId,
                subject: subject.name,
                status: 'Present',
                date: today,
                createdAt: serverTimestamp(),
            };

            await addDoc(collection(db, 'attendance'), attendanceRecord);
            
            setPresentStudents(prev => [...prev, { id: studentId, name: studentName, timestamp: new Date() }]);

            toast({
                title: "Attendance Marked!",
                description: `${studentName} marked as present for ${subject.name}.`,
            });
        } catch (error) {
            console.error("Error marking attendance: ", error);
            toast({
                title: "Error",
                description: "Failed to mark attendance.",
                variant: "destructive",
            });
        }
    }, [db, presentStudents, toast]);

    useEffect(() => {
        if (!isScanning) return;
    
        let stream: MediaStream;
        const getCameraPermission = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                setHasCameraPermission(true);
    
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play().catch(e => console.error("Video play failed:", e));
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Camera Access Denied',
                    description: 'Please enable camera permissions in your browser settings to use this app.',
                });
            }
        };
    
        getCameraPermission();
    
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };
    }, [isScanning, toast]);


    useEffect(() => {
        const video = videoRef.current;
        if (!isScanning || !video || !hasCameraPermission) {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            return;
        }

        const scanQrCode = () => {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                const canvas = canvasRef.current;
                if (canvas) {
                    const context = canvas.getContext('2d', { willReadFrequently: true });
                    if (context) {
                        canvas.height = video.videoHeight;
                        canvas.width = video.videoWidth;
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                        try {
                            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                                inversionAttempts: 'dontInvert',
                            });
                            if (code && selectedSubject) {
                                // Stop scanning to prevent multiple triggers
                                setIsScanning(false); 
                                markAttendance(code.data, selectedSubject);
                                // Restart scanning after a delay
                                setTimeout(() => setIsScanning(true), 2000); 
                                return;
                            }
                        } catch (err) {
                           //silently fail
                        }
                    }
                }
            }
            animationFrameId.current = requestAnimationFrame(scanQrCode);
        };
    
       if (video.srcObject) {
         animationFrameId.current = requestAnimationFrame(scanQrCode);
       }
    
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [isScanning, hasCameraPermission, selectedSubject, markAttendance]);


    const handleMarkAbsentees = async () => {
        if (!selectedSubject) {
            toast({ title: 'Error', description: 'Please select a subject first.', variant: 'destructive' });
            return;
        }

        setIsMarkingAbsent(true);
        toast({ title: 'Processing...', description: 'Finding absent students and marking their attendance.' });

        try {
            const studentsQuery = query(
                collection(db, 'users'),
                where('role', '==', 'Student'),
                where('department', '==', selectedSubject.department),
                where('semester', '==', selectedSubject.semester)
            );
            const studentDocs = await getDocs(studentsQuery);
            const allStudents = studentDocs.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Student));

            const today = new Date().toISOString().split('T')[0];

            const presentStudentIds = presentStudents.map(s => s.id);
            const attendanceQuery = query(collection(db, 'attendance'), where('subject', '==', selectedSubject.name), where('date', '==', today));
            const attendanceDocs = await getDocs(attendanceQuery);
            const alreadyMarkedIds = attendanceDocs.docs.map(doc => doc.data().studentId);
            const allMarkedIds = [...new Set([...presentStudentIds, ...alreadyMarkedIds])];

            const absentStudents = allStudents.filter(student => !allMarkedIds.includes(student.uid));

            const promises = absentStudents.map(student => {
                const attendanceRecord = {
                    studentId: student.uid,
                    subject: selectedSubject.name,
                    status: 'Absent',
                    date: today,
                    createdAt: serverTimestamp(),
                };
                return addDoc(collection(db, 'attendance'), attendanceRecord);
            });

            await Promise.all(promises);

            if (absentStudents.length > 0) {
                toast({ title: 'Success', description: `Marked ${absentStudents.length} student(s) as absent.` });
            } else {
                toast({ title: 'All Accounted For', description: 'All students for this class have an attendance record for today.' });
            }

        } catch (error) {
            console.error('Error marking absentees:', error);
            toast({ title: 'Error', description: 'Could not mark absent students.', variant: 'destructive' });
        } finally {
            setIsMarkingAbsent(false);
        }
    };


    return (
        <Card>
            <CardHeader>
                <CardTitle>Take Attendance</CardTitle>
                <CardDescription>Select a class and scan student QR codes to mark them present.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <Select onValueChange={setSelectedSubjectId} value={selectedSubjectId}>
                        <SelectTrigger className="w-full sm:w-[280px]">
                            <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                        <SelectContent>
                             {subjectsLoading ? (
                                <SelectItem value="loading" disabled>Loading classes...</SelectItem>
                            ) : (
                                subjects?.map((subject) => (
                                    <SelectItem key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    <Button onClick={() => setIsScanning(prev => !prev)} disabled={!selectedSubjectId}>
                        <Camera className="mr-2 h-4 w-4" />
                        {isScanning ? 'Stop Scanner' : 'Scan QR Code'}
                    </Button>
                    {presentStudents.length > 0 && (
                        <Button onClick={handleMarkAbsentees} disabled={!selectedSubjectId || isMarkingAbsent} variant="outline">
                            {isMarkingAbsent ? 'Processing...' : 'Mark Absentees'}
                        </Button>
                    )}
                </div>
                {isScanning && (
                    <div className='mt-4'>
                        <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
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
                {presentStudents.length > 0 && (
                    <div className="mt-6 border-t pt-4">
                        <h3 className="font-semibold mb-2">Today's Attendance: {selectedSubject?.name}</h3>
                         <p className="text-sm text-muted-foreground mb-4">{presentStudents.length} students present.</p>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead className="text-right">Time Marked</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {presentStudents.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()).map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell>{student.name}</TableCell>
                                        <TableCell className="text-right">{student.timestamp.toLocaleTimeString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const StudentAttendance = () => {
    const { user } = useAuth();
    const { app } = useFirebase();
    const db = getFirestore(app);
    
    const attendanceQuery = user ? query(collection(db, 'attendance'), where('studentId', '==', user.uid)) : null;
    const { data: attendanceRecords, loading } = useCollection<AttendanceRecord>(attendanceQuery, { listen: true });
    
    const sortedRecords = useMemo(() => {
        if (!attendanceRecords) return [];
        return [...attendanceRecords].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (dateB !== dateA) return dateB - dateA;
             if (b.createdAt && a.createdAt) {
               return b.createdAt.seconds - a.createdAt.seconds;
             }
            return 0;
          });
    }, [attendanceRecords]);

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
                             <QRCode value={user.uid} size={160} />
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
                            {sortedRecords && sortedRecords.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-medium">{new Date(record.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{record.subject}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={record.status === 'Present' ? 'default' : 'destructive'} className={record.status === 'Present' ? 'bg-green-500' : ''}>
                                            {record.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!loading && sortedRecords?.length === 0 && (
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

const AdminAttendance = () => {
    const { app } = useFirebase();
    const db = getFirestore(app);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const { data: attendanceRecords, loading: attendanceLoading } = useCollection<AttendanceRecord>(query(collection(db, 'attendance'), orderBy('createdAt', 'desc')), { listen: false });
    const { data: users, loading: usersLoading } = useCollection<User>(collection(db, 'users'), { listen: false });

    const userMap = useMemo(() => {
        if (!users) return new Map<string, string>();
        return new Map(users.map(u => [u.uid, u.name]));
    }, [users]);
    
    const filteredRecords = useMemo(() => {
        if (!attendanceRecords) return [];
        return attendanceRecords
            .map(record => ({
                ...record,
                studentName: userMap.get(record.studentId) || 'Unknown Student',
            }))
            .filter(record => {
                const studentName = record.studentName.toLowerCase();
                const subject = record.subject.toLowerCase();
                const term = searchTerm.toLowerCase();

                const matchesSearch = studentName.includes(term) || subject.includes(term);
                const matchesStatus = filterStatus === 'All' || record.status === filterStatus;
                
                return matchesSearch && matchesStatus;
            });
    }, [attendanceRecords, userMap, searchTerm, filterStatus]);


    return (
        <Card>
            <CardHeader>
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>View all attendance records for every student and class.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 mb-4">
                    <Input 
                        placeholder="Search by student or subject..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className='w-[180px]'>
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Statuses</SelectItem>
                            <SelectItem value="Present">Present</SelectItem>
                            <SelectItem value="Absent">Absent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(attendanceLoading || usersLoading) ? (
                            <TableRow><TableCell colSpan={4} className="text-center">Loading records...</TableCell></TableRow>
                        ) : (
                            <>
                            {filteredRecords.length > 0 ? filteredRecords.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-medium">{record.studentName}</TableCell>
                                    <TableCell>{record.subject}</TableCell>
                                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={record.status === 'Present' ? 'default' : 'destructive'} className={record.status === 'Present' ? 'bg-green-500' : ''}>
                                            {record.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">No records match your filters.</TableCell>
                                </TableRow>
                            )}
                           </>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default function AttendancePage() {
    const { user } = useAuth();
    
    return (
        <div className="space-y-6">
            {user?.role === 'Teacher' && <TeacherAttendance />}
            {user?.role === 'Student' && <StudentAttendance />}
            {user?.role === 'Admin' && <AdminAttendance />}
        </div>
    );
}
