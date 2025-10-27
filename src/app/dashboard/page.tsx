'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart, Book, Calendar, Megaphone } from 'lucide-react';

const AdminDashboard = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
        <UsersIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">1,254</div>
        <p className="text-xs text-muted-foreground">+5% from last month</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Pending Blogs</CardTitle>
        <Book className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">3</div>
        <p className="text-xs text-muted-foreground">Ready for review</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
        <UsersIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">82</div>
        <p className="text-xs text-muted-foreground">+2 new hires</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Active Events</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">5</div>
        <p className="text-xs text-muted-foreground">Upcoming this month</p>
      </CardContent>
    </Card>
  </div>
);

const TeacherDashboard = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Class</CardTitle>
        <CardDescription>Data Structures at 10:00 AM</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Room: CS-101</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>New Announcements</CardTitle>
        <CardDescription>You have 2 new announcements to post.</CardDescription>
      </CardHeader>
       <CardContent>
        <p>Last post was 3 days ago.</p>
      </CardContent>
    </Card>
     <Card>
      <CardHeader>
        <CardTitle>Study Materials</CardTitle>
        <CardDescription>You have uploaded 5 files this semester.</CardDescription>
      </CardHeader>
       <CardContent>
        <p>Total downloads: 150</p>
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
        <div className="text-2xl font-bold">85%</div>
        <p className="text-xs text-muted-foreground">Last updated today</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">2</div>
        <p className="text-xs text-muted-foreground">Innovate & Create Hackathon is next</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">New Announcements</CardTitle>
        <Megaphone className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">1</div>
        <p className="text-xs text-muted-foreground">Mid-term Exams Schedule posted</p>
      </CardContent>
    </Card>
  </div>
);


function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  }

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
