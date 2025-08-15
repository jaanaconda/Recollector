import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Heart, 
  Baby, 
  Upload, 
  Video, 
  FileText, 
  Calendar, 
  Users, 
  Mail,
  AlertTriangle,
  MessageCircle,
  Plus,
  Clock,
  Send
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface LifeEventMessage {
  id: string;
  recipientName: string;
  recipientRelationship: string;
  eventType: string;
  messageType: string;
  title: string;
  content?: string;
  mediaUrl?: string;
  isScheduled: boolean;
  scheduledFor?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  emotionalTone?: string;
  privateNotes?: string;
  createdAt: string;
}

interface LifeEventMessagesProps {
  userId: string;
  lifeEventId?: string;
  eventType?: string;
}

export function LifeEventMessages({ userId, lifeEventId, eventType }: LifeEventMessagesProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    recipientName: "",
    recipientRelationship: "",
    eventType: eventType || "",
    messageType: "letter",
    title: "",
    content: "",
    mediaUrl: "",
    isScheduled: false,
    scheduledFor: "",
    emotionalTone: "",
    privateNotes: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch life event messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/life-event-messages", userId],
  });

  // Create message mutation
  const createMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return apiRequest("/api/life-event-messages", "POST", messageData);
    },
    onSuccess: () => {
      toast({
        title: "Message created",
        description: "Your message has been saved for your loved one",
      });
      setShowCreateForm(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/life-event-messages"] });
    },
  });

  const resetForm = () => {
    setFormData({
      recipientName: "",
      recipientRelationship: "",
      eventType: eventType || "",
      messageType: "letter",
      title: "",
      content: "",
      mediaUrl: "",
      isScheduled: false,
      scheduledFor: "",
      emotionalTone: "",
      privateNotes: "",
    });
  };

  const handleCreateMessage = () => {
    if (!formData.recipientName.trim() || !formData.title.trim() || !formData.eventType) return;

    const messageData = {
      userId,
      lifeEventId,
      ...formData,
      scheduledFor: formData.scheduledFor ? new Date(formData.scheduledFor) : null,
    };

    createMessageMutation.mutate(messageData);
  };

  const getEventTypeIcon = (type: string) => {
    const iconMap: { [key: string]: any } = {
      pregnancy: Baby,
      wedding: Heart,
      divorce: Heart,
      miscarriage: Heart,
      falling_in_love: Heart,
      falling_out_of_love: Heart,
      default: MessageCircle,
    };
    return iconMap[type] || iconMap.default;
  };

  const getMessageTypeIcon = (type: string) => {
    const iconMap: { [key: string]: any } = {
      letter: FileText,
      video: Video,
      audio: Upload,
    };
    return iconMap[type] || FileText;
  };

  const eventTypes = [
    { value: "pregnancy", label: "Pregnancy Journey" },
    { value: "wedding", label: "Wedding Planning" },
    { value: "divorce", label: "Divorce Process" },
    { value: "miscarriage", label: "Miscarriage" },
    { value: "falling_in_love", label: "Falling in Love" },
    { value: "falling_out_of_love", label: "Relationship Changes" },
  ];

  const relationships = [
    { value: "baby", label: "My Baby" },
    { value: "child", label: "My Child" },
    { value: "spouse", label: "My Spouse/Partner" },
    { value: "family", label: "Family Member" },
    { value: "friend", label: "Friend" },
    { value: "future_self", label: "Future Me" },
  ];

  const emotionalTones = [
    { value: "hopeful", label: "Hopeful & Optimistic" },
    { value: "loving", label: "Loving & Tender" },
    { value: "supportive", label: "Supportive & Encouraging" },
    { value: "bittersweet", label: "Bittersweet" },
    { value: "grateful", label: "Grateful" },
    { value: "protective", label: "Protective" },
  ];

  // Filter messages for current event if provided
  const filteredMessages = lifeEventId 
    ? messages.filter((msg: LifeEventMessage) => msg.lifeEventId === lifeEventId)
    : messages;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Life Event Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-pink-600" />
            Life Event Messages
            <Badge variant="outline">{filteredMessages.length} messages</Badge>
          </CardTitle>
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-create-message">
                <Plus className="w-4 h-4 mr-2" />
                Create Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Life Event Message</DialogTitle>
              </DialogHeader>
              
              {/* Legal Disclaimer */}
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important Legal Notice:</strong> This app is not a replacement for a living will, will, trust, or any legal document. Please consult with legal professionals for official estate planning and legal documentation.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="recipient-name">Recipient Name *</Label>
                    <Input
                      id="recipient-name"
                      placeholder="e.g., Emma, My Future Baby, David"
                      value={formData.recipientName}
                      onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
                      data-testid="input-recipient-name"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="relationship">Relationship *</Label>
                    <Select value={formData.recipientRelationship} onValueChange={(value) => setFormData({...formData, recipientRelationship: value})}>
                      <SelectTrigger data-testid="select-relationship">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationships.map((rel) => (
                          <SelectItem key={rel.value} value={rel.value}>
                            {rel.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="event-type">Life Event *</Label>
                    <Select value={formData.eventType} onValueChange={(value) => setFormData({...formData, eventType: value})}>
                      <SelectTrigger data-testid="select-event-type">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((event) => (
                          <SelectItem key={event.value} value={event.value}>
                            {event.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="message-type">Message Type *</Label>
                    <Select value={formData.messageType} onValueChange={(value) => setFormData({...formData, messageType: value})}>
                      <SelectTrigger data-testid="select-message-type">
                        <SelectValue placeholder="Select message type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="letter">Written Letter</SelectItem>
                        <SelectItem value="video">Video Message</SelectItem>
                        <SelectItem value="audio">Audio Recording</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="title">Message Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., A Letter to My Baby During Pregnancy, Wedding Day Thoughts"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    data-testid="input-message-title"
                  />
                </div>

                {formData.messageType === "letter" && (
                  <div className="space-y-3">
                    <Label htmlFor="content">Letter Content *</Label>
                    <Textarea
                      id="content"
                      placeholder="Write your heartfelt message here... Share your feelings, hopes, dreams, and love."
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      className="min-h-[120px]"
                      data-testid="textarea-message-content"
                    />
                  </div>
                )}

                {(formData.messageType === "video" || formData.messageType === "audio") && (
                  <div className="space-y-3">
                    <Label htmlFor="media-url">Media File</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500 mb-2">
                        Upload your {formData.messageType} file
                      </p>
                      <Input
                        id="media-url"
                        type="file"
                        accept={formData.messageType === "video" ? "video/*" : "audio/*"}
                        onChange={(e) => {
                          // In a real app, this would upload to storage and return URL
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData({...formData, mediaUrl: `placeholder-${file.name}`});
                          }
                        }}
                        data-testid="input-media-file"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="emotional-tone">Emotional Tone</Label>
                  <Select value={formData.emotionalTone} onValueChange={(value) => setFormData({...formData, emotionalTone: value})}>
                    <SelectTrigger data-testid="select-emotional-tone">
                      <SelectValue placeholder="Select emotional tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {emotionalTones.map((tone) => (
                        <SelectItem key={tone.value} value={tone.value}>
                          {tone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="scheduled-for">Schedule Delivery (Optional)</Label>
                  <Input
                    id="scheduled-for"
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) => setFormData({...formData, scheduledFor: e.target.value, isScheduled: !!e.target.value})}
                    data-testid="input-scheduled-for"
                  />
                  <p className="text-xs text-gray-500">
                    Set a future date to automatically share this message
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="private-notes">Private Notes</Label>
                  <Textarea
                    id="private-notes"
                    placeholder="Personal notes that won't be shared with the recipient..."
                    value={formData.privateNotes}
                    onChange={(e) => setFormData({...formData, privateNotes: e.target.value})}
                    data-testid="textarea-private-notes"
                  />
                </div>

                <Button
                  onClick={handleCreateMessage}
                  disabled={!formData.recipientName.trim() || !formData.title.trim() || !formData.eventType || createMessageMutation.isPending}
                  className="w-full"
                  data-testid="button-save-message"
                >
                  {createMessageMutation.isPending ? "Creating..." : "Create Message"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {filteredMessages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No messages created yet</p>
            <p className="text-sm">Create heartfelt messages for important life events to share with your loved ones</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((message: LifeEventMessage) => {
              const EventIcon = getEventTypeIcon(message.eventType);
              const MessageIcon = getMessageTypeIcon(message.messageType);
              
              return (
                <Card key={message.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <EventIcon className="w-5 h-5 text-pink-600" />
                          <CardTitle className="text-lg">{message.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            For {message.recipientName} ({message.recipientRelationship})
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageIcon className="w-3 h-3" />
                            {message.messageType}
                          </div>
                          {message.emotionalTone && (
                            <Badge variant="secondary" className="text-xs">
                              {message.emotionalTone}
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline" className="w-fit">
                          {message.eventType.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="text-right">
                        {message.isScheduled && message.scheduledFor && (
                          <div className="flex items-center gap-1 text-xs text-orange-600 mb-1">
                            <Clock className="w-3 h-3" />
                            Scheduled for {format(new Date(message.scheduledFor), "MMM d, yyyy")}
                          </div>
                        )}
                        {message.isDelivered && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <Send className="w-3 h-3" />
                            Delivered
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          Created {format(new Date(message.createdAt), "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                    
                    {message.content && (
                      <div className="mt-3 p-3 bg-gray-50 rounded border-l-4 border-l-pink-400">
                        <p className="text-sm text-gray-700 line-clamp-3">{message.content}</p>
                      </div>
                    )}
                    
                    {message.mediaUrl && (
                      <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-l-blue-400">
                        <p className="text-sm text-blue-700">
                          {message.messageType === "video" ? "📹" : "🎵"} Media file: {message.mediaUrl}
                        </p>
                      </div>
                    )}
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}