import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Lock, Eye, Calendar, User, Heart, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SharedMemory() {
  const [location, navigate] = useLocation();
  const [passcode, setPasscode] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const [memoryData, setMemoryData] = useState<any>(null);
  const { toast } = useToast();

  // Extract passcode from URL if provided
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlPasscode = urlParams.get('code');
    if (urlPasscode) {
      setPasscode(urlPasscode);
    }
  }, []);

  const accessMemoryMutation = useMutation({
    mutationFn: async (accessPasscode: string) => {
      const response = await apiRequest("POST", "/api/shared-memory/access", {
        accessPasscode,
        viewerInfo: {
          ipAddress: "unknown", // Would be handled server-side
          userAgent: navigator.userAgent,
        }
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAccessGranted(true);
      setMemoryData(data.memory);
      toast({
        title: "Access Granted",
        description: "You can now view this shared memory.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message?.includes("404") 
        ? "Invalid or expired passcode. Please check and try again."
        : "Failed to access memory. Please try again.";
      
      toast({
        title: "Access Denied",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleAccessMemory = () => {
    if (!passcode.trim()) {
      toast({
        title: "Passcode Required",
        description: "Please enter the access passcode to view this memory.",
        variant: "destructive",
      });
      return;
    }
    accessMemoryMutation.mutate(passcode);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!accessGranted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" data-testid="page-shared-memory">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-warm-gray">
              Private Memory
            </CardTitle>
            <p className="text-soft-gray">
              This memory is protected. Enter the access passcode to view it.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-gray mb-2">
                Access Passcode
              </label>
              <Input
                type="password"
                placeholder="Enter passcode..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAccessMemory()}
                className="font-mono"
                data-testid="input-passcode"
              />
            </div>
            
            <Button
              onClick={handleAccessMemory}
              disabled={accessMemoryMutation.isPending}
              className="w-full bg-primary text-white hover:bg-primary/90"
              data-testid="button-access-memory"
            >
              {accessMemoryMutation.isPending ? "Verifying..." : "Access Memory"}
            </Button>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium">About Recollector</p>
                  <p className="mt-1">
                    This memory was shared securely using Recollector, a private memory preservation platform. 
                    All memories are protected by default and only accessible with unique passcodes.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="page-shared-memory-content">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-warm-gray">Shared Memory</h1>
                <p className="text-soft-gray">From Recollector</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800">
                <Eye className="h-3 w-3 mr-1" />
                Securely Accessed
              </Badge>
            </div>
          </div>
        </div>

        {/* Memory Content */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="space-y-6">
            {/* Question */}
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4 border border-primary/10">
              <p className="text-sm font-medium text-warm-gray mb-2">Memory Prompt:</p>
              <p className="text-primary font-medium" data-testid="text-memory-question">
                "{memoryData?.question}"
              </p>
            </div>

            {/* Response */}
            <div>
              <h3 className="text-lg font-medium text-warm-gray mb-3">Memory Response</h3>
              <div className="prose prose-gray max-w-none">
                <p className="text-warm-gray leading-relaxed" data-testid="text-memory-response">
                  {memoryData?.response}
                </p>
              </div>
            </div>

            {/* Media Attachments */}
            {memoryData?.mediaAttachments && memoryData.mediaAttachments.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-warm-gray mb-3">Attached Media</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {memoryData.mediaAttachments.map((media: any, index: number) => (
                    <div
                      key={index}
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                      data-testid={`media-attachment-${index}`}
                    >
                      {media.type === "image" ? (
                        <img
                          src={media.url}
                          alt={media.filename}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <video
                          src={media.url}
                          controls
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Memory Metadata */}
            <div className="border-t pt-4">
              <div className="flex items-center space-x-6 text-sm text-soft-gray">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Recorded {formatDate(memoryData?.createdAt)}</span>
                </div>
                {memoryData?.emotionalContext && (
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    <span>{memoryData.emotionalContext}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Footer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Lock className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              Privacy Protected
            </span>
          </div>
          <p className="text-xs text-amber-700">
            This memory was shared privately using a secure passcode. Access to this content is limited and tracked for security.
          </p>
        </div>
      </div>
    </div>
  );
}