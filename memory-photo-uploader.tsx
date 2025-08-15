import { useState, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image, File, FileText, Camera } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MemoryPhotoUploaderProps {
  memoryId?: string;
  onAttachmentAdded?: (attachment: any) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  className?: string;
}

interface AttachmentFile {
  id: string;
  file: File;
  preview?: string;
  uploading: boolean;
  error?: string;
}

export function MemoryPhotoUploader({
  memoryId,
  onAttachmentAdded,
  maxFiles = 5,
  acceptedTypes = ["image/*", ".pdf", ".doc", ".docx", ".txt"],
  className = ""
}: MemoryPhotoUploaderProps) {
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Upload attachment mutation
  const uploadAttachmentMutation = useMutation({
    mutationFn: async ({ attachment, description }: { attachment: AttachmentFile; description: string }) => {
      if (!memoryId) {
        throw new Error("Memory ID is required for upload");
      }

      const formData = new FormData();
      formData.append("file", attachment.file);
      formData.append("memoryId", memoryId);
      formData.append("description", description);

      const response = await apiRequest("/api/memory-attachments/upload", {
        method: "POST",
        body: formData,
      });

      return response;
    },
    onSuccess: (data, variables) => {
      const { attachment } = variables;
      // Update local state to show success
      setAttachments(prev => 
        prev.map(a => 
          a.id === attachment.id 
            ? { ...a, uploading: false }
            : a
        )
      );
      
      // Callback for parent component
      onAttachmentAdded?.(data);
      
      toast({
        title: "Success",
        description: "Photo/document uploaded successfully",
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/api/memory-attachments"] });
    },
    onError: (error, variables) => {
      const { attachment } = variables;
      setAttachments(prev => 
        prev.map(a => 
          a.id === attachment.id 
            ? { ...a, uploading: false, error: error.message }
            : a
        )
      );

      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  const handleFiles = useCallback((files: FileList) => {
    const newFiles = Array.from(files).slice(0, maxFiles - attachments.length);
    
    newFiles.forEach(file => {
      // Validate file type
      const isValidType = acceptedTypes.some(type => {
        if (type.includes("*")) {
          return file.type.startsWith(type.replace("*", ""));
        }
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      });

      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not supported. Please upload: ${acceptedTypes.join(", ")}`,
          variant: "destructive",
        });
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is too large. Maximum size is 10MB.`,
          variant: "destructive",
        });
        return;
      }

      const attachmentId = crypto.randomUUID();
      const newAttachment: AttachmentFile = {
        id: attachmentId,
        file,
        uploading: false,
      };

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachments(prev => 
            prev.map(a => 
              a.id === attachmentId 
                ? { ...a, preview: e.target?.result as string }
                : a
            )
          );
        };
        reader.readAsDataURL(file);
      }

      setAttachments(prev => [...prev, newAttachment]);
    });
  }, [acceptedTypes, attachments.length, maxFiles, toast]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const uploadFile = (attachment: AttachmentFile, description: string = "") => {
    setAttachments(prev => 
      prev.map(a => 
        a.id === attachment.id 
          ? { ...a, uploading: true, error: undefined }
          : a
      )
    );
    
    uploadAttachmentMutation.mutate({ attachment, description });
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image className="w-4 h-4" />;
    } else if (file.type.includes("pdf")) {
      return <FileText className="w-4 h-4 text-red-600" />;
    } else {
      return <File className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`} data-testid="memory-photo-uploader">
      {/* Upload Area */}
      <Card 
        className={`relative border-2 border-dashed transition-colors ${
          dragActive 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Camera className="w-6 h-6 text-muted-foreground" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Add Photos & Documents</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop files here, or click to browse
              </p>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                disabled={attachments.length >= maxFiles}
                data-testid="button-browse-files"
              >
                <Upload className="w-4 h-4 mr-2" />
                Browse Files
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>Supported formats: Images, PDF, DOC, TXT</p>
              <p>Maximum file size: 10MB each</p>
              <p>Maximum files: {maxFiles}</p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(",")}
            onChange={handleInputChange}
            className="hidden"
            data-testid="input-file-upload"
          />
        </CardContent>
      </Card>

      {/* File List */}
      {attachments.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-3">Attached Files ({attachments.length})</h4>
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div 
                  key={attachment.id}
                  className="flex items-center space-x-3 p-2 border rounded-lg"
                  data-testid={`attachment-${attachment.id}`}
                >
                  {/* File Preview/Icon */}
                  <div className="flex-shrink-0">
                    {attachment.preview ? (
                      <img 
                        src={attachment.preview} 
                        alt={attachment.file.name}
                        className="w-10 h-10 object-cover rounded"
                        data-testid={`preview-${attachment.id}`}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                        {getFileIcon(attachment.file)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-medium truncate" data-testid={`filename-${attachment.id}`}>
                      {attachment.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.file.size)}
                    </p>
                    {attachment.error && (
                      <p className="text-xs text-destructive">{attachment.error}</p>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex items-center space-x-2">
                    {!attachment.uploading && !memoryId && (
                      <span className="text-xs text-muted-foreground">
                        Save memory to upload
                      </span>
                    )}
                    
                    {!attachment.uploading && memoryId && !attachment.error && (
                      <Button 
                        size="sm" 
                        onClick={() => uploadFile(attachment)}
                        data-testid={`button-upload-${attachment.id}`}
                      >
                        Upload
                      </Button>
                    )}

                    {attachment.uploading && (
                      <div className="text-xs text-muted-foreground">
                        Uploading...
                      </div>
                    )}

                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => removeAttachment(attachment.id)}
                      data-testid={`button-remove-${attachment.id}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {memoryId && attachments.some(a => !a.uploading && !a.error) && (
              <div className="mt-4 pt-3 border-t">
                <Button 
                  onClick={() => {
                    attachments.forEach(attachment => {
                      if (!attachment.uploading && !attachment.error) {
                        uploadFile(attachment);
                      }
                    });
                  }}
                  disabled={uploadAttachmentMutation.isPending}
                  className="w-full"
                  data-testid="button-upload-all"
                >
                  {uploadAttachmentMutation.isPending ? "Uploading..." : "Upload All Files"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}