'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, File, PlusCircle, Upload, X } from 'lucide-react';
import { studyMaterials as mockStudyMaterials, type StudyMaterial } from '@/lib/mock-data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

type MaterialsBySubject = { [subject: string]: StudyMaterial[] };

const UploadMaterialForm = ({ onUpload }: { onUpload: (subject: string, file: File) => void }) => {
    const [file, setFile] = useState<File | null>(null);
    const [subject, setSubject] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (event.dataTransfer.files) {
            setFile(event.dataTransfer.files[0]);
        }
    };

    const handleUpload = () => {
        if (file && subject) {
            onUpload(subject, file);
            setFile(null);
            setSubject('');
            toast({ title: 'Success', description: 'Material uploaded.' });
        } else {
            toast({ title: 'Error', description: 'Please select a subject and a file.', variant: 'destructive' });
        }
    };
    
    return (
        <Card className="bg-muted/30 border-dashed">
            <CardHeader>
                <CardTitle>Upload New Material</CardTitle>
                <CardDescription>Add a new resource for your students.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Select onValueChange={setSubject} value={subject}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a Subject" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Data Structures">Data Structures</SelectItem>
                        <SelectItem value="Database Systems">Database Systems</SelectItem>
                        <SelectItem value="Operating Systems">Operating Systems</SelectItem>
                    </SelectContent>
                </Select>
            
                <div 
                    className="flex flex-col items-center justify-center text-center p-8 space-y-4 border-2 border-dashed rounded-lg"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    <input type="file" ref={inputRef} onChange={handleFileChange} className="hidden" />
                    <div className="rounded-full bg-background p-3 border">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                    {file ? (
                        <div className='flex items-center gap-2'>
                            <p className="text-sm font-medium">{file.name}</p>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setFile(null);}}><X className="h-4 w-4"/></Button>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Drag and drop a file here or click to browse</p>
                    )}
                </div>

                <Button onClick={handleUpload} className="w-full">
                    <Upload className="mr-2 h-4 w-4"/>
                    Upload Material
                </Button>
            </CardContent>
        </Card>
    );
};

export default function MaterialsPage() {
    const { user } = useAuth();
    const canUpload = user?.role === 'Teacher' || user?.role === 'Admin';
    const [studyMaterials, setStudyMaterials] = useState<MaterialsBySubject>(mockStudyMaterials);

    const handleUpload = (subject: string, file: File) => {
        const newMaterial: StudyMaterial = {
            id: Date.now(),
            title: file.name,
            type: file.type.split('/')[1].toUpperCase(),
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        };

        setStudyMaterials(prev => {
            const materialsForSubject = prev[subject] ? [...prev[subject], newMaterial] : [newMaterial];
            return {
                ...prev,
                [subject]: materialsForSubject,
            };
        });
    };


    return (
        <div className="space-y-6">
            {canUpload && <UploadMaterialForm onUpload={handleUpload} />}

            <Card>
                <CardHeader>
                    <CardTitle>Study Materials</CardTitle>
                    <CardDescription>Find all your course materials here, organized by subject.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full" defaultValue={Object.keys(studyMaterials)[0]}>
                        {Object.entries(studyMaterials).map(([subject, materials]) => (
                            <AccordionItem value={subject} key={subject}>
                                <AccordionTrigger className="text-lg font-medium">{subject}</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="space-y-2 pt-2">
                                        {materials.map(material => (
                                            <li key={material.id} className="flex items-center justify-between rounded-md border p-3">
                                                <div className="flex items-center gap-3">
                                                    <File className="h-5 w-5 text-primary"/>
                                                    <div>
                                                        <p className="font-medium">{material.title}</p>
                                                        <p className="text-xs text-muted-foreground">{material.type} &middot; {material.size}</p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon">
                                                    <Download className="h-4 w-4"/>
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
