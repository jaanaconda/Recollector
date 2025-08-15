import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CalendarDays } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLifeEventSchema } from "@shared/schema";
import type { LifeEvent, InsertLifeEvent } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const eventTypeLabels: Record<string, string> = {
  marriage: "Marriage",
  divorce: "Divorce",
  birth: "Birth of Child",
  death: "Loss of Loved One",
  career_change: "Career Change",
  achievement: "Achievement",
  education: "Education",
  move: "Moving/Relocation",
  health: "Health Event",
  loss: "Significant Loss",
  milestone: "Personal Milestone",
  other: "Other"
};

const eventTypeColors: Record<string, string> = {
  marriage: "bg-pink-100 text-pink-800",
  divorce: "bg-gray-100 text-gray-800",
  birth: "bg-blue-100 text-blue-800",
  death: "bg-purple-100 text-purple-800",
  career_change: "bg-green-100 text-green-800",
  achievement: "bg-yellow-100 text-yellow-800",
  education: "bg-indigo-100 text-indigo-800",
  move: "bg-orange-100 text-orange-800",
  health: "bg-red-100 text-red-800",
  loss: "bg-gray-100 text-gray-800",
  milestone: "bg-emerald-100 text-emerald-800",
  other: "bg-slate-100 text-slate-800"
};

interface LifeEventsProps {
  userId: string;
}

export function LifeEvents({ userId }: LifeEventsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<LifeEvent | null>(null);
  const { toast } = useToast();

  const { data: lifeEvents, isLoading } = useQuery({
    queryKey: ['/api/life-events', userId],
  });

  const form = useForm<InsertLifeEvent>({
    resolver: zodResolver(insertLifeEventSchema),
    defaultValues: {
      userId,
      title: "",
      eventType: "",
      description: "",
      emotionalImpact: "",
      lessonsLearned: "",
      significantDecisions: "",
      personalGrowth: "",
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: InsertLifeEvent) => {
      const response = await fetch('/api/life-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create life event');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/life-events', userId] });
      toast({ title: "Life event added successfully!" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to add life event", 
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (values: InsertLifeEvent) => {
    createEventMutation.mutate({
      ...values,
      userId,
      peopleInvolved: [], // Can be enhanced later to parse comma-separated values
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900" data-testid="title-life-events">
            Life Events
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Major milestones that shaped your journey and personality
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-life-event">
              <Calendar className="h-4 w-4 mr-2" />
              Add Life Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Life Event</DialogTitle>
              <DialogDescription>
                Capture a significant milestone or experience that helped shape who you are.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Marriage to John"
                            {...field}
                            data-testid="input-event-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="eventType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-event-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(eventTypeLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what happened..."
                          className="min-h-[80px]"
                          {...field}
                          data-testid="textarea-event-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emotionalImpact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How did this make you feel?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your emotions and feelings about this event..."
                          className="min-h-[80px]"
                          {...field}
                          data-testid="textarea-emotional-impact"
                        />
                      </FormControl>
                      <FormDescription>
                        This helps capture your authentic emotional responses for your digital legacy.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="significantDecisions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Decisions Made</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What important decisions did you make? Why did you choose those names for your children, etc..."
                          className="min-h-[80px]"
                          {...field}
                          data-testid="textarea-significant-decisions"
                        />
                      </FormControl>
                      <FormDescription>
                        Include reasoning behind major choices, like naming children, career moves, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lessonsLearned"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What did you learn?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What insights or lessons did this experience teach you..."
                          className="min-h-[80px]"
                          {...field}
                          data-testid="textarea-lessons-learned"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="personalGrowth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How did this change you?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="How did this event help you grow or change as a person..."
                          className="min-h-[80px]"
                          {...field}
                          data-testid="textarea-personal-growth"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createEventMutation.isPending}
                    data-testid="button-save-life-event"
                  >
                    {createEventMutation.isPending ? "Saving..." : "Save Event"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {!lifeEvents || (Array.isArray(lifeEvents) && lifeEvents.length === 0) ? (
        <Card className="text-center p-8" data-testid="card-no-events">
          <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No life events yet</h3>
          <p className="text-gray-600 mb-4">
            Add major milestones like marriage, having children, career changes, or other significant moments.
          </p>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            data-testid="button-add-first-event"
          >
            Add Your First Life Event
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {(lifeEvents as LifeEvent[]).map((event) => (
            <Card 
              key={event.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedEvent(event)}
              data-testid={`card-life-event-${event.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={eventTypeColors[event.eventType] || eventTypeColors.other}>
                        {eventTypeLabels[event.eventType] || event.eventType}
                      </Badge>
                      {event.eventDate && (
                        <span className="text-sm text-gray-500">
                          {format(new Date(event.eventDate), "MMMM dd, yyyy")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-3">{event.description}</p>
                {event.emotionalImpact && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-900 font-medium mb-1">Emotional Impact:</p>
                    <p className="text-sm text-blue-800">{event.emotionalImpact}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedEvent.title}
                <Badge className={eventTypeColors[selectedEvent.eventType] || eventTypeColors.other}>
                  {eventTypeLabels[selectedEvent.eventType] || selectedEvent.eventType}
                </Badge>
              </DialogTitle>
              {selectedEvent.eventDate && (
                <DialogDescription>
                  {format(new Date(selectedEvent.eventDate), "MMMM dd, yyyy")}
                </DialogDescription>
              )}
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{selectedEvent.description}</p>
              </div>

              {selectedEvent.emotionalImpact && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Emotional Impact</h4>
                  <p className="text-gray-700">{selectedEvent.emotionalImpact}</p>
                </div>
              )}

              {selectedEvent.significantDecisions && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Key Decisions</h4>
                  <p className="text-gray-700">{selectedEvent.significantDecisions}</p>
                </div>
              )}

              {selectedEvent.lessonsLearned && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Lessons Learned</h4>
                  <p className="text-gray-700">{selectedEvent.lessonsLearned}</p>
                </div>
              )}

              {selectedEvent.personalGrowth && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Personal Growth</h4>
                  <p className="text-gray-700">{selectedEvent.personalGrowth}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}