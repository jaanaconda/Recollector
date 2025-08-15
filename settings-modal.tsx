import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { X, Save, Bell, Clock, Target } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const userId = "user-1"; // Default user for demo
  const { toast } = useToast();

  const { data: preferences } = useQuery({
    queryKey: ["/api/preferences", userId],
  });

  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);
  const [dailyReminderTime, setDailyReminderTime] = useState("19:00");
  const [weeklyGoal, setWeeklyGoal] = useState([3]);

  // Update state when preferences data loads
  useEffect(() => {
    if (preferences) {
      setDailyReminderEnabled((preferences as any).dailyReminderEnabled === 1);
      setDailyReminderTime((preferences as any).dailyReminderTime || "19:00");
      setWeeklyGoal([(preferences as any).weeklyGoal || 3]);
    }
  }, [preferences]);

  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest("PATCH", `/api/preferences/${userId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preferences"] });
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updatePreferencesMutation.mutate({
      dailyReminderEnabled: dailyReminderEnabled ? 1 : 0,
      dailyReminderTime,
      weeklyGoal: weeklyGoal[0],
    });
  };

  const handleClose = () => {
    // Reset to original values
    if (preferences) {
      setDailyReminderEnabled((preferences as any).dailyReminderEnabled === 1);
      setDailyReminderTime((preferences as any).dailyReminderTime || "19:00");
      setWeeklyGoal([(preferences as any).weeklyGoal || 3]);
    }
    onClose();
  };

  const timeOptions = [
    { value: "08:00", label: "8:00 AM" },
    { value: "12:00", label: "12:00 PM" },
    { value: "17:00", label: "5:00 PM" },
    { value: "19:00", label: "7:00 PM" },
    { value: "20:00", label: "8:00 PM" },
    { value: "21:00", label: "9:00 PM" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" data-testid="settings-modal">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-warm-gray flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notification Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Daily Reminders */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-warm-gray">Daily Reminders</Label>
                <p className="text-xs text-soft-gray">
                  Get notified to add new memories each day
                </p>
              </div>
              <Switch
                checked={dailyReminderEnabled}
                onCheckedChange={setDailyReminderEnabled}
                data-testid="switch-daily-reminders"
              />
            </div>

            {/* Reminder Time */}
            {dailyReminderEnabled && (
              <div className="ml-4 space-y-2">
                <Label className="text-sm font-medium text-warm-gray flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Reminder Time
                </Label>
                <Select value={dailyReminderTime} onValueChange={setDailyReminderTime}>
                  <SelectTrigger data-testid="select-reminder-time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Weekly Goal */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-warm-gray flex items-center">
                <Target className="h-4 w-4 mr-1" />
                Weekly Memory Goal
              </Label>
              <p className="text-xs text-soft-gray mt-1">
                How many memories would you like to record each week?
              </p>
            </div>

            <div className="space-y-3">
              <Slider
                value={weeklyGoal}
                onValueChange={setWeeklyGoal}
                max={21}
                min={1}
                step={1}
                className="w-full"
                data-testid="slider-weekly-goal"
              />
              <div className="flex items-center justify-between text-xs text-soft-gray">
                <span>1 memory</span>
                <span className="font-medium text-primary">
                  {weeklyGoal[0]} memories per week
                </span>
                <span>21 memories</span>
              </div>
            </div>
          </div>

          {/* Memory Categories Preferences */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-warm-gray">Memory Categories</Label>
            <p className="text-xs text-soft-gray">
              Focus on recording specific types of memories to build a rich personal archive
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-primary/5 rounded text-center">Childhood</div>
              <div className="p-2 bg-secondary/5 rounded text-center">Career</div>
              <div className="p-2 bg-accent/5 rounded text-center">Family</div>
              <div className="p-2 bg-sage-green/5 rounded text-center">Travel</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            data-testid="button-cancel-settings"
          >
            <X size={16} className="mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updatePreferencesMutation.isPending}
            className="flex-1 bg-primary hover:bg-primary/90"
            data-testid="button-save-settings"
          >
            <Save size={16} className="mr-2" />
            {updatePreferencesMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}