
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { polls as mockPolls, type Poll, type PollOption } from '@/lib/mock-data';
import { CheckSquare, PlusCircle, Trash2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

const CreatePollForm = ({ onAddPoll }: { onAddPoll: (poll: Omit<Poll, 'id' | 'author' | 'date'>) => void }) => {
    const [open, setOpen] = useState(false);
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const { toast } = useToast();

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, '']);
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
        }
    };

    const handleSubmit = () => {
        if (question && options.every(opt => opt)) {
            const newPollOptions: PollOption[] = options.map((opt, index) => ({ id: index + 1, text: opt, votes: 0 }));
            onAddPoll({ question, options: newPollOptions });
            toast({ title: 'Success', description: 'Poll created successfully.' });
            setOpen(false);
            setQuestion('');
            setOptions(['', '']);
        } else {
            toast({ title: 'Error', description: 'Please fill out the question and all option fields.', variant: 'destructive' });
        }
    };


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Poll
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create a new poll</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a poll for students.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="question">Question</Label>
                        <Input id="question" placeholder="e.g., Best time for extra class?" value={question} onChange={e => setQuestion(e.target.value)} />
                    </div>
                    {options.map((option, index) => (
                        <div key={index} className="space-y-2">
                            <Label htmlFor={`option${index + 1}`}>Option {index + 1}</Label>
                            <div className='flex items-center gap-2'>
                                <Input id={`option${index + 1}`} value={option} onChange={e => handleOptionChange(index, e.target.value)} placeholder={`e.g., Option ${index + 1}`} />
                                {options.length > 2 && <Button variant="ghost" size="icon" onClick={() => removeOption(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                            </div>
                        </div>
                    ))}

                    <Button variant="outline" onClick={addOption}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Option
                    </Button>
                </div>
                <DialogFooter>
                    <Button type="button" onClick={handleSubmit}>Create Poll</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const PollResults = ({ poll }: { poll: Poll }) => {
    const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

    return (
        <div className="space-y-2">
            {poll.options.map(option => {
                const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                return (
                    <div key={option.id}>
                        <div className="flex justify-between text-sm mb-1">
                            <span>{option.text}</span>
                            <span>{option.votes} votes ({percentage}%)</span>
                        </div>
                        <Progress value={percentage} />
                    </div>
                )
            })}
        </div>
    )
};


const PollCard = ({ poll, role, onVote }: { poll: Poll, role: 'Student' | 'Teacher' | 'Admin', onVote: (pollId: number, optionId: number) => void }) => {
    const [selectedOption, setSelectedOption] = useState<string | undefined>();
    const [voted, setVoted] = useState(false);

    const isStudent = role === 'Student';
    const canVote = isStudent && !voted;

    const handleVote = () => {
        if (selectedOption) {
            setVoted(true);
            onVote(poll.id, parseInt(selectedOption, 10));
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
                                <RadioGroupItem value={String(option.id)} id={`${poll.id}-${option.id}`} />
                                <Label htmlFor={`${poll.id}-${option.id}`}>{option.text}</Label>
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
    const [polls, setPolls] = useState(mockPolls);
    const canCreate = user?.role === 'Teacher' || user?.role === 'Admin';
    
    const handleAddPoll = (newPoll: Omit<Poll, 'id' | 'author' | 'date'>) => {
        const pollToAdd: Poll = {
            ...newPoll,
            id: polls.length + 1,
            author: user?.name || 'User',
            date: new Date().toISOString().split('T')[0],
        };
        setPolls([pollToAdd, ...polls]);
    };

    const handleVote = (pollId: number, optionId: number) => {
        setPolls(polls.map(p => {
            if (p.id === pollId) {
                const newOptions = p.options.map(opt => {
                    if (opt.id === optionId) {
                        return { ...opt, votes: opt.votes + 1 };
                    }
                    return opt;
                });
                return { ...p, options: newOptions };
            }
            return p;
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Polls & Surveys</h1>
                {canCreate && <CreatePollForm onAddPoll={handleAddPoll} />}
            </div>

            {polls.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {polls.map(poll => (
                       <PollCard key={poll.id} poll={poll} role={user!.role} onVote={handleVote} />
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
