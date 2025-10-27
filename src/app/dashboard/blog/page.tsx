'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { blogPosts as mockBlogPosts, type BlogPost } from '@/lib/mock-data';
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

const NewPostForm = ({ onAddPost }: { onAddPost: (post: Omit<BlogPost, 'id' | 'author' | 'date' | 'slug'>) => void }) => {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const title = formData.get('title') as string;
        const excerpt = formData.get('excerpt') as string;
        const image = formData.get('image') as string;

        if (title && excerpt) {
            onAddPost({ title, excerpt, image, status: 'Pending' });
            toast({ title: "Success", description: "Blog post submitted for approval." });
            setOpen(false);
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

const AdminBlogApproval = ({ posts, onApprove, onReject }: { posts: BlogPost[], onApprove: (id: number) => void, onReject: (id: number) => void }) => {
    const pendingPosts = posts.filter(p => p.status === 'Pending');

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pending Blog Posts</CardTitle>
                <CardDescription>Review and approve posts submitted by students and teachers.</CardDescription>
            </CardHeader>
            <CardContent>
                {pendingPosts.length > 0 ? (
                    <div className="space-y-4">
                        {pendingPosts.map(post => (
                             <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="font-semibold">{post.title}</p>
                                    <p className="text-sm text-muted-foreground">by {post.author}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">View Post</Button>
                                    <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => onApprove(post.id)}>
                                        <CheckCircle className="h-4 w-4 mr-2" />Approve
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => onReject(post.id)}>
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
    const [blogPosts, setBlogPosts] = useState(mockBlogPosts);

    const handleAddPost = (newPost: Omit<BlogPost, 'id' | 'author' | 'date' | 'slug'>) => {
        const postToAdd: BlogPost = {
            ...newPost,
            id: blogPosts.length + 1,
            author: user?.name || 'User',
            date: new Date().toISOString().split('T')[0],
            slug: newPost.title.toLowerCase().replace(/\s+/g, '-'),
        };
        setBlogPosts([postToAdd, ...blogPosts]);
    };

    const handleApprovePost = (id: number) => {
        setBlogPosts(blogPosts.map(p => p.id === id ? { ...p, status: 'Published' } : p));
    };

    const handleRejectPost = (id: number) => {
        setBlogPosts(blogPosts.filter(p => p.id !== id));
    };

    const publishedPosts = blogPosts.filter(p => p.status === 'Published');

    return (
        <Tabs defaultValue="all-posts" className="space-y-6">
            <div className="flex items-center">
                <TabsList>
                    <TabsTrigger value="all-posts">All Posts</TabsTrigger>
                    {user?.role === 'Admin' && <TabsTrigger value="approval">Approval Queue</TabsTrigger>}
                </TabsList>
                <div className="ml-auto">
                    <NewPostForm onAddPost={handleAddPost} />
                </div>
            </div>

            <TabsContent value="all-posts">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {publishedPosts.map(post => (
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
                                <CardDescription>By {post.author} on {post.date}</CardDescription>
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
            </TabsContent>
            {user?.role === 'Admin' && (
                <TabsContent value="approval">
                    <AdminBlogApproval posts={blogPosts} onApprove={handleApprovePost} onReject={handleRejectPost} />
                </TabsContent>
            )}
        </Tabs>
    );
}
