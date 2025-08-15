import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, isToday, isYesterday } from "date-fns";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const userId = "user-1"; // Default user for demo

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications", userId],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const unreadCount = notifications.filter((notif: any) => !notif.isRead).length;

  const formatNotificationDate = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d");
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "daily_reminder":
        return "📝";
      case "family_request":
        return "👨‍👩‍👧‍👦";
      case "memory_milestone":
        return "🎉";
      default:
        return "🔔";
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2"
          data-testid="notification-bell"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500"
              data-testid="unread-count"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" data-testid="notifications-panel">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-warm-gray">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-sm text-soft-gray">
              {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-soft-gray">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification: any) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? "bg-blue-50/50" : ""
                  }`}
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-lg flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className={`text-sm font-medium ${
                          !notification.isRead ? "text-warm-gray" : "text-soft-gray"
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 h-6 w-6"
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                            data-testid={`mark-read-${notification.id}`}
                          >
                            <Check size={12} />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-soft-gray mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-soft-gray mt-2">
                        {formatNotificationDate(new Date(notification.createdAt))}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-3 border-t bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-sm"
              data-testid="view-all-notifications"
            >
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}