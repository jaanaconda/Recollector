import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Send, MessageCircle, User, Sparkles, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DigitalLegacyInterfaceProps {
  userId: string;
  userName: string;
}

export function DigitalLegacyInterface({ userId, userName }: DigitalLegacyInterfaceProps) {
  const [question, setQuestion] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's memories for personality context
  const { data: memories = [] } = useQuery({
    queryKey: ["/api/memories", userId],
  });

  // Get current conversation messages
  const { data: messages = [] } = useQuery({
    queryKey: ["/api/messages", currentConversationId],
    enabled: !!currentConversationId,
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const conversation = await apiRequest("/api/conversations", {
        method: "POST",
        body: JSON.stringify({
          userId,
          title: "Digital Legacy Conversation",
          participants: [userName, "Digital Legacy AI"],
        }),
      });
      return conversation;
    },
    onSuccess: (conversation) => {
      setCurrentConversationId(conversation.id);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      // Create user message
      await apiRequest("/api/messages", {
        method: "POST",
        body: JSON.stringify({
          conversationId,
          content,
          isFromAI: false,
        }),
      });

      // Generate AI response using personality
      const memoryTexts = memories.map((m: any) => `${m.question}: ${m.response}`);
      const response = await apiRequest("/api/ai/legacy-response", {
        method: "POST",
        body: JSON.stringify({
          question: content,
          memories: memoryTexts,
          userId,
        }),
      });

      // Create AI message
      await apiRequest("/api/messages", {
        method: "POST",
        body: JSON.stringify({
          conversationId,
          content: response.message,
          isFromAI: true,
        }),
      });

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", currentConversationId] });
      setQuestion("");
      toast({
        title: "Response Generated",
        description: `${userName}'s digital essence has responded`,
      });
    },
    onError: () => {
      toast({
        title: "Connection Error",
        description: "Unable to reach the digital legacy system",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = async () => {
    if (!question.trim()) return;

    let conversationId = currentConversationId;
    
    if (!conversationId) {
      const conversation = await createConversationMutation.mutateAsync();
      conversationId = conversation.id;
    }

    if (conversationId) {
      sendMessageMutation.mutate({
        conversationId,
        content: question,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6" data-testid="digital-legacy-interface">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-purple-900">
                Digital Legacy Conversation
              </CardTitle>
              <p className="text-sm text-purple-700">
                Speak with {userName}'s preserved personality and memories
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Memory Context Indicator */}
      <Card className="border-indigo-200 bg-indigo-50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-800">
                Memory Foundation
              </span>
            </div>
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
              {memories.length} memories preserved
            </Badge>
          </div>
          <p className="text-xs text-indigo-700 mt-2">
            Responses are generated from {userName}'s authentic memories, personality patterns, and communication style
          </p>
        </CardContent>
      </Card>

      {/* Conversation Messages */}
      {messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              Conversation History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {messages.map((message: any) => (
              <div
                key={message.id}
                className={`flex ${message.isFromAI ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isFromAI
                      ? "bg-purple-50 border border-purple-200"
                      : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {message.isFromAI ? (
                      <Sparkles className="h-3 w-3 text-purple-600" />
                    ) : (
                      <User className="h-3 w-3 text-blue-600" />
                    )}
                    <span className="text-xs font-medium">
                      {message.isFromAI ? userName : "You"}
                    </span>
                    <Clock className="h-3 w-3 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-800">{message.content}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Message Input */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex space-x-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask ${userName} anything - about life, for advice, or just to chat...`}
              className="flex-1"
              data-testid="input-legacy-question"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!question.trim() || sendMessageMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
              data-testid="button-send-legacy-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {sendMessageMutation.isPending && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-purple-600">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span>Channeling {userName}'s thoughts...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggested Questions */}
      {memories.length > 0 && messages.length === 0 && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm text-gray-700">
              Suggested Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                "What advice would you give me about life?",
                "Tell me about your happiest memory",
                "What did you learn that you'd want me to know?",
                "How would you handle this situation I'm facing?",
                "What made you most proud in life?",
                "What would you want your legacy to be?"
              ].map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuestion(suggestion)}
                  className="text-left h-auto py-2 px-3 whitespace-normal"
                  data-testid={`button-suggestion-${index}`}
                >
                  <span className="text-xs">{suggestion}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}