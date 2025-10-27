'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Megaphone, PlusCircle } from 'lucide-react';
import { announcements } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const PostAnnouncementForm = () => (
    <Dialog>
        <DialogTrigger asChild>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Post New Announcement
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogDescription>
                    Fill in the details below to post a new announcement to all users.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                        Title
                    </Label>
                    <Input id="title" placeholder="e.g. Mid-term Exam Schedule" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="content" className="text-right">
                        Content
                    </Label>
                    <Textarea id="content" placeholder="Enter announcement details here." className="col-span-3" />
                </div>
            </div>
            <DialogFooter>
                <Button type="submit">Post Announcement</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

export default function AnnouncementsPage() {
    const { user } = useAuth();
    const canPost = user?.role === 'Admin' || user?.role === 'Teacher';

    return (
        <div className="space-y-6">
            {canPost && (
                <div className="flex justify-end">
                    <PostAnnouncementForm />
                </div>
            )}
            <div className="space-y-4">
                {announcements.map(announcement => (
                    <Card key={announcement.id}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{announcement.title}</CardTitle>
                                {!announcement.read && <Badge>New</Badge>}
                            </div>
                            <CardDescription>
                                Posted by {announcement.author} on {announcement.date}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{announcement.content}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
             {announcements.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Megaphone className="mx-auto h-12 w-12"/>
                    <h3 className="mt-4 text-lg font-semibold">No Announcements Yet</h3>
                    <p className="mt-2 text-sm">Check back later for updates.</p>
                </div>
             )}
        </div>
    );
}
