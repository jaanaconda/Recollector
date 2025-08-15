import { useState, useRef } from "react";
import { Upload, X, Image, Video, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaFile {
  id: string;
  file: File;
  type: "image" | "video";
  preview?: string;
}

interface MediaUploaderProps {
  onFilesChange: (files: MediaFile[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export function MediaUploader({ onFilesChange, maxFiles = 5, acceptedTypes = ["image/*", "video/*"] }: MediaUploaderProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: MediaFile[] = [];
    Array.from(fileList).forEach((file) => {
      if (files.length + newFiles.length >= maxFiles) return;

      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      
      if (isImage || isVideo) {
        const mediaFile: MediaFile = {
          id: Math.random().toString(36).substring(7),
          file,
          type: isImage ? "image" : "video",
        };

        // Create preview for images
        if (isImage) {
          const reader = new FileReader();
          reader.onload = (e) => {
            mediaFile.preview = e.target?.result as string;
            setFiles(prev => [...prev]);
          };
          reader.readAsDataURL(file);
        }

        newFiles.push(mediaFile);
      }
    });

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const removeFile = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid="media-upload-area"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          data-testid="file-input"
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 mb-2">
          Drag and drop images or videos here, or{" "}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-primary hover:text-primary/80 font-medium"
            data-testid="button-browse-files"
          >
            browse files
          </button>
        </p>
        <p className="text-xs text-gray-500">
          Supports JPG, PNG, MP4, MOV files up to 50MB each. Maximum {maxFiles} files.
        </p>
      </div>

      {/* File Previews */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {files.map((mediaFile) => (
            <div
              key={mediaFile.id}
              className="relative border rounded-lg p-2 bg-gray-50"
              data-testid={`media-preview-${mediaFile.id}`}
            >
              <button
                onClick={() => removeFile(mediaFile.id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10"
                data-testid={`button-remove-${mediaFile.id}`}
              >
                <X size={12} />
              </button>

              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-2">
                {mediaFile.type === "image" && mediaFile.preview ? (
                  <img
                    src={mediaFile.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : mediaFile.type === "video" ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="h-8 w-8 text-gray-500" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="h-8 w-8 text-gray-500" />
                  </div>
                )}
              </div>

              <div className="text-xs">
                <p className="font-medium truncate" data-testid={`filename-${mediaFile.id}`}>
                  {mediaFile.file.name}
                </p>
                <div className="flex items-center justify-between text-gray-500">
                  <span className="flex items-center">
                    {mediaFile.type === "image" ? (
                      <Image size={10} className="mr-1" />
                    ) : (
                      <Video size={10} className="mr-1" />
                    )}
                    {mediaFile.type}
                  </span>
                  <span>{formatFileSize(mediaFile.file.size)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="text-xs text-gray-500 text-center">
          {files.length} of {maxFiles} files selected
        </div>
      )}
    </div>
  );
}