import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export function RecentConversations() {
  const userId = "user-1"; // Default user for demo

  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations", userId],
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6" data-testid="recent-conversations">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-warm-gray">Recent Conversations</h3>
        <button className="text-primary hover:text-primary/80 text-sm font-medium" data-testid="button-view-all">
          View All
        </button>
      </div>
      
      <div className="space-y-3">
        {conversations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-soft-gray text-sm">No conversations yet</p>
            <p className="text-soft-gray text-xs mt-1">Start a conversation to see it here</p>
          </div>
        ) : (
          conversations.map((conversation: any) => (
            <div 
              key={conversation.id} 
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100"
              data-testid={`conversation-item-${conversation.id}`}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-primary to-secondary"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-warm-gray" data-testid={`text-participant-${conversation.id}`}>
                    {conversation.participantName}
                  </p>
                  <span className="text-xs text-soft-gray" data-testid={`text-timestamp-${conversation.id}`}>
                    {format(new Date(conversation.updatedAt), "MMM d")}
                  </span>
                </div>
                <p className="text-sm text-soft-gray truncate" data-testid={`text-last-message-${conversation.id}`}>
                  {conversation.lastMessage || "No messages yet"}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-secondary font-medium" data-testid={`text-message-count-${conversation.id}`}>
                    {conversation.messageCount} messages
                  </span>
                  <span className="mx-2 text-xs text-gray-300">•</span>
                  <span className="text-xs text-soft-gray" data-testid={`text-duration-${conversation.id}`}>
                    {conversation.duration}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
