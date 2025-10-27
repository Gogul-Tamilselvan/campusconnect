'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart, Book, Calendar, Megaphone, Users } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { getFirestore, collection, query, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { User } from '@/lib/types';

const AdminDashboard = () => {
    const { app } = useFirebase();
    const db = getFirestore(app);
    
    const { data: users, loading: usersLoading } = useCollection<User>(collection(db, 'users'));
    const { data: blogPosts, loading: blogPostsLoading } = useCollection(collection(db, 'blogPosts'));
    const { data: events, loading: eventsLoading } = useCollection(collection(db, 'events'));

    const totalStudents = users?.filter(u => u.role === 'Student').length || 0;
    const totalTeachers = users?.filter(u => u.role === 'Teacher').length || 0;
    const pendingBlogs = blogPosts?.filter(p => p.status === 'Pending').length || 0;
    const activeEvents = events?.length || 0;
    
    const loading = usersLoading || blogPostsLoading || eventsLoading;

    return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? <div className="text-2xl font-bold">-</div> : <div className="text-2xl font-bold">{totalStudents}</div>}
                <p className="text-xs text-muted-foreground">Currently enrolled</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Blogs</CardTitle>
                <Book className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? <div className="text-2xl font-bold">-</div> : <div className="text-2xl font-bold">{pendingBlogs}</div>}
                <p className="text-xs text-muted-foreground">Ready for review</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? <div className="text-2xl font-bold">-</div> : <div className="text-2xl font-bold">{totalTeachers}</div>}
                 <p className="text-xs text-muted-foreground">On staff</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? <div className="text-2xl font-bold">-</div> : <div className="text-2xl font-bold">{activeEvents}</div>}
                <p className="text-xs text-muted-foreground">Upcoming this month</p>
              </CardContent>
            </Card>
          </div>
    )
};

const TeacherDashboard = () => {
    const { user } = useAuth();
    const { app } = useFirebase();
    const db = getFirestore(app);

    const today = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[today.getDay()];

    const timetableQuery = user ? query(collection(db, 'timetables'), where('teacher', '==', user.name), where('day', '==', currentDay)) : null;
    const { data: upcomingClasses, loading: classesLoading } = useCollection(timetableQuery);
    const { data: announcements, loading: announcementsLoading } = useCollection(collection(db, 'announcements'));
    const { data: materials, loading: materialsLoading } = useCollection(collection(db, 'materials'));

    const loading = classesLoading || announcementsLoading || materialsLoading;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <div className="text-2xl font-bold">-</div> : <div className="text-2xl font-bold">{upcomingClasses?.length || 0}</div>}
            <p className="text-xs text-muted-foreground">classes scheduled for today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Announcements</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
           <CardContent>
             {loading ? <div className="text-2xl font-bold">-</div> : <div className="text-2xl font-bold">{announcements?.length || 0}</div>}
            <p className="text-xs text-muted-foreground">announcements posted</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Study Materials</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
           <CardContent>
             {loading ? <div className="text-2xl font-bold">-</div> : <div className="text-2xl font-bold">{materials?.length || 0}</div>}
            <p className="text-xs text-muted-foreground">materials uploaded</p>
          </CardContent>
        </Card>
      </div>
    );
};

const StudentDashboard = () => {
    const { user } = useAuth();
    const { app } = useFirebase();
    const db = getFirestore(app);

    const attendanceQuery = user ? query(collection(db, 'attendance'), where('studentId', '==', user.uid)) : null;
    const { data: attendanceRecords, loading: attendanceLoading } = useCollection(attendanceQuery);
    
    const { data: events, loading: eventsLoading } = useCollection(collection(db, 'events'));
    const { data: announcements, loading: announcementsLoading } = useCollection(collection(db, 'announcements'));
    
    const overallAttendance = () => {
        if (!attendanceRecords || attendanceRecords.length === 0) return 0;
        const presentCount = attendanceRecords.filter(r => r.status === 'Present').length;
        return Math.round((presentCount / attendanceRecords.length) * 100);
    }
    
    const loading = attendanceLoading || eventsLoading || announcementsLoading;

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <div className="text-2xl font-bold">-</div> : <div className="text-2xl font-bold">{overallAttendance()}%</div>}
            <p className="text-xs text-muted-foreground">Based on all recorded classes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <div className="text-2xl font-bold">-</div> : <div className="text-2xl font-bold">{events?.length || 0}</div>}
            <p className="text-xs text-muted-foreground">Check the events page for details</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Announcements</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <div className="text-2xl font-bold">-</div> : <div className="text-2xl font-bold">{announcements?.length || 0}</div>}
            <p className="text-xs text-muted-foreground">Check the announcements page</p>
          </CardContent>
        </Card>
      </div>
    );
};

export default function DashboardPage() {
  const { user } = useAuth();

  const renderDashboardContent = () => {
    switch (user?.role) {
      case 'Admin':
        return <AdminDashboard />;
      case 'Teacher':
        return <TeacherDashboard />;
      case 'Student':
        return <StudentDashboard />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name}!</h2>
        <p className="text-muted-foreground">Here&apos;s a quick overview of your campus activities.</p>
      </div>
      {renderDashboardContent()}
    </div>
  );
}

    
