'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { blogPosts } from '@/lib/mock-data';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, Edit, PlusCircle } from 'lucide-react';

const AdminBlogApproval = () => {
    const pendingPosts = blogPosts.filter(p => p.status === 'Pending');

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
                                    <Button size="sm" className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-4 w-4 mr-2" />Approve</Button>
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
    const publishedPosts = blogPosts.filter(p => p.status === 'Published');

    return (
        <Tabs defaultValue="all-posts" className="space-y-6">
            <div className="flex items-center">
                <TabsList>
                    <TabsTrigger value="all-posts">All Posts</TabsTrigger>
                    {user?.role === 'Admin' && <TabsTrigger value="approval">Approval Queue</TabsTrigger>}
                </TabsList>
                <div className="ml-auto">
                    <Button><PlusCircle className="mr-2 h-4 w-4" />New Post</Button>
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
                    <AdminBlogApproval />
                </TabsContent>
            )}
        </Tabs>
    );
}
