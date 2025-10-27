'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FormState, getEventSuggestions } from './actions';
import { useEffect, useRef, useState } from 'react';
import { Wand2, PlusCircle, ExternalLink } from 'lucide-react';
import { events as mockEvents } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <Wand2 className="mr-2 h-4 w-4" />
      {pending ? 'Generating...' : 'Suggest with AI'}
    </Button>
  );
}

export default function EventsPage() {
  const initialState: FormState = null;
  const [formState, formAction] = useFormState(getEventSuggestions, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [suggestedDescription, setSuggestedDescription] = useState('');

  useEffect(() => {
    if(formState?.message && formState.suggestions) {
        toast({ title: 'Suggestions Ready', description: formState.message });
        setSuggestedDescription(formState.suggestions.description);
    } else if (formState?.message && !formState.suggestions) {
        toast({ title: 'Error', description: formState.message, variant: 'destructive' });
    }
  }, [formState, toast]);


  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <form ref={formRef} action={formAction}>
            <CardHeader>
              <CardTitle>Create New Event</CardTitle>
              <CardDescription>Add a new event and get AI-powered suggestions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eventName">Event Name</Label>
                <Input
                  id="eventName"
                  name="eventName"
                  placeholder="e.g., Annual Tech Fest"
                  defaultValue={formState?.fields?.eventName}
                  required
                />
                 {formState?.issues && <p className="text-sm text-destructive">{formState.issues[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventDetails">Event Details (Optional)</Label>
                <Textarea
                  id="eventDetails"
                  name="eventDetails"
                  placeholder="Provide any extra details, like speakers, topics, or goals."
                  defaultValue={formState?.fields?.eventDetails}
                />
              </div>

              {formState?.suggestions && (
                <div className="space-y-4 rounded-lg bg-muted/50 p-4">
                  <div>
                    <Label>Suggested Categories</Label>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {formState.suggestions.categories.map((cat, i) => (
                        <Badge key={i} variant="secondary">{cat}</Badge>
                      ))}
                    </div>
                  </div>
                   <div>
                    <Label htmlFor="suggestedDescription">Suggested Description</Label>
                    <Textarea
                      id="suggestedDescription"
                      value={suggestedDescription}
                      onChange={(e) => setSuggestedDescription(e.target.value)}
                      className="mt-2 bg-background"
                      rows={4}
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <SubmitButton />
              <Button variant="default">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Event
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
            <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Here are the scheduled events for the campus.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {mockEvents.map(event => (
                    <div key={event.id} className="p-4 border rounded-lg flex items-start justify-between">
                        <div>
                            <Badge variant="outline" className="mb-2">{event.category}</Badge>
                            <h3 className="font-semibold">{event.name}</h3>
                            <p className="text-sm text-muted-foreground">{event.date}</p>
                            <p className="text-sm mt-1">{event.description}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                            Add to Calendar
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
