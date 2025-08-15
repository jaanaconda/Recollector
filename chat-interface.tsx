import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Heart, Brain, Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface ChatInterfaceProps {
  mode: "conversation" | "recording";
  onModeChange: (mode: "conversation" | "recording") => void;
}

export function ChatInterface({ mode, onModeChange }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const userId = "user-1"; // Default user for demo

  const { data: user } = useQuery({
    queryKey: ["/api/user", userId],
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/messages", currentConversationId],
    enabled: !!currentConversationId,
  });

  const createConversationMutation = useMutation({
    mutationFn: async (data: { userId: string; participantName: string; participantRelationship?: string }) => {
      const response = await apiRequest("POST", "/api/conversations", data);
      return response.json();
    },
    onSuccess: (conversation) => {
      setCurrentConversationId(conversation.id);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { conversationId: string; content: string; isAiResponse: number }) => {
      const response = await apiRequest("POST", "/api/messages", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", currentConversationId] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setMessage("");
    },
  });

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    if (!currentConversationId) {
      // Create a new conversation first
      await createConversationMutation.mutateAsync({
        userId,
        participantName: "You",
        participantRelationship: "Self",
      });
      return;
    }

    sendMessageMutation.mutate({
      conversationId: currentConversationId,
      content: message.trim(),
      isAiResponse: 0,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "What was your first job like?",
    "Tell me about your wedding day",
    "What advice would you give?",
  ];

  const handleSuggestionClick = (question: string) => {
    setMessage(question);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6" data-testid="chat-interface">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-warm-gray">Memory Interface</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <Button
            variant={mode === "conversation" ? "default" : "ghost"}
            size="sm"
            onClick={() => onModeChange("conversation")}
            className={mode === "conversation" ? "bg-primary text-white" : "text-soft-gray"}
            data-testid="button-talk-to-memory"
          >
            <i className="fas fa-comments mr-2 text-sm"></i>
            Talk to Memory
          </Button>
          <Button
            variant={mode === "recording" ? "default" : "ghost"}
            size="sm"
            onClick={() => onModeChange("recording")}
            className={mode === "recording" ? "bg-primary text-white" : "text-soft-gray"}
            data-testid="button-record-memory"
          >
            <i className="fas fa-microphone mr-2 text-sm"></i>
            Record Memory
          </Button>
        </div>
      </div>
      
      {mode === "conversation" && (
        <div className="conversation-mode">
          {/* Welcome message */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-100">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Heart size={12} className="text-white" />
              </div>
              <div>
                <p className="text-warm-gray text-sm leading-relaxed">
                  Hello! I'm your memory companion, trained on{" "}
                  <span className="font-semibold">{user?.name || "your"}</span> experiences and stories. 
                  Ask me anything about their life, thoughts, or experiences.
                </p>
                <p className="text-soft-gray text-xs mt-2">
                  Last updated: <span>Today at {format(new Date(), "h:mm a")}</span>
                </p>
              </div>
            </div>
          </div>
          
          {/* Chat Interface */}
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {messages.map((msg: any) => (
              <div key={msg.id} className={`flex ${msg.isAiResponse ? "" : "justify-end"}`}>
                {msg.isAiResponse ? (
                  <div className="flex">
                    <div className="w-8 h-8 bg-gradient-to-br from-secondary to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1">
                      <Brain size={12} className="text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 max-w-xs lg:max-w-md shadow-sm">
                      <p className="text-sm text-warm-gray leading-relaxed" data-testid={`text-ai-message-${msg.id}`}>
                        {msg.content}
                      </p>
                      <span className="text-xs text-soft-gray mt-1 block">
                        {format(new Date(msg.createdAt), "h:mm a")}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-primary text-white rounded-2xl rounded-br-md px-4 py-3 max-w-xs lg:max-w-md">
                    <p className="text-sm" data-testid={`text-user-message-${msg.id}`}>{msg.content}</p>
                    <span className="text-xs opacity-75 mt-1 block">
                      {format(new Date(msg.createdAt), "h:mm a")}
                    </span>
                  </div>
                )}
              </div>
            ))}
            
            {sendMessageMutation.isPending && (
              <div className="flex">
                <div className="w-8 h-8 bg-gradient-to-br from-secondary to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1">
                  <Brain size={12} className="text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 max-w-xs lg:max-w-md shadow-sm">
                  <p className="text-sm text-soft-gray">Thinking...</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Message input */}
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Ask about a memory, feeling, or experience..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                data-testid="input-message"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-soft-gray hover:text-primary transition-colors">
                <Paperclip size={16} />
              </button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90"
              data-testid="button-send-message"
            >
              <Send size={16} />
            </Button>
          </div>
          
          {/* Suggested questions */}
          {!currentConversationId && (
            <div className="mt-4">
              <p className="text-xs text-soft-gray mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSuggestionClick(question)}
                    className="px-3 py-1 bg-gray-100 text-soft-gray rounded-full text-xs hover:bg-gray-200"
                    data-testid={`button-suggestion-${index}`}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
