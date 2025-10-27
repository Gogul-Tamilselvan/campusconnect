'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { polls, type Poll } from '@/lib/mock-data';
import { CheckSquare, PlusCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';

const CreatePollForm = () => (
    <Dialog>
        <DialogTrigger asChild>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Poll
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Create a new poll</DialogTitle>
                <DialogDescription>
                    Fill in the details below to create a poll for students.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="question" className="text-right">
                        Question
                    </Label>
                    <Input id="question" placeholder="e.g., Best time for extra class?" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="option1" className="text-right">
                        Option 1
                    </Label>
                    <Input id="option1" placeholder="e.g., Saturday 10 AM" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="option2" className="text-right">
                        Option 2
                    </Label>
                    <Input id="option2" placeholder="e.g., Sunday 2 PM" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="option3" className="text-right">
                        Option 3
                    </Label>
                    <Input id="option3" placeholder="e.g., Weekday evening" className="col-span-3" />
                </div>
            </div>
            <DialogFooter>
                <Button type="submit">Create Poll</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

const PollResults = ({ poll }: { poll: Poll }) => {
    const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

    return (
        <div className="space-y-2">
            {poll.options.map(option => {
                const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                return (
                    <div key={option.id}>
                        <div className="flex justify-between text-sm mb-1">
                            <span>{option.text}</span>
                            <span>{option.votes} votes</span>
                        </div>
                        <Progress value={percentage} />
                    </div>
                )
            })}
        </div>
    )
};


const PollCard = ({ poll, role }: { poll: Poll, role: 'Student' | 'Teacher' | 'Admin' }) => {
    const [selectedOption, setSelectedOption] = useState<string | undefined>();
    const [voted, setVoted] = useState(false);

    const isStudent = role === 'Student';
    const canVote = isStudent && !voted;

    const handleVote = () => {
        if (selectedOption) {
            setVoted(true);
            // In a real app, you would submit this vote to the backend
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{poll.question}</CardTitle>
                <CardDescription>Posted by {poll.author} on {poll.date}</CardDescription>
            </CardHeader>
            <CardContent>
                { (voted || !isStudent) ? (
                    <PollResults poll={poll} />
                ) : (
                    <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                        {poll.options.map(option => (
                            <div key={option.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={String(option.id)} id={String(option.id)} />
                                <Label htmlFor={String(option.id)}>{option.text}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                )}
            </CardContent>
            {canVote && (
                 <CardFooter>
                    <Button onClick={handleVote} disabled={!selectedOption}>Vote</Button>
                </CardFooter>
            )}
        </Card>
    );
};

export default function PollsPage() {
    const { user } = useAuth();
    const canCreate = user?.role === 'Teacher' || user?.role === 'Admin';
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Polls & Surveys</h1>
                {canCreate && <CreatePollForm />}
            </div>

            {polls.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {polls.map(poll => (
                       <PollCard key={poll.id} poll={poll} role={user!.role} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <CheckSquare className="mx-auto h-12 w-12"/>
                    <h3 className="mt-4 text-lg font-semibold">No Polls Available</h3>
                    <p className="mt-2 text-sm">There are no active polls or surveys at the moment.</p>
                </div>
            )}
        </div>
    );
}
