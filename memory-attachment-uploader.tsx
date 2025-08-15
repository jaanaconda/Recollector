import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileImage, FileText, File, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MemoryAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  description?: string;
  fileSize: number;
}

interface MemoryAttachmentUploaderProps {
  memoryId?: string;
  attachments?: MemoryAttachment[];
  onAttachmentsChange?: (attachments: MemoryAttachment[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
}

export function MemoryAttachmentUploader({
  memoryId,
  attachments = [],
  onAttachmentsChange,
  maxFiles = 10,
  maxFileSize = 10
}: MemoryAttachmentUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFiles = async (files: FileList) => {
    if (files.length + attachments.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const newAttachments: MemoryAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds ${maxFileSize}MB limit`,
          variant: "destructive",
        });
        continue;
      }

      try {
        // Simulate upload progress
        setUploadProgress((i / files.length) * 100);

        // Create a fake URL for demo purposes
        const fakeUrl = URL.createObjectURL(file);
        
        const attachment: MemoryAttachment = {
          id: `att-${Date.now()}-${i}`,
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileUrl: fakeUrl,
          fileSize: file.size,
        };

        newAttachments.push(attachment);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }

    setUploading(false);
    setUploadProgress(0);

    if (newAttachments.length > 0) {
      const updatedAttachments = [...attachments, ...newAttachments];
      onAttachmentsChange?.(updatedAttachments);
      
      toast({
        title: "Upload successful",
        description: `${newAttachments.length} file(s) uploaded successfully`,
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const removeAttachment = (id: string) => {
    const updatedAttachments = attachments.filter(att => att.id !== id);
    onAttachmentsChange?.(updatedAttachments);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <FileImage className="w-4 h-4" />;
    } else if (fileType === 'application/pdf' || fileType.startsWith('text/')) {
      return <FileText className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4" data-testid="memory-attachment-uploader">
      {/* Upload Area */}
      <Card 
        className={`transition-colors border-2 border-dashed ${
          dragActive 
            ? 'border-primary bg-primary/10' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <Upload className="mx-auto w-8 h-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium">
                Drop files here or click to upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Up to {maxFiles} files, max {maxFileSize}MB each
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || attachments.length >= maxFiles}
              data-testid="button-select-files"
            >
              Select Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInputChange}
              accept="image/*,.pdf,.doc,.docx,.txt"
              data-testid="input-file"
            />
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploading && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Upload className="w-4 h-4 animate-pulse" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Uploading...</span>
                  <span className="text-xs text-muted-foreground">{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Attachments ({attachments.length})
          </h4>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <Card key={attachment.id} className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(attachment.fileType)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" title={attachment.fileName}>
                        {attachment.fileName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(attachment.fileSize)}</span>
                        <Badge variant="outline" className="text-xs">
                          {attachment.fileType.split('/')[0]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {attachment.fileType.startsWith('image/') && (
                      <div className="w-8 h-8 rounded overflow-hidden bg-gray-100">
                        <img
                          src={attachment.fileUrl}
                          alt={attachment.fileName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAttachment(attachment.id)}
                      className="p-1 h-8 w-8"
                      data-testid={`button-remove-${attachment.id}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* File Limit Warning */}
      {attachments.length >= maxFiles && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">
                Maximum number of files reached ({maxFiles})
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}