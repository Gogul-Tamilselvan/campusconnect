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

type AcademicItem = {
  id: string;
  name: string;
};

const AddItemForm = ({ collectionName, itemName }: { collectionName: string, itemName: string }) => {
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

const ItemList = ({ collectionName, itemName }: { collectionName: string, itemName: string }) => {
    const { app } = useFirebase();
    const db = getFirestore(app);
    const { toast } = useToast();
    
    const itemsQuery = query(collection(db, collectionName), orderBy('name', 'asc'));
    const { data: items, loading } = useCollection<AcademicItem>(itemsQuery);

    const handleDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, collectionName, id));
            toast({ title: 'Success', description: `${itemName} deleted.` });
        } catch (error) {
            toast({ title: 'Error', description: `Could not delete ${itemName}.`, variant: 'destructive' });
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Manage {itemName}s</CardTitle>
                    <AddItemForm collectionName={collectionName} itemName={itemName} />
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
                <ItemList collectionName="subjects" itemName="Subject" />
            </TabsContent>
        </Tabs>
    );
}