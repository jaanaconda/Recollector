import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Image, Calendar, Tag, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Photos() {
  const userId = "user-1"; // Default user for demo
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const { data: memories = [] } = useQuery({
    queryKey: ["/api/memories", userId],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/memory-categories"],
  });

  // Filter memories that have media attachments
  const memoriesWithPhotos = memories.filter((memory: any) => 
    memory.mediaAttachments && memory.mediaAttachments.length > 0
  );

  // Extract all photos from memories
  const allPhotos = memoriesWithPhotos.flatMap((memory: any) => 
    memory.mediaAttachments
      ?.filter((media: any) => media.type === "image")
      .map((photo: any) => ({
        ...photo,
        memoryId: memory.id,
        memoryQuestion: memory.question,
        memoryDate: memory.createdAt,
        categoryName: categories.find((cat: any) => cat.id === memory.categoryId)?.name || "Uncategorized"
      })) || []
  );

  // Filter photos by category
  const filteredPhotos = filterCategory === "all" 
    ? allPhotos 
    : allPhotos.filter(photo => photo.categoryName.toLowerCase() === filterCategory);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="page-photos">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-warm-gray mb-2">Photo Gallery</h1>
              <p className="text-soft-gray">
                Browse through {allPhotos.length} photos from your memories
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Category Filter */}
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40" data-testid="select-category-filter">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.name.toLowerCase()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex bg-white rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  data-testid="button-grid-view"
                >
                  <Grid size={16} />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  data-testid="button-list-view"
                >
                  <List size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Photos Display */}
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-16">
            <Image className="mx-auto h-24 w-24 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-warm-gray mb-2">No photos found</h3>
            <p className="text-soft-gray mb-6">
              {filterCategory === "all" 
                ? "Start recording memories with photos to see them here."
                : `No photos found in the ${filterCategory} category.`
              }
            </p>
            <Button 
              onClick={() => window.location.href = "/"}
              className="bg-primary text-white hover:bg-primary/90"
              data-testid="button-add-first-photo"
            >
              Add Your First Photo
            </Button>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredPhotos.map((photo: any, index: number) => (
                  <div
                    key={`${photo.memoryId}-${index}`}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                    data-testid={`photo-card-${index}`}
                  >
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      <img
                        src={photo.url}
                        alt={photo.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    
                    <div className="p-3">
                      <div className="flex items-center text-xs text-soft-gray mb-1">
                        <Calendar size={12} className="mr-1" />
                        <span>{formatDate(photo.memoryDate)}</span>
                      </div>
                      
                      <div className="flex items-center text-xs text-soft-gray">
                        <Tag size={12} className="mr-1" />
                        <span className="truncate">{photo.categoryName}</span>
                      </div>
                      
                      <p className="text-xs text-warm-gray mt-2 line-clamp-2">
                        {photo.memoryQuestion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPhotos.map((photo: any, index: number) => (
                  <div
                    key={`${photo.memoryId}-${index}`}
                    className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                    data-testid={`photo-list-item-${index}`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={photo.url}
                          alt={photo.filename}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-warm-gray truncate">
                            {photo.filename}
                          </h3>
                          <div className="flex items-center text-xs text-soft-gray">
                            <Calendar size={12} className="mr-1" />
                            <span>{formatDate(photo.memoryDate)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-xs text-soft-gray mb-2">
                          <Tag size={12} className="mr-1" />
                          <span>{photo.categoryName}</span>
                          <span className="mx-2">•</span>
                          <span>{(photo.size / 1024 / 1024).toFixed(1)} MB</span>
                        </div>
                        
                        <p className="text-sm text-warm-gray line-clamp-2">
                          {photo.memoryQuestion}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}