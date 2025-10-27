'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, File, PlusCircle, Upload } from 'lucide-react';
import { studyMaterials } from '@/lib/mock-data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const UploadMaterialForm = () => (
    <Card className="bg-muted/30 border-dashed">
        <CardHeader>
            <CardTitle>Upload New Material</CardTitle>
            <CardDescription>Add a new resource for your students.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="rounded-full bg-background p-3 border">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Drag and drop files here or click to browse</p>
            <Button variant="outline">Browse Files</Button>
        </CardContent>
    </Card>
);

export default function MaterialsPage() {
    const { user } = useAuth();
    const canUpload = user?.role === 'Teacher' || user?.role === 'Admin';

    return (
        <div className="space-y-6">
            {canUpload && <UploadMaterialForm />}

            <Card>
                <CardHeader>
                    <CardTitle>Study Materials</CardTitle>
                    <CardDescription>Find all your course materials here, organized by subject.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
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
