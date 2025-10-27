'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart, Book, Calendar, Megaphone, Users } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { getFirestore, collection } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { User } from '@/lib/types';

const AdminDashboard = () => {
    const { app } = useFirebase();
    const db = getFirestore(app);
    
    const { data: users } = useCollection<User>(collection(db, 'users'));
    const { data: blogPosts } = useCollection(collection(db, 'blogPosts'));
    const { data: events } = useCollection(collection(db, 'events'));

    const totalStudents = users?.filter(u => u.role === 'Student').length || 0;
    const totalTeachers = users?.filter(u => u.role === 'Teacher').length || 0;
    const pendingBlogs = blogPosts?.filter(p => p.status === 'Pending').length || 0;
    const activeEvents = events?.length || 0;
    
    return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStudents}</div>
                <p className="text-xs text-muted-foreground">Currently enrolled</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Blogs</CardTitle>
                <Book className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingBlogs}</div>
                <p className="text-xs text-muted-foreground">Ready for review</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTeachers}</div>
                 <p className="text-xs text-muted-foreground">On staff</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeEvents}</div>
                <p className="text-xs text-muted-foreground">Upcoming this month</p>
              </CardContent>
            </Card>
          </div>
    )
};

const TeacherDashboard = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Class</CardTitle>
        <CardDescription>Your next class is about to begin.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Check your schedule for details.</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>New Announcements</CardTitle>
        <CardDescription>Keep students informed.</CardDescription>
      </CardHeader>
       <CardContent>
        <p>Post a new notice for your classes.</p>
      </CardContent>
    </Card>
     <Card>
      <CardHeader>
        <CardTitle>Study Materials</CardTitle>
        <CardDescription>Upload new resources.</CardDescription>
      </CardHeader>
       <CardContent>
        <p>Share notes, slides, and more.</p>
      </CardContent>
    </Card>
  </div>
);

const StudentDashboard = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
        <BarChart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">--%</div>
        <p className="text-xs text-muted-foreground">Will be calculated soon</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">--</div>
        <p className="text-xs text-muted-foreground">Check the events page for details</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">New Announcements</CardTitle>
        <Megaphone className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">--</div>
        <p className="text-xs text-muted-foreground">Check the announcements page</p>
      </CardContent>
    </Card>
  </div>
);

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

    