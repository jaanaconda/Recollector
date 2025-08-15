import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Lock, Share2, Eye, Copy, CheckCircle, AlertTriangle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PrivacyControlsProps {
  isOpen: boolean;
  onClose: () => void;
  memoryId: string;
  memoryTitle: string;
}

export function PrivacyControls({ isOpen, onClose, memoryId, memoryTitle }: PrivacyControlsProps) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [allowedViews, setAllowedViews] = useState<string>("unlimited");
  const [expiresInDays, setExpiresInDays] = useState<string>("30");
  const [copiedPasscode, setCopiedPasscode] = useState<string>("");
  const { toast } = useToast();

  const { data: memoryShares = [] } = useQuery({
    queryKey: ["/api/memory-shares", memoryId],
    enabled: isOpen,
  });

  const createShareMutation = useMutation({
    mutationFn: async (shareData: {
      memoryId: string;
      recipientEmail?: string;
      allowedViews: number;
      expiresAt?: string;
    }) => {
      const response = await apiRequest("POST", "/api/memory-shares", shareData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/memory-shares"] });
      toast({
        title: "Share Link Created",
        description: "Your memory has been prepared for secure sharing.",
      });
      // Auto-copy the passcode to clipboard
      navigator.clipboard.writeText(data.accessPasscode);
      setCopiedPasscode(data.accessPasscode);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create share link. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deactivateShareMutation = useMutation({
    mutationFn: async (shareId: string) => {
      await apiRequest("DELETE", `/api/memory-shares/${shareId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/memory-shares"] });
      toast({
        title: "Share Deactivated",
        description: "The share link has been disabled.",
      });
    },
  });

  const handleCreateShare = () => {
    const expiresAt = expiresInDays !== "never" 
      ? new Date(Date.now() + parseInt(expiresInDays) * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    createShareMutation.mutate({
      memoryId,
      recipientEmail: recipientEmail || undefined,
      allowedViews: allowedViews === "unlimited" ? -1 : parseInt(allowedViews),
      expiresAt,
    });
  };

  const copyPasscode = (passcode: string) => {
    navigator.clipboard.writeText(passcode);
    setCopiedPasscode(passcode);
    toast({
      title: "Passcode Copied",
      description: "The access passcode has been copied to your clipboard.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="privacy-controls-modal">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-primary" />
            <DialogTitle className="text-xl font-semibold text-warm-gray">
              Privacy & Sharing Controls
            </DialogTitle>
          </div>
          <p className="text-sm text-soft-gray mt-2">
            Manage who can access "{memoryTitle}" with secure passcode sharing
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Privacy Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Private by Default
              </span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Your memories are completely private until you create a share link with a unique passcode.
            </p>
          </div>

          {/* Create New Share */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-warm-gray flex items-center">
              <Share2 className="h-4 w-4 mr-2" />
              Create Secure Share Link
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-2">
                  Recipient Email (Optional)
                </label>
                <Input
                  placeholder="friend@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  data-testid="input-recipient-email"
                />
                <p className="text-xs text-soft-gray mt-1">
                  Leave blank for anonymous sharing
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-warm-gray mb-2">
                  View Limit
                </label>
                <Select value={allowedViews} onValueChange={setAllowedViews}>
                  <SelectTrigger data-testid="select-view-limit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unlimited">Unlimited views</SelectItem>
                    <SelectItem value="1">1 view only</SelectItem>
                    <SelectItem value="3">3 views</SelectItem>
                    <SelectItem value="5">5 views</SelectItem>
                    <SelectItem value="10">10 views</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-warm-gray mb-2">
                  Expires In
                </label>
                <Select value={expiresInDays} onValueChange={setExpiresInDays}>
                  <SelectTrigger data-testid="select-expiry">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="7">1 week</SelectItem>
                    <SelectItem value="30">1 month</SelectItem>
                    <SelectItem value="90">3 months</SelectItem>
                    <SelectItem value="never">Never expires</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleCreateShare}
              disabled={createShareMutation.isPending}
              className="w-full bg-primary text-white hover:bg-primary/90"
              data-testid="button-create-share"
            >
              {createShareMutation.isPending ? "Creating..." : "Create Secure Share Link"}
            </Button>
          </div>

          {/* Existing Shares */}
          {memoryShares.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-warm-gray flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  Active Share Links ({memoryShares.length})
                </h3>

                <div className="space-y-3">
                  {memoryShares.map((share: any) => (
                    <div
                      key={share.id}
                      className="border rounded-lg p-4 bg-gray-50"
                      data-testid={`share-item-${share.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={share.isActive ? "default" : "secondary"}>
                              {share.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {share.recipientEmail && (
                              <span className="text-xs text-soft-gray">
                                For: {share.recipientEmail}
                              </span>
                            )}
                          </div>

                          <div className="space-y-1 text-xs text-soft-gray">
                            <div className="flex items-center space-x-4">
                              <span>Views: {share.currentViews} / {share.allowedViews === -1 ? "∞" : share.allowedViews}</span>
                              {share.expiresAt && (
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Expires: {formatDate(share.expiresAt)}
                                </span>
                              )}
                            </div>
                            <div>Created: {formatDate(share.createdAt)}</div>
                          </div>

                          <div className="mt-3 flex items-center space-x-2">
                            <Input
                              value={share.accessPasscode}
                              readOnly
                              className="font-mono text-xs"
                              data-testid={`passcode-${share.id}`}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyPasscode(share.accessPasscode)}
                              data-testid={`button-copy-${share.id}`}
                            >
                              {copiedPasscode === share.accessPasscode ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deactivateShareMutation.mutate(share.id)}
                          disabled={!share.isActive}
                          data-testid={`button-deactivate-${share.id}`}
                        >
                          Deactivate
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Security Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-amber-800">
                  Security Reminder
                </span>
                <p className="text-xs text-amber-700 mt-1">
                  Only share passcodes with people you trust. Each passcode provides full access to this memory, including any photos or videos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}