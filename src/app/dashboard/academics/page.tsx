'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type AcademicItem = {
  id: string;
  name: string;
};

type SubjectItem = AcademicItem & {
    department: string;
    semester: string;
}

const AddDepartmentForm = ({ collectionName, itemName, onUpdate }: { collectionName: string, itemName: string, onUpdate: () => void }) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const { toast } = useToast();
    const { app } = useFirebase();
    const db = getFirestore(app);

    const handleSubmit = async () => {
        if (name) {
            try {
                await addDoc(collection(db, collectionName), {
                    name,
                    createdAt: serverTimestamp(),
                });
                toast({ title: "Success", description: `${itemName} added.` });
                setName('');
                setOpen(false);
                onUpdate();
            } catch (error) {
                 toast({ title: "Error", description: `Could not add ${itemName}.`, variant: "destructive" });
            }
        } else {
            toast({ title: "Error", description: "Name cannot be empty.", variant: "destructive" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add {itemName}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add {itemName}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={`e.g. Computer Science`} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" onClick={handleSubmit}>Add</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const AddSubjectForm = ({ onUpdate }: { onUpdate: () => void }) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [department, setDepartment] = useState('');
    const [semester, setSemester] = useState('');
    const { toast } = useToast();
    const { app } = useFirebase();
    const db = getFirestore(app);

    const departmentsQuery = query(collection(db, 'departments'), orderBy('name', 'asc'));
    const {data: departments, loading: departmentsLoading } = useCollection<{id:string, name:string}>(departmentsQuery, { listen: false });

    const semestersQuery = query(collection(db, 'semesters'), orderBy('name', 'asc'));
    const {data: semesters, loading: semestersLoading } = useCollection<{id:string, name:string}>(semestersQuery, { listen: false });

    const handleSubmit = async () => {
        if (name && department && semester) {
            try {
                await addDoc(collection(db, 'subjects'), {
                    name,
                    department,
                    semester,
                    createdAt: serverTimestamp(),
                });
                toast({ title: "Success", description: `Subject added.` });
                setName('');
                setDepartment('');
                setSemester('');
                setOpen(false);
                onUpdate();
            } catch (error) {
                 toast({ title: "Error", description: `Could not add subject.`, variant: "destructive" });
            }
        } else {
            toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Subject
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Subject</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Data Structures" className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Department</Label>
                        <Select onValueChange={setDepartment} value={department}>
                            <SelectTrigger className="col-span-3"><SelectValue placeholder="Select Department" /></SelectTrigger>
                            <SelectContent>
                                {departmentsLoading ? <SelectItem value="loading" disabled>Loading...</SelectItem> : 
                                departments?.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)
                                }
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Semester</Label>
                        <Select onValueChange={setSemester} value={semester}>
                            <SelectTrigger className="col-span-3"><SelectValue placeholder="Select Semester" /></SelectTrigger>
                            <SelectContent>
                                {semestersLoading ? <SelectItem value="loading" disabled>Loading...</SelectItem> :
                                    semesters?.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)
                                }
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" onClick={handleSubmit}>Add</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


const ItemList = ({ collectionName, itemName }: { collectionName: string, itemName: string }) => {
    const { app } = useFirebase();
    const db = getFirestore(app);
    const { toast } = useToast();
    
    const itemsQuery = query(collection(db, collectionName), orderBy('name', 'asc'));
    const { data: items, loading, refetch } = useCollection<AcademicItem>(itemsQuery, { listen: false });

    const handleDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, collectionName, id));
            toast({ title: 'Success', description: `${itemName} deleted.` });
            refetch();
        } catch (error) {
            toast({ title: 'Error', description: `Could not delete ${itemName}.`, variant: 'destructive' });
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Manage {itemName}s</CardTitle>
                    <AddDepartmentForm collectionName={collectionName} itemName={itemName} onUpdate={refetch} />
                </div>
            </CardHeader>
            <CardContent>
                {loading && <p>Loading...</p>}
                <div className="space-y-2">
                {items && items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg">
                        <p>{item.name}</p>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
                </div>
                {!loading && items?.length === 0 && <p className="text-center text-muted-foreground py-4">No {itemName}s found.</p>}
            </CardContent>
        </Card>
    );
}

const SubjectList = () => {
    const { app } = useFirebase();
    const db = getFirestore(app);
    const { toast } = useToast();
    
    const itemsQuery = query(collection(db, 'subjects'), orderBy('name', 'asc'));
    const { data: items, loading, refetch } = useCollection<SubjectItem>(itemsQuery, { listen: false });

    const handleDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'subjects', id));
            toast({ title: 'Success', description: `Subject deleted.` });
            refetch();
        } catch (error) {
            toast({ title: 'Error', description: `Could not delete subject.`, variant: 'destructive' });
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Manage Subjects</CardTitle>
                    <AddSubjectForm onUpdate={refetch} />
                </div>
            </CardHeader>
            <CardContent>
                {loading && <p>Loading...</p>}
                <div className="space-y-2">
                {items && items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg">
                        <div>
                            <p>{item.name}</p>
                            <p className='text-sm text-muted-foreground'>{item.department} &middot; {item.semester}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
                </div>
                {!loading && items?.length === 0 && <p className="text-center text-muted-foreground py-4">No Subjects found.</p>}
            </CardContent>
        </Card>
    );
}


export default function AcademicsPage() {
    const { user } = useAuth();
    
    if (user?.role !== 'Admin') {
        return <p>You are not authorized to view this page.</p>
    }

    return (
        <Tabs defaultValue="departments" className="space-y-6">
            <TabsList>
                <TabsTrigger value="departments">Departments</TabsTrigger>
                <TabsTrigger value="semesters">Semesters</TabsTrigger>
                <TabsTrigger value="subjects">Subjects</TabsTrigger>
            </TabsList>
            <TabsContent value="departments">
                <ItemList collectionName="departments" itemName="Department" />
            </TabsContent>
            <TabsContent value="semesters">
                <ItemList collectionName="semesters" itemName="Semester" />
            </TabsContent>
            <TabsContent value="subjects">
                <SubjectList />
            </TabsContent>
        </Tabs>
    );
}
