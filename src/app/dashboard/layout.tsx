'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BarChart, Book, Calendar, Home, Megaphone, QrCode, ScrollText, Users, CheckSquare
} from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { UserNav } from '@/components/user-nav';
import type { UserRole } from '@/lib/types';
import Link from 'next/link';

const navItems: Record<UserRole, { href: string; icon: React.ElementType; label: string; }[]> = {
  Student: [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/timetable', icon: Calendar, label: 'Timetable' },
    { href: '/dashboard/attendance', icon: QrCode, label: 'My Attendance' },
    { href: '/dashboard/announcements', icon: Megaphone, label: 'Announcements' },
    { href: '/dashboard/materials', icon: Book, label: 'Study Materials' },
    { href: '/dashboard/blog', icon: ScrollText, label: 'Blog' },
    { href: '/dashboard/events', icon: Calendar, label: 'Events' },
    { href: '/dashboard/polls', icon: CheckSquare, label: 'Polls & Surveys' },
  ],
  Teacher: [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/timetable', icon: Calendar, label: 'My Schedule' },
    { href: '/dashboard/attendance', icon: QrCode, label: 'Take Attendance' },
    { href: '/dashboard/announcements', icon: Megaphone, label: 'Post Notice' },
    { href: '/dashboard/materials', icon: Book, label: 'Upload Material' },
    { href: '/dashboard/blog', icon: ScrollText, label: 'My Blogs' },
    { href: '/dashboard/events', icon: Calendar, label: 'Events' },
    { href: '/dashboard/polls', icon: CheckSquare, label: 'Polls & Surveys' },
  ],
  Admin: [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/timetable', icon: Calendar, label: 'Manage Timetables' },
    { href: '/dashboard/attendance', icon: BarChart, label: 'Attendance Records' },
    { href: '/dashboard/announcements', icon: Megaphone, label: 'Manage Notices' },
    { href: '/dashboard/materials', icon: Book, label: 'Manage Materials' },
    { href: '/dashboard/blog', icon: ScrollText, label: 'Approve Blogs' },
    { href: '/dashboard/events', icon: Calendar, label: 'Manage Events' },
    { href: '/dashboard/users', icon: Users, label: 'Manage Users' },
    { href: '/dashboard/polls', icon: CheckSquare, label: 'Manage Polls' },
  ],
};

const pageTitles: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/dashboard/timetable': 'Timetable',
  '/dashboard/attendance': 'Attendance',
  '/dashboard/announcements': 'Announcements',
  '/dashboard/materials': 'Study Materials',
  '/dashboard/blog': 'Blog',
  '/dashboard/events': 'Events Calendar',
  '/dashboard/users': 'User Management',
  '/dashboard/polls': 'Polls & Surveys',
};


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const currentNavItems = navItems[user.role] || [];
  const currentPageTitle = pageTitles[pathname] || 'CampusConnect';


  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {currentNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <span>
                      <item.icon />
                      <span>{item.label}</span>
                    </span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
            <SidebarTrigger className="sm:hidden" />
            <h1 className="text-xl font-semibold">{currentPageTitle}</h1>
            <div className="ml-auto">
              <UserNav />
            </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
