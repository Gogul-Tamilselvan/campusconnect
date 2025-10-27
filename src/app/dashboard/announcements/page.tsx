'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Megaphone, PlusCircle } from 'lucide-react';
import { announcements as mockAnnouncements, type Announcement } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const PostAnnouncementForm = ({ onAddAnnouncement }: { onAddAnnouncement: (announcement: Omit<Announcement, 'id' | 'author' | 'date'>) => void }) => {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const title = formData.get('title') as string;
        const content = formData.get('content') as string;

        if (title && content) {
            onAddAnnouncement({ title, content, read: false });
            toast({ title: "Success", description: "Announcement posted." });
            setOpen(false);
        } else {
            toast({ title: "Error", description: "Please fill out all fields.", variant: "destructive" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Post New Announcement
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
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
                            <Input id="title" name="title" placeholder="e.g. Mid-term Exam Schedule" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="content" className="text-right">
                                Content
                            </Label>
                            <Textarea id="content" name="content" placeholder="Enter announcement details here." className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Post Announcement</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default function AnnouncementsPage() {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState(mockAnnouncements);
    const canPost = user?.role === 'Admin' || user?.role === 'Teacher';

    const handleAddAnnouncement = (newAnnouncement: Omit<Announcement, 'id' | 'author' | 'date'>) => {
        const announcementToAdd: Announcement = {
            ...newAnnouncement,
            id: announcements.length + 1,
            author: user?.name || 'User',
            date: new Date().toISOString().split('T')[0],
        };
        setAnnouncements([announcementToAdd, ...announcements]);
    };


    return (
        <div className="space-y-6">
            {canPost && (
                <div className="flex justify-end">
                    <PostAnnouncementForm onAddAnnouncement={handleAddAnnouncement} />
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
