'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, Edit, PlusCircle, Trash } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { getFirestore, collection, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';

type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  image?: string;
  author: string;
  authorId: string;
  date: any;
  status: 'Published' | 'Pending';
  slug: string;
  createdAt: any;
};

const NewPostForm = () => {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const { app } = useFirebase();
    const db = getFirestore(app);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const title = formData.get('title') as string;
        const excerpt = formData.get('excerpt') as string;
        const image = formData.get('image') as string;

        if (title && excerpt && user) {
            try {
                await addDoc(collection(db, 'blogPosts'), {
                    title,
                    excerpt,
                    image,
                    status: 'Pending',
                    author: user.name,
                    authorId: user.uid,
                    createdAt: serverTimestamp(),
                    slug: title.toLowerCase().replace(/\s+/g, '-'),
                });
                toast({ title: "Success", description: "Blog post submitted for approval." });
                setOpen(false);
            } catch (e) {
                 toast({ title: "Error", description: "Could not submit post.", variant: "destructive" });
            }
        } else {
            toast({ title: "Error", description: "Please fill out title and excerpt.", variant: "destructive" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" />New Post</Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create a new blog post</DialogTitle>
                        <DialogDescription>
                            Your post will be submitted for admin approval.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" name="title" placeholder="Your post title" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="excerpt">Excerpt</Label>
                            <Textarea id="excerpt" name="excerpt" placeholder="A short summary of your post." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image">Image URL (Optional)</Label>
                            <Input id="image" name="image" placeholder="https://example.com/image.jpg" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Submit for Approval</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const AdminBlogApproval = () => {
    const { app } = useFirebase();
    const db = getFirestore(app);
    const { toast } = useToast();
    const allPostsQuery = query(collection(db, 'blogPosts'), orderBy('createdAt', 'desc'));
    const { data: allPosts, loading } = useCollection<BlogPost>(allPostsQuery);

    const pendingPosts = allPosts?.filter(post => post.status === 'Pending');

    const handleApprove = async (id: string) => {
        const postRef = doc(db, 'blogPosts', id);
        try {
            await updateDoc(postRef, { status: 'Published' });
            toast({ title: "Post Approved", description: "The blog post is now live." });
        } catch (error) {
            toast({ title: "Error", description: "Could not approve the post.", variant: 'destructive' });
        }
    };

    const handleReject = async (id: string) => {
        const postRef = doc(db, 'blogPosts', id);
        try {
            await deleteDoc(postRef);
            toast({ title: "Post Rejected", description: "The blog post has been deleted." });
        } catch (error) {
            toast({ title: "Error", description: "Could not reject the post.", variant: 'destructive' });
        }
    };

    if (loading) return <p>Loading pending posts...</p>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pending Blog Posts</CardTitle>
                <CardDescription>Review and approve posts submitted by students and teachers.</CardDescription>
            </CardHeader>
            <CardContent>
                {pendingPosts && pendingPosts.length > 0 ? (
                    <div className="space-y-4">
                        {pendingPosts.map(post => (
                             <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="font-semibold">{post.title}</p>
                                    <p className="text-sm text-muted-foreground">by {post.author}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">View Post</Button>
                                    <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleApprove(post.id)}>
                                        <CheckCircle className="h-4 w-4 mr-2" />Approve
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleReject(post.id)}>
                                        <Trash className="h-4 w-4 mr-2" />Reject
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-8 text-muted-foreground">No pending posts for approval.</p>
                )}
            </CardContent>
        </Card>
    );
};


export default function BlogPage() {
    const { user } = useAuth();
    const { app } = useFirebase();
    const db = getFirestore(app);

    const allPostsQuery = query(collection(db, 'blogPosts'), orderBy('createdAt', 'desc'));
    const { data: allPosts, loading } = useCollection<BlogPost>(allPostsQuery);
    
    const publishedPosts = allPosts?.filter(post => post.status === 'Published');

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'Just now';
        return timestamp.toDate().toLocaleDateString();
    }

    return (
        <Tabs defaultValue="all-posts" className="space-y-6">
            <div className="flex items-center">
                <TabsList>
                    <TabsTrigger value="all-posts">All Posts</TabsTrigger>
                    {user?.role === 'Admin' && <TabsTrigger value="approval">Approval Queue</TabsTrigger>}
                </TabsList>
                <div className="ml-auto">
                    <NewPostForm />
                </div>
            </div>

            <TabsContent value="all-posts">
                {loading && <p>Loading posts...</p>}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {publishedPosts && publishedPosts.map(post => (
                        <Card key={post.id} className="flex flex-col">
                            {post.image && (
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    width={600}
                                    height={400}
                                    className="rounded-t-lg object-cover aspect-[3/2]"
                                    data-ai-hint="blog image"
                                />
                            )}
                            <CardHeader>
                                <CardTitle>{post.title}</CardTitle>
                                <CardDescription>By {post.author} on {formatDate(post.createdAt)}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full">Read More</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
                 {!loading && publishedPosts && publishedPosts.length === 0 && (
                    <p className="text-center py-12 text-muted-foreground">No published posts yet.</p>
                )}
            </TabsContent>
            {user?.role === 'Admin' && (
                <TabsContent value="approval">
                    <AdminBlogApproval />
                </TabsContent>
            )}
        </Tabs>
    );
}
