'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckSquare, PlusCircle, Trash2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { getFirestore, collection, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove, getDoc, query, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';

type PollOption = {
  id: number;
  text: string;
  votes: number;
};

type Poll = {
  id: string;
  question: string;
  options: PollOption[];
  author: string;
  date: any;
  votedBy: string[];
};

const CreatePollForm = () => {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const { toast } = useToast();
    const { app } = useFirebase();
    const db = getFirestore(app);

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

    const handleSubmit = async () => {
        if (question && options.every(opt => opt) && user) {
            const newPollOptions: PollOption[] = options.map((opt, index) => ({ id: index + 1, text: opt, votes: 0 }));
             try {
                await addDoc(collection(db, 'polls'), {
                    question,
                    options: newPollOptions,
                    author: user.name,
                    authorId: user.uid,
                    createdAt: serverTimestamp(),
                    votedBy: []
                });
                toast({ title: 'Success', description: 'Poll created successfully.' });
                setOpen(false);
                setQuestion('');
                setOptions(['', '']);
            } catch (e) {
                toast({ title: 'Error', description: 'Could not create poll.', variant: 'destructive' });
            }
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


const PollCard = ({ poll }: { poll: Poll }) => {
    const { user } = useAuth();
    const { app } = useFirebase();
    const db = getFirestore(app);
    const { toast } = useToast();
    const [selectedOption, setSelectedOption] = useState<string | undefined>();
    
    const hasVoted = user ? poll.votedBy.includes(user.uid) : false;
    const isStudent = user?.role === 'Student';
    const canVote = isStudent && !hasVoted;

    const handleVote = async () => {
        if (selectedOption && user && canVote) {
            const pollRef = doc(db, 'polls', poll.id);
            try {
                const pollDoc = await getDoc(pollRef);
                if (!pollDoc.exists()) throw new Error("Poll not found");

                const currentPollData = pollDoc.data() as Poll;
                const newOptions = currentPollData.options.map(opt => 
                    opt.id === parseInt(selectedOption, 10) ? { ...opt, votes: opt.votes + 1 } : opt
                );
                
                await updateDoc(pollRef, {
                    options: newOptions,
                    votedBy: arrayUnion(user.uid)
                });

                toast({ title: 'Vote Cast!', description: "Your vote has been recorded." });

            } catch (error) {
                toast({ title: 'Error', description: 'Could not cast your vote.', variant: 'destructive' });
            }
        }
    }

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'Just now';
        return timestamp.toDate().toLocaleDateString();
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{poll.question}</CardTitle>
                <CardDescription>Posted by {poll.author} on {formatDate(poll.createdAt)}</CardDescription>
            </CardHeader>
            <CardContent>
                { (hasVoted || !isStudent) ? (
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
    const { app } = useFirebase();
    const db = getFirestore(app);
    const pollsQuery = query(collection(db, 'polls'), orderBy('createdAt', 'desc'));
    const { data: polls, loading } = useCollection<Poll>(pollsQuery);

    const canCreate = user?.role === 'Teacher' || user?.role === 'Admin';
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Polls & Surveys</h1>
                {canCreate && <CreatePollForm />}
            </div>

            {loading && <p>Loading polls...</p>}

            {polls && polls.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {polls.map(poll => (
                       <PollCard key={poll.id} poll={poll} />
                    ))}
                </div>
            ) : (
                !loading && (
                    <div className="text-center py-12 text-muted-foreground">
                        <CheckSquare className="mx-auto h-12 w-12"/>
                        <h3 className="mt-4 text-lg font-semibold">No Polls Available</h3>
                        <p className="mt-2 text-sm">There are no active polls or surveys at the moment.</p>
                    </div>
                )
            )}
        </div>
    );
}
