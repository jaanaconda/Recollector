import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Book, 
  Heart, 
  Plus, 
  Star,
  Cross,
  Circle,
  ChevronDown,
  ChevronUp,
  Edit,
  Clock
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ReligiousMilestone {
  id: string;
  title: string;
  description?: string;
  milestoneDate?: string;
  ageAtMilestone?: number;
  location?: string;
  spiritualSignificance?: string;
  emotionalImpact?: string;
  peopleInvolved?: string;
  memorableDetails?: string;
  scripture?: string;
  milestoneType: string;
  isPrivate: boolean;
  createdAt: string;
}

interface ReligiousTimelineProps {
  userId: string;
  religiousProfileId: string;
  religion: string;
}

export function ReligiousTimeline({ userId, religiousProfileId, religion }: ReligiousTimelineProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    milestoneDate: "",
    ageAtMilestone: "",
    location: "",
    spiritualSignificance: "",
    emotionalImpact: "",
    peopleInvolved: "",
    memorableDetails: "",
    scripture: "",
    milestoneType: "",
    isPrivate: false,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch religious milestones
  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ["/api/religious-milestones", userId],
  });

  // Add milestone mutation
  const addMilestoneMutation = useMutation({
    mutationFn: async (milestoneData: any) => {
      return apiRequest("/api/religious-milestones", "POST", milestoneData);
    },
    onSuccess: () => {
      toast({
        title: "Religious milestone added",
        description: "Your spiritual milestone has been added to your timeline",
      });
      setShowAddForm(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/religious-milestones"] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      milestoneDate: "",
      ageAtMilestone: "",
      location: "",
      spiritualSignificance: "",
      emotionalImpact: "",
      peopleInvolved: "",
      memorableDetails: "",
      scripture: "",
      milestoneType: "",
      isPrivate: false,
    });
  };

  const handleAddMilestone = () => {
    if (!formData.title.trim() || !formData.milestoneType) return;

    const milestoneData = {
      userId,
      religiousProfileId,
      ...formData,
      milestoneDate: formData.milestoneDate ? new Date(formData.milestoneDate) : null,
      ageAtMilestone: formData.ageAtMilestone ? parseInt(formData.ageAtMilestone) : null,
    };

    addMilestoneMutation.mutate(milestoneData);
  };

  const getMilestoneIcon = (type: string) => {
    const iconMap: { [key: string]: any } = {
      sacrament: Cross,
      pilgrimage: MapPin,
      ceremony: Star,
      conversion: Heart,
      ordination: Book,
      default: Circle,
    };
    return iconMap[type] || iconMap.default;
  };

  const getMilestoneTypeColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      sacrament: "bg-blue-500",
      pilgrimage: "bg-green-500", 
      ceremony: "bg-purple-500",
      conversion: "bg-red-500",
      ordination: "bg-yellow-500",
      default: "bg-gray-500",
    };
    return colorMap[type] || colorMap.default;
  };

  const getMilestoneTypesForReligion = (religion: string) => {
    const typeMap: { [key: string]: Array<{value: string, label: string}> } = {
      christianity: [
        { value: "sacrament", label: "Sacrament (Baptism, Communion, Confirmation)" },
        { value: "ceremony", label: "Church Ceremony" },
        { value: "conversion", label: "Conversion/Salvation" },
        { value: "ordination", label: "Ordination/Ministry" },
        { value: "pilgrimage", label: "Pilgrimage/Mission Trip" },
      ],
      islam: [
        { value: "ceremony", label: "Islamic Ceremony" },
        { value: "pilgrimage", label: "Hajj/Umrah" },
        { value: "conversion", label: "Shahada/Conversion" },
        { value: "sacrament", label: "Religious Milestone" },
      ],
      judaism: [
        { value: "ceremony", label: "Bar/Bat Mitzvah" },
        { value: "sacrament", label: "Jewish Lifecycle Event" },
        { value: "conversion", label: "Conversion to Judaism" },
        { value: "pilgrimage", label: "Israel/Holy Land Visit" },
      ],
      buddhism: [
        { value: "ceremony", label: "Buddhist Ceremony" },
        { value: "conversion", label: "Taking Refuge" },
        { value: "ordination", label: "Monastic Ordination" },
        { value: "pilgrimage", label: "Buddhist Pilgrimage" },
      ],
      hinduism: [
        { value: "sacrament", label: "Samskara (Hindu Rite)" },
        { value: "ceremony", label: "Hindu Ceremony" },
        { value: "pilgrimage", label: "Pilgrimage (Yatra)" },
        { value: "conversion", label: "Spiritual Awakening" },
      ],
    };
    return typeMap[religion] || [
      { value: "ceremony", label: "Religious Ceremony" },
      { value: "conversion", label: "Spiritual Conversion" },
      { value: "pilgrimage", label: "Pilgrimage" },
      { value: "sacrament", label: "Religious Milestone" },
    ];
  };

  // Sort milestones by date
  const sortedMilestones = [...(milestones as ReligiousMilestone[])].sort((a: ReligiousMilestone, b: ReligiousMilestone) => {
    if (!a.milestoneDate && !b.milestoneDate) return 0;
    if (!a.milestoneDate) return 1;
    if (!b.milestoneDate) return -1;
    return new Date(a.milestoneDate).getTime() - new Date(b.milestoneDate).getTime();
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Religious Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Religious Milestone Timeline
            <Badge variant="outline">{sortedMilestones.length} milestones</Badge>
          </CardTitle>
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-milestone">
                <Plus className="w-4 h-4 mr-2" />
                Add Milestone
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Religious Milestone</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="title">Milestone Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., First Communion, Hajj, Bar Mitzvah"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      data-testid="input-milestone-title"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="milestone-type">Milestone Type *</Label>
                    <Select value={formData.milestoneType} onValueChange={(value) => setFormData({...formData, milestoneType: value})}>
                      <SelectTrigger data-testid="select-milestone-type">
                        <SelectValue placeholder="Select milestone type" />
                      </SelectTrigger>
                      <SelectContent>
                        {getMilestoneTypesForReligion(religion).map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe this milestone and what it meant to you..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    data-testid="textarea-milestone-description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="milestone-date">Date</Label>
                    <Input
                      id="milestone-date"
                      type="date"
                      value={formData.milestoneDate}
                      onChange={(e) => setFormData({...formData, milestoneDate: e.target.value})}
                      data-testid="input-milestone-date"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="age">Your Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="e.g., 13"
                      value={formData.ageAtMilestone}
                      onChange={(e) => setFormData({...formData, ageAtMilestone: e.target.value})}
                      data-testid="input-milestone-age"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., St. Mary's Church, Mecca, Jerusalem"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    data-testid="input-milestone-location"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="spiritual-significance">Spiritual Significance</Label>
                  <Textarea
                    id="spiritual-significance"
                    placeholder="What did this milestone mean to your faith journey?"
                    value={formData.spiritualSignificance}
                    onChange={(e) => setFormData({...formData, spiritualSignificance: e.target.value})}
                    data-testid="textarea-spiritual-significance"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="emotional-impact">Emotional Impact</Label>
                  <Textarea
                    id="emotional-impact"
                    placeholder="How did this milestone make you feel?"
                    value={formData.emotionalImpact}
                    onChange={(e) => setFormData({...formData, emotionalImpact: e.target.value})}
                    data-testid="textarea-emotional-impact"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="people-involved">People Involved</Label>
                  <Textarea
                    id="people-involved"
                    placeholder="Family members, clergy, friends who were present..."
                    value={formData.peopleInvolved}
                    onChange={(e) => setFormData({...formData, peopleInvolved: e.target.value})}
                    data-testid="textarea-people-involved"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="memorable-details">Memorable Details</Label>
                  <Textarea
                    id="memorable-details"
                    placeholder="Special moments, traditions, things you'll never forget..."
                    value={formData.memorableDetails}
                    onChange={(e) => setFormData({...formData, memorableDetails: e.target.value})}
                    data-testid="textarea-memorable-details"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="scripture">Related Scripture/Text</Label>
                  <Input
                    id="scripture"
                    placeholder="e.g., Psalm 23, Quran 2:255, Torah portion"
                    value={formData.scripture}
                    onChange={(e) => setFormData({...formData, scripture: e.target.value})}
                    data-testid="input-milestone-scripture"
                  />
                </div>

                <Button
                  onClick={handleAddMilestone}
                  disabled={!formData.title.trim() || !formData.milestoneType || addMilestoneMutation.isPending}
                  className="w-full"
                  data-testid="button-save-milestone"
                >
                  {addMilestoneMutation.isPending ? "Adding..." : "Add Milestone"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {sortedMilestones.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No milestones recorded yet</p>
            <p className="text-sm">Add your religious milestones to create a timeline of your faith journey</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Timeline */}
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
              
              {sortedMilestones.map((milestone: ReligiousMilestone, index: number) => {
                const Icon = getMilestoneIcon(milestone.milestoneType);
                const isExpanded = expandedMilestone === milestone.id;
                
                return (
                  <div key={milestone.id} className="relative flex items-start space-x-4 pb-6">
                    {/* Timeline dot */}
                    <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 border-white ${getMilestoneTypeColor(milestone.milestoneType)}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    
                    {/* Milestone content */}
                    <Card className="flex-1 shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{milestone.title}</CardTitle>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {milestone.milestoneDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(milestone.milestoneDate), "MMM d, yyyy")}
                                </div>
                              )}
                              {milestone.ageAtMilestone && (
                                <span>Age {milestone.ageAtMilestone}</span>
                              )}
                              {milestone.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {milestone.location}
                                </div>
                              )}
                            </div>
                            <Badge variant="secondary" className="w-fit">
                              {milestone.milestoneType}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
                            data-testid={`button-expand-${milestone.id}`}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                        </div>
                        
                        {milestone.description && (
                          <p className="text-gray-700 text-sm">{milestone.description}</p>
                        )}
                      </CardHeader>
                      
                      {isExpanded && (
                        <CardContent className="pt-0 space-y-4">
                          {milestone.spiritualSignificance && (
                            <div>
                              <h4 className="font-medium text-sm mb-1 flex items-center gap-1">
                                <Heart className="w-3 h-3 text-purple-500" />
                                Spiritual Significance
                              </h4>
                              <p className="text-sm text-gray-700">{milestone.spiritualSignificance}</p>
                            </div>
                          )}
                          
                          {milestone.emotionalImpact && (
                            <div>
                              <h4 className="font-medium text-sm mb-1">Emotional Impact</h4>
                              <p className="text-sm text-gray-700">{milestone.emotionalImpact}</p>
                            </div>
                          )}
                          
                          {milestone.peopleInvolved && (
                            <div>
                              <h4 className="font-medium text-sm mb-1 flex items-center gap-1">
                                <Users className="w-3 h-3 text-blue-500" />
                                People Involved
                              </h4>
                              <p className="text-sm text-gray-700">{milestone.peopleInvolved}</p>
                            </div>
                          )}
                          
                          {milestone.memorableDetails && (
                            <div>
                              <h4 className="font-medium text-sm mb-1">Memorable Details</h4>
                              <p className="text-sm text-gray-700">{milestone.memorableDetails}</p>
                            </div>
                          )}
                          
                          {milestone.scripture && (
                            <div className="p-3 bg-purple-50 rounded border-l-4 border-l-purple-400">
                              <h4 className="font-medium text-sm mb-1 flex items-center gap-1 text-purple-900">
                                <Book className="w-3 h-3" />
                                Related Scripture
                              </h4>
                              <p className="text-sm text-purple-800 font-medium">{milestone.scripture}</p>
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}