import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Plus, Edit, Trash2, MapPin, Calendar, Briefcase, Star } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FamilyRelationship {
  id: string;
  userId: string;
  relativeName: string;
  relationship: string;
  birthDate?: string;
  deathDate?: string;
  occupation?: string;
  personalityTraits?: string;
  significance?: string;
  sharedMemories: string[];
  photoUrl?: string;
  isAlive: boolean;
  createdAt: string;
  updatedAt: string;
}

const RELATIONSHIP_TYPES = [
  "mother", "father", "spouse", "ex-spouse", "son", "daughter", 
  "brother", "sister", "grandfather", "grandmother", "uncle", "aunt", 
  "cousin", "nephew", "niece", "stepfather", "stepmother", "stepson", 
  "stepdaughter", "friend", "mentor", "other"
];

export function FamilyTree() {
  const [selectedRelationship, setSelectedRelationship] = useState<FamilyRelationship | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newRelationship, setNewRelationship] = useState({
    relativeName: "",
    relationship: "",
    birthDate: "",
    deathDate: "",
    occupation: "",
    personalityTraits: "",
    significance: "",
    sharedMemories: "",
    photoUrl: "",
    isAlive: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch family relationships
  const { data: familyRelationships = [], isLoading } = useQuery<FamilyRelationship[]>({
    queryKey: ["/api/family-relationships", "user-1"]
  });

  // Add new family relationship
  const addRelationshipMutation = useMutation({
    mutationFn: async (relationship: any) => {
      return apiRequest("/api/family-relationships", {
        method: "POST",
        body: JSON.stringify({
          ...relationship,
          userId: "user-1",
          sharedMemories: relationship.sharedMemories ? relationship.sharedMemories.split(",").map((s: string) => s.trim()) : []
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/family-relationships"] });
      setIsAddingNew(false);
      setNewRelationship({
        relativeName: "",
        relationship: "",
        birthDate: "",
        deathDate: "",
        occupation: "",
        personalityTraits: "",
        significance: "",
        sharedMemories: "",
        photoUrl: "",
        isAlive: true
      });
      toast({
        title: "Success",
        description: "Family relationship added successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add family relationship",
        variant: "destructive",
      });
    },
  });

  // Delete family relationship
  const deleteRelationshipMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/family-relationships/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/family-relationships"] });
      setSelectedRelationship(null);
      toast({
        title: "Success",
        description: "Family relationship deleted successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete family relationship",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRelationship.relativeName || !newRelationship.relationship) {
      toast({
        title: "Error",
        description: "Please fill in the required fields",
        variant: "destructive",
      });
      return;
    }
    addRelationshipMutation.mutate(newRelationship);
  };

  const formatRelationshipType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const getRelationshipIcon = (relationship: string) => {
    const type = relationship.toLowerCase();
    if (type.includes('spouse') || type.includes('husband') || type.includes('wife')) {
      return <Heart className="w-4 h-4 text-red-500" />;
    } else if (type.includes('child') || type.includes('son') || type.includes('daughter')) {
      return <Users className="w-4 h-4 text-blue-500" />;
    } else if (type.includes('parent') || type.includes('mother') || type.includes('father')) {
      return <Star className="w-4 h-4 text-yellow-500" />;
    }
    return <Users className="w-4 h-4 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Family Tree
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="family-tree-container">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Family Tree & Relationships
            </div>
            <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-add-relationship">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Family Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Family Member</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="relativeName">Name *</Label>
                      <Input
                        id="relativeName"
                        value={newRelationship.relativeName}
                        onChange={(e) => setNewRelationship({ ...newRelationship, relativeName: e.target.value })}
                        placeholder="Enter full name"
                        required
                        data-testid="input-relative-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="relationship">Relationship *</Label>
                      <Select
                        value={newRelationship.relationship}
                        onValueChange={(value) => setNewRelationship({ ...newRelationship, relationship: value })}
                        required
                      >
                        <SelectTrigger data-testid="select-relationship">
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          {RELATIONSHIP_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {formatRelationshipType(type)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="birthDate">Birth Date</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={newRelationship.birthDate}
                        onChange={(e) => setNewRelationship({ ...newRelationship, birthDate: e.target.value })}
                        data-testid="input-birth-date"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deathDate">Death Date</Label>
                      <Input
                        id="deathDate"
                        type="date"
                        value={newRelationship.deathDate}
                        onChange={(e) => setNewRelationship({ 
                          ...newRelationship, 
                          deathDate: e.target.value, 
                          isAlive: !e.target.value 
                        })}
                        data-testid="input-death-date"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      value={newRelationship.occupation}
                      onChange={(e) => setNewRelationship({ ...newRelationship, occupation: e.target.value })}
                      placeholder="Their profession or job"
                      data-testid="input-occupation"
                    />
                  </div>

                  <div>
                    <Label htmlFor="personalityTraits">Personality Traits</Label>
                    <Textarea
                      id="personalityTraits"
                      value={newRelationship.personalityTraits}
                      onChange={(e) => setNewRelationship({ ...newRelationship, personalityTraits: e.target.value })}
                      placeholder="Describe their personality, characteristics, and what made them special..."
                      rows={3}
                      data-testid="textarea-personality-traits"
                    />
                  </div>

                  <div>
                    <Label htmlFor="significance">Why They're Important</Label>
                    <Textarea
                      id="significance"
                      value={newRelationship.significance}
                      onChange={(e) => setNewRelationship({ ...newRelationship, significance: e.target.value })}
                      placeholder="Explain their significance in your life, the impact they had, lessons learned from them..."
                      rows={3}
                      data-testid="textarea-significance"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sharedMemories">Shared Memories</Label>
                    <Textarea
                      id="sharedMemories"
                      value={newRelationship.sharedMemories}
                      onChange={(e) => setNewRelationship({ ...newRelationship, sharedMemories: e.target.value })}
                      placeholder="Comma-separated list of shared memories or experiences..."
                      rows={2}
                      data-testid="textarea-shared-memories"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddingNew(false)}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={addRelationshipMutation.isPending}
                      data-testid="button-save-relationship"
                    >
                      {addRelationshipMutation.isPending ? "Adding..." : "Add Family Member"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {familyRelationships.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No family relationships recorded yet</p>
              <p className="mb-4">Start building your family tree by adding important people in your life</p>
              <Button onClick={() => setIsAddingNew(true)} data-testid="button-get-started">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Family Member
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {familyRelationships.map((relationship) => (
                <Card 
                  key={relationship.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedRelationship(relationship)}
                  data-testid={`card-relationship-${relationship.id}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getRelationshipIcon(relationship.relationship)}
                        <div>
                          <h3 className="font-semibold text-lg" data-testid={`text-name-${relationship.id}`}>
                            {relationship.relativeName}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {formatRelationshipType(relationship.relationship)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!relationship.isAlive && (
                          <Badge variant="outline" className="text-xs">
                            Deceased
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {relationship.occupation && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="w-3 h-3" />
                        <span data-testid={`text-occupation-${relationship.id}`}>
                          {relationship.occupation}
                        </span>
                      </div>
                    )}
                    {relationship.birthDate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Born {new Date(relationship.birthDate).getFullYear()}
                          {relationship.deathDate && ` - ${new Date(relationship.deathDate).getFullYear()}`}
                        </span>
                      </div>
                    )}
                    {relationship.personalityTraits && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {relationship.personalityTraits}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedRelationship} onOpenChange={() => setSelectedRelationship(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedRelationship && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getRelationshipIcon(selectedRelationship.relationship)}
                    {selectedRelationship.relativeName}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteRelationshipMutation.mutate(selectedRelationship.id)}
                      disabled={deleteRelationshipMutation.isPending}
                      data-testid="button-delete-relationship"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Relationship</Label>
                  <Badge variant="secondary" className="ml-2">
                    {formatRelationshipType(selectedRelationship.relationship)}
                  </Badge>
                </div>

                {selectedRelationship.birthDate && (
                  <div>
                    <Label>Birth Date</Label>
                    <p className="text-sm mt-1">
                      {new Date(selectedRelationship.birthDate).toLocaleDateString()}
                      {selectedRelationship.deathDate && 
                        ` - ${new Date(selectedRelationship.deathDate).toLocaleDateString()}`
                      }
                    </p>
                  </div>
                )}

                {selectedRelationship.occupation && (
                  <div>
                    <Label>Occupation</Label>
                    <p className="text-sm mt-1">{selectedRelationship.occupation}</p>
                  </div>
                )}

                {selectedRelationship.personalityTraits && (
                  <div>
                    <Label>Personality Traits</Label>
                    <p className="text-sm mt-1 leading-relaxed">{selectedRelationship.personalityTraits}</p>
                  </div>
                )}

                {selectedRelationship.significance && (
                  <div>
                    <Label>Why They're Important</Label>
                    <p className="text-sm mt-1 leading-relaxed">{selectedRelationship.significance}</p>
                  </div>
                )}

                {selectedRelationship.sharedMemories.length > 0 && (
                  <div>
                    <Label>Shared Memories</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedRelationship.sharedMemories.map((memory, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {memory}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}