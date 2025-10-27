import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { timetableData } from '@/lib/mock-data';

export default function TimetablePage() {
    const semester = '3rd Semester';
    const department = 'Computer Science';
    const data = timetableData[department]?.[semester] || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Weekly Timetable</CardTitle>
                <CardDescription>
                    Showing schedule for {department}, {semester}.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">Day</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Teacher</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length > 0 ? data.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{item.day}</TableCell>
                                    <TableCell>{item.time}</TableCell>
                                    <TableCell>{item.subject}</TableCell>
                                    <TableCell>{item.teacher}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        No timetable data available.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
