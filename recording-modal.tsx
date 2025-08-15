import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { X, Mic, Save, FileText, Image, Video } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaUploader } from "@/components/media-uploader";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface RecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RecordingModal({ isOpen, onClose }: RecordingModalProps) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [response, setResponse] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const { toast } = useToast();
  const userId = "user-1"; // Default user for demo

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/memory-categories"],
  });

  const generateQuestionMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await apiRequest("POST", "/api/questions/generate", {
        category: categoryId,
        userId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.questions && data.questions.length > 0) {
        setCurrentQuestion(data.questions[0]);
      }
    },
  });

  const saveMemoryMutation = useMutation({
    mutationFn: async (data: { 
      userId: string; 
      categoryId: string; 
      question: string; 
      response: string;
      mediaAttachments?: Array<{
        type: "image" | "video";
        url: string;
        filename: string;
        size: number;
      }>;
    }) => {
      const response = await apiRequest("POST", "/api/memories", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/memories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/memory-categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Memory Saved",
        description: "Your memory has been successfully recorded.",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save memory. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    generateQuestionMutation.mutate(categoryId);
  };

  const handleSaveMemory = () => {
    if (!selectedCategory || !currentQuestion || !response.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a category, ensure there's a question, and provide a response.",
        variant: "destructive",
      });
      return;
    }

    // Convert media files to attachment format (for demo, we'll use placeholder URLs)
    const mediaAttachments = mediaFiles.map(file => ({
      type: file.type as "image" | "video",
      url: `placeholder://${file.file.name}`, // In real app, this would be uploaded URL
      filename: file.file.name,
      size: file.file.size,
    }));

    saveMemoryMutation.mutate({
      userId,
      categoryId: selectedCategory,
      question: currentQuestion,
      response: response.trim(),
      mediaAttachments: mediaAttachments.length > 0 ? mediaAttachments : undefined,
    });
  };

  const handleClose = () => {
    setSelectedCategory("");
    setResponse("");
    setCurrentQuestion("");
    setIsRecording(false);
    setMediaFiles([]);
    onClose();
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real implementation, this would start/stop speech-to-text
    toast({
      title: isRecording ? "Recording Stopped" : "Recording Started",
      description: isRecording ? "Speech-to-text would stop here" : "Speech-to-text would start here",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl" data-testid="recording-modal">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-warm-gray">Record New Memory</DialogTitle>
        </DialogHeader>
        
        {/* Category selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-warm-gray mb-2">Memory Category</label>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger data-testid="select-category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category: any) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Question prompt */}
        {currentQuestion && (
          <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
            <p className="text-sm font-medium text-warm-gray mb-2">Today's Question:</p>
            <p className="text-primary font-medium" data-testid="text-current-question">
              "{currentQuestion}"
            </p>
          </div>
        )}
        
        {generateQuestionMutation.isPending && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-soft-gray text-sm">Generating question...</p>
          </div>
        )}
        
        {/* Input Tabs */}
        <Tabs defaultValue="text" className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text" data-testid="tab-text">
              <FileText className="h-4 w-4 mr-2" />
              Text & Voice
            </TabsTrigger>
            <TabsTrigger value="media" data-testid="tab-media">
              <Image className="h-4 w-4 mr-2" />
              Add Media
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="text" className="space-y-4 mt-4">
            {/* Recording interface */}
            <div className="text-center">
              <Button
                onClick={toggleRecording}
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 transition-transform hover:scale-105 ${
                  isRecording 
                    ? "bg-red-600 hover:bg-red-700 animate-pulse" 
                    : "bg-gradient-to-br from-red-400 to-red-600 hover:from-red-500 hover:to-red-700"
                }`}
                data-testid="button-toggle-recording"
              >
                <Mic className="text-white" size={20} />
              </Button>
              <p className="text-sm text-soft-gray">
                {isRecording ? "Recording... Tap to stop" : "Tap to start recording"}
              </p>
            </div>
            
            {/* Text input alternative */}
            <div>
              <Textarea
                placeholder="Share your memory here..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none h-32"
                data-testid="textarea-memory-response"
              />
              <p className="text-xs text-soft-gray mt-2">
                The more detail you provide, the better I can learn your voice and personality.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="media" className="mt-4">
            <div>
              <MediaUploader 
                onFilesChange={setMediaFiles}
                maxFiles={3}
              />
              <p className="text-xs text-soft-gray mt-2">
                Images and videos help preserve the full context of your memories.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Action buttons */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            data-testid="button-cancel"
          >
            <X size={16} className="mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSaveMemory}
            disabled={!selectedCategory || !currentQuestion || (!response.trim() && mediaFiles.length === 0) || saveMemoryMutation.isPending}
            className="flex-1 bg-primary hover:bg-primary/90"
            data-testid="button-save-memory"
          >
            <Save size={16} className="mr-2" />
            {saveMemoryMutation.isPending ? "Saving..." : "Save Memory"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
