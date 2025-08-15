import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Cross, Star, Heart, Book, MessageSquare, Plus, Settings, Sparkles, Circle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ReligiousTimeline } from "@/components/religious-timeline";

interface ReligiousProfile {
  id: string;
  religion: string;
  denomination?: string;
  isActive: boolean;
}

interface ReligiousMemory {
  id: string;
  question: string;
  response: string;
  scripture?: string;
  scriptureTranslation?: string;
  spiritualContext: string;
  emotionalContext: string;
  createdAt: string;
}

export default function ReligiousMemories() {
  const [selectedReligion, setSelectedReligion] = useState("");
  const [selectedDenomination, setSelectedDenomination] = useState("");
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [scripture, setScripture] = useState("");
  const [scriptureTranslation, setScriptureTranslation] = useState("");
  const [spiritualContext, setSpiritualContext] = useState("");
  const [emotionalContext, setEmotionalContext] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = "user-1";

  // Fetch religious profile
  const { data: religiousProfile } = useQuery({
    queryKey: ["/api/religious-profiles", userId],
  });

  // Fetch religious memories
  const { data: religiousMemories = [] } = useQuery({
    queryKey: ["/api/religious-memories", userId],
    enabled: !!religiousProfile,
  });

  // Get faith-specific question suggestions
  const { data: questionData, isLoading: questionsLoading, refetch } = useQuery({
    queryKey: ["/api/religious-questions", userId, religiousProfile?.religion],
    enabled: !!religiousProfile,
  });

  const questions = (questionData as any)?.questions || [];

  // Create religious profile mutation
  const createProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      return apiRequest("/api/religious-profiles", "POST", profileData);
    },
    onSuccess: () => {
      toast({
        title: "Religious profile created",
        description: "You can now record faith-based memories and receive personalized spiritual questions",
      });
      setShowProfileSetup(false);
      queryClient.invalidateQueries({ queryKey: ["/api/religious-profiles"] });
    },
  });

  // Add religious memory mutation
  const addReligiousMemoryMutation = useMutation({
    mutationFn: async (memoryData: any) => {
      return apiRequest("/api/religious-memories", "POST", memoryData);
    },
    onSuccess: () => {
      toast({
        title: "Religious memory saved",
        description: "Your faith journey has been preserved for your digital legacy",
      });
      setResponse("");
      setScripture("");
      setScriptureTranslation("");
      setSpiritualContext("");
      setEmotionalContext("");
      setSelectedQuestion("");
      queryClient.invalidateQueries({ queryKey: ["/api/religious-memories"] });
    },
  });

  const handleCreateProfile = () => {
    if (!selectedReligion) return;
    
    createProfileMutation.mutate({
      userId,
      religion: selectedReligion,
      denomination: selectedDenomination || null,
      isActive: true,
    });
  };

  const handleAddMemory = () => {
    if (!selectedQuestion || !response.trim()) return;

    addReligiousMemoryMutation.mutate({
      userId,
      religiousProfileId: religiousProfile?.id,
      question: selectedQuestion,
      response: response.trim(),
      scripture: scripture || null,
      scriptureTranslation: scriptureTranslation || null,
      spiritualContext: spiritualContext || "reflection",
      emotionalContext: emotionalContext || "peaceful",
    });
  };

  const religions = [
    { value: "christianity", label: "Christianity", icon: Cross },
    { value: "islam", label: "Islam", icon: Circle },
    { value: "judaism", label: "Judaism", icon: Star },
    { value: "buddhism", label: "Buddhism", icon: Heart },
    { value: "hinduism", label: "Hinduism", icon: Star },
    { value: "other", label: "Other", icon: Book },
  ];

  const christianDenominations = [
    "Catholic", "Protestant", "Orthodox", "Baptist", "Methodist", "Presbyterian", 
    "Lutheran", "Anglican/Episcopal", "Pentecostal", "Non-denominational", "Other"
  ];

  const islamDenominations = [
    "Sunni", "Shia", "Sufi", "Other"
  ];

  const judaismDenominations = [
    "Orthodox", "Conservative", "Reform", "Reconstructionist", "Other"
  ];

  const getDenominations = (religion: string) => {
    switch (religion) {
      case "christianity": return christianDenominations;
      case "islam": return islamDenominations;
      case "judaism": return judaismDenominations;
      default: return [];
    }
  };

  const getReligionIcon = (religion: string) => {
    const found = religions.find(r => r.value === religion);
    return found ? found.icon : Book;
  };

  // If no religious profile exists, show setup
  if (!religiousProfile) {
    return (
      <div className="min-h-screen bg-gray-50 p-6" data-testid="page-religious-memories">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Book className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Religious & Spiritual Memories</h1>
            <p className="text-lg text-gray-600">
              Preserve your faith journey, meaningful scriptures, and spiritual experiences as part of your digital legacy
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Setup Your Faith Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="religion">Select Your Religion/Faith</Label>
                <Select value={selectedReligion} onValueChange={setSelectedReligion}>
                  <SelectTrigger data-testid="select-religion">
                    <SelectValue placeholder="Choose your religion or spiritual practice" />
                  </SelectTrigger>
                  <SelectContent>
                    {religions.map((religion) => {
                      const Icon = religion.icon;
                      return (
                        <SelectItem key={religion.value} value={religion.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {religion.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedReligion && getDenominations(selectedReligion).length > 0 && (
                <div className="space-y-3">
                  <Label htmlFor="denomination">Denomination (Optional)</Label>
                  <Select value={selectedDenomination} onValueChange={setSelectedDenomination}>
                    <SelectTrigger data-testid="select-denomination">
                      <SelectValue placeholder="Select your denomination" />
                    </SelectTrigger>
                    <SelectContent>
                      {getDenominations(selectedReligion).map((denomination) => (
                        <SelectItem key={denomination} value={denomination}>
                          {denomination}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="p-4 bg-blue-50 rounded-lg border">
                <h4 className="font-medium text-blue-900 mb-2">What you'll get:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Personalized questions about your faith journey</li>
                  <li>• Scripture/text references and their meaning to you</li>
                  <li>• Spiritual experiences during difficult times</li>
                  <li>• Religious traditions and their significance</li>
                  <li>• Your faith's impact on daily decisions and values</li>
                </ul>
              </div>

              <Button 
                onClick={handleCreateProfile}
                disabled={!selectedReligion || createProfileMutation.isPending}
                className="w-full"
                data-testid="button-create-profile"
              >
                {createProfileMutation.isPending ? "Creating Profile..." : "Create Faith Profile"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main religious memories interface
  const ReligionIcon = getReligionIcon(religiousProfile.religion);
  
  return (
    <div className="min-h-screen bg-gray-50 p-6" data-testid="page-religious-memories">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <ReligionIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Religious Memories</h1>
              <p className="text-gray-600">
                {religiousProfile.religion.charAt(0).toUpperCase() + religiousProfile.religion.slice(1)}
                {religiousProfile.denomination && ` • ${religiousProfile.denomination}`}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Heart className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </div>

        {/* Religious Timeline */}
        <ReligiousTimeline 
          userId={userId}
          religiousProfileId={religiousProfile.id}
          religion={religiousProfile.religion}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Faith-Specific Questions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Faith-Based Questions
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => refetch()}
                  disabled={questionsLoading}
                  data-testid="button-refresh-questions"
                >
                  {questionsLoading ? "Generating..." : "New Questions"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {questionsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Book className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Click "New Questions" to get personalized spiritual questions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {questions.map((question: string, index: number) => (
                    <Card 
                      key={index}
                      className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${
                        selectedQuestion === question 
                          ? 'border-l-blue-500 bg-blue-50' 
                          : 'border-l-gray-300 hover:border-l-gray-400'
                      }`}
                      onClick={() => setSelectedQuestion(question)}
                      data-testid={`question-card-${index}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                          </div>
                          <p className="text-sm font-medium">{question}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Previous Religious Memories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="w-5 h-5" />
                Your Faith Journey
                <Badge variant="outline">{religiousMemories.length} memories</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {religiousMemories.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No religious memories recorded yet</p>
                  <p className="text-sm">Start sharing your faith journey below</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {religiousMemories.map((memory: ReligiousMemory) => (
                    <Card key={memory.id} className="border-l-4 border-l-purple-400">
                      <CardContent className="p-4">
                        <p className="text-sm font-medium mb-2">{memory.question}</p>
                        <p className="text-sm text-gray-700 mb-2">{memory.response}</p>
                        {memory.scripture && (
                          <div className="p-2 bg-purple-50 rounded text-xs">
                            <p className="font-medium text-purple-900">
                              {memory.scripture}
                              {memory.scriptureTranslation && ` (${memory.scriptureTranslation})`}
                            </p>
                          </div>
                        )}
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {memory.spiritualContext}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {memory.emotionalContext}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Memory Input Form */}
        {selectedQuestion && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-500" />
                Share Your Faith Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
                <p className="text-sm font-medium text-blue-900">Selected Question:</p>
                <p className="text-sm text-blue-800 mt-1">"{selectedQuestion}"</p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="response">Your Response</Label>
                <Textarea
                  id="response"
                  placeholder="Share your faith experience, how it shaped you, and what it means to your spiritual journey..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="min-h-32"
                  data-testid="textarea-faith-response"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="scripture">Scripture/Text Reference (Optional)</Label>
                  <Input
                    id="scripture"
                    placeholder="e.g., John 3:16, Quran 2:255, Psalm 23:4"
                    value={scripture}
                    onChange={(e) => setScripture(e.target.value)}
                    data-testid="input-scripture"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="translation">Translation (Optional)</Label>
                  <Input
                    id="translation"
                    placeholder="e.g., NIV, ESV, Sahih International"
                    value={scriptureTranslation}
                    onChange={(e) => setScriptureTranslation(e.target.value)}
                    data-testid="input-translation"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="spiritual-context">Spiritual Context</Label>
                  <Select value={spiritualContext} onValueChange={setSpiritualContext}>
                    <SelectTrigger data-testid="select-spiritual-context">
                      <SelectValue placeholder="How did this relate to your faith?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hope">Hope & Encouragement</SelectItem>
                      <SelectItem value="grief">Grief & Loss</SelectItem>
                      <SelectItem value="guidance">Seeking Guidance</SelectItem>
                      <SelectItem value="celebration">Celebration & Joy</SelectItem>
                      <SelectItem value="doubt">Questions & Doubt</SelectItem>
                      <SelectItem value="growth">Spiritual Growth</SelectItem>
                      <SelectItem value="worship">Worship & Prayer</SelectItem>
                      <SelectItem value="service">Service & Ministry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="emotional-context">Emotional Impact</Label>
                  <Select value={emotionalContext} onValueChange={setEmotionalContext}>
                    <SelectTrigger data-testid="select-emotional-context">
                      <SelectValue placeholder="How did this make you feel?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="peaceful">Peaceful</SelectItem>
                      <SelectItem value="comforted">Comforted</SelectItem>
                      <SelectItem value="inspired">Inspired</SelectItem>
                      <SelectItem value="challenged">Challenged</SelectItem>
                      <SelectItem value="grateful">Grateful</SelectItem>
                      <SelectItem value="convicted">Convicted</SelectItem>
                      <SelectItem value="hopeful">Hopeful</SelectItem>
                      <SelectItem value="reflective">Reflective</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleAddMemory}
                disabled={!response.trim() || addReligiousMemoryMutation.isPending}
                className="w-full"
                data-testid="button-add-memory"
              >
                {addReligiousMemoryMutation.isPending ? "Saving..." : "Add Faith Memory"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}