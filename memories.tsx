import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Filter, Lock, Share2, Eye } from "lucide-react";
import { Header } from "@/components/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecordingModal } from "@/components/recording-modal";
import { PrivacyControls } from "@/components/privacy-controls";
import { format } from "date-fns";

export default function Memories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [privacyControlsMemory, setPrivacyControlsMemory] = useState<{ id: string; title: string } | null>(null);
  const userId = "user-1"; // Default user for demo

  const { data: memories = [] } = useQuery({
    queryKey: ["/api/memories", userId],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/memory-categories"],
  });

  const filteredMemories = memories.filter((memory: any) => {
    const matchesSearch = memory.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         memory.response.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || memory.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat: any) => cat.id === categoryId);
    return category?.name || "Unknown";
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="page-memories">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-warm-gray mb-2">My Memories</h1>
          <p className="text-soft-gray">Browse and search through your recorded memories</p>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-soft-gray" size={20} />
              <Input
                type="text"
                placeholder="Search memories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-memories"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-filter-category">
                <Filter size={16} className="mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={() => setIsRecordingModalOpen(true)}
              className="bg-primary hover:bg-primary/90"
              data-testid="button-add-memory"
            >
              <Plus size={16} className="mr-2" />
              Add Memory
            </Button>
          </div>
        </div>

        {/* Memories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMemories.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-soft-gray" size={32} />
                </div>
                <h3 className="text-lg font-medium text-warm-gray mb-2">
                  {searchTerm || selectedCategory !== "all" ? "No memories found" : "No memories yet"}
                </h3>
                <p className="text-soft-gray text-sm mb-4">
                  {searchTerm || selectedCategory !== "all" 
                    ? "Try adjusting your search terms or filters" 
                    : "Start recording your memories to see them here"
                  }
                </p>
                {!searchTerm && selectedCategory === "all" && (
                  <Button 
                    onClick={() => setIsRecordingModalOpen(true)}
                    className="bg-primary hover:bg-primary/90"
                    data-testid="button-record-first-memory"
                  >
                    <Plus size={16} className="mr-2" />
                    Record Your First Memory
                  </Button>
                )}
              </div>
            </div>
          ) : (
            filteredMemories.map((memory: any) => (
              <Card key={memory.id} className="hover:shadow-md transition-shadow" data-testid={`memory-card-${memory.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                      {getCategoryName(memory.categoryId)}
                    </span>
                    <span className="text-xs text-soft-gray">
                      {format(new Date(memory.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <CardTitle className="text-sm font-medium text-warm-gray line-clamp-2" data-testid={`memory-question-${memory.id}`}>
                    {memory.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-soft-gray line-clamp-4" data-testid={`memory-response-${memory.id}`}>
                    {memory.response}
                  </p>
                  {memory.emotionalContext && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-soft-gray">
                        <span className="font-medium">Emotional context:</span> {memory.emotionalContext}
                      </p>
                    </div>
                  )}
                  
                  {/* Privacy Status and Sharing */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </Badge>
                      {memory.mediaAttachments && memory.mediaAttachments.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          {memory.mediaAttachments.length} media
                        </Badge>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPrivacyControlsMemory({ 
                        id: memory.id, 
                        title: memory.question 
                      })}
                      data-testid={`button-share-${memory.id}`}
                    >
                      <Share2 className="h-3 w-3 mr-1" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <RecordingModal 
        isOpen={isRecordingModalOpen}
        onClose={() => setIsRecordingModalOpen(false)}
      />
      
      {privacyControlsMemory && (
        <PrivacyControls
          isOpen={!!privacyControlsMemory}
          onClose={() => setPrivacyControlsMemory(null)}
          memoryId={privacyControlsMemory.id}
          memoryTitle={privacyControlsMemory.title}
        />
      )}
    </div>
  );
}
