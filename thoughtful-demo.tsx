import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Heart, MessageSquare, Lightbulb, ArrowRight, CheckCircle, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ThoughtfulDemo() {
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  const [memoryResponse, setMemoryResponse] = useState<string>("");
  const [showConnections, setShowConnections] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Demo user data
  const userId = "user-1";

  // Fetch existing memories to show context
  const { data: memories = [] } = useQuery({
    queryKey: ["/api/memories", userId],
  });

  // Get thoughtful question suggestions
  const { data: questionData, isLoading: questionsLoading, refetch } = useQuery({
    queryKey: ["/api/question-suggestions", userId, "childhood"],
  });

  const questions = (questionData as any)?.questions || [];

  // Add memory mutation
  const addMemoryMutation = useMutation({
    mutationFn: async (memoryData: any) => {
      return apiRequest("/api/memories", "POST", memoryData);
    },
    onSuccess: () => {
      toast({
        title: "Memory added successfully",
        description: "Your response has been saved and will help generate better questions",
      });
      setMemoryResponse("");
      setSelectedQuestion("");
      queryClient.invalidateQueries({ queryKey: ["/api/memories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/question-suggestions"] });
    },
  });

  const handleQuestionSelect = (question: string) => {
    setSelectedQuestion(question);
    setShowConnections(false);
  };

  const handleAddMemory = () => {
    if (!selectedQuestion || !memoryResponse.trim()) return;

    addMemoryMutation.mutate({
      userId,
      categoryId: "childhood",
      question: selectedQuestion,
      response: memoryResponse,
      emotionalContext: "reflective",
    });
  };

  const demoMemories = [
    {
      question: "What's your earliest childhood memory that still feels vivid today?",
      response: "I remember being 4 years old, sitting in my grandmother's kitchen while she made apple pie. The smell of cinnamon filled the whole house, and she let me help roll the dough. I felt so important and loved.",
      emotionalContext: "warm"
    },
    {
      question: "Describe a family tradition that shaped who you are",
      response: "Every Sunday, our family had breakfast together - no phones, no TV. Dad would make pancakes and we'd all share what we were grateful for that week. It taught me the value of presence and gratitude.",
      emotionalContext: "grateful"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6" data-testid="page-thoughtful-demo">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              AI-Powered Thoughtful Questions
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience how our AI creates deep, personalized questions that build on your previous responses 
            to preserve your authentic voice and personality for future generations.
          </p>
        </div>

        {/* Demo Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Previous Memories Context */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Your Story So Far
                <Badge variant="secondary">Demo Data</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {demoMemories.map((memory, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border-l-4 border-l-blue-500">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    "{memory.question}"
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    {memory.response}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {memory.emotionalContext}
                  </Badge>
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  <Brain className="w-4 h-4 inline mr-1" />
                  <strong>AI Analysis:</strong> Based on these memories, you value family connection, 
                  gratitude, and meaningful traditions. The AI will generate questions that explore 
                  these themes deeper.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI-Generated Questions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  AI-Generated Questions
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
              ) : (
                <div className="space-y-3">
                  {questions.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Click "New Questions" to see AI-generated questions</p>
                    </div>
                  ) : (
                    questions.map((question: string, index: number) => (
                      <Card 
                        key={index}
                        className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${
                          selectedQuestion === question 
                            ? 'border-l-blue-500 bg-blue-50' 
                            : 'border-l-gray-300 hover:border-l-gray-400'
                        }`}
                        onClick={() => handleQuestionSelect(question)}
                        data-testid={`question-card-${index}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <MessageSquare className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium mb-2">{question}</p>
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="text-xs">
                                  Builds on your story
                                </Badge>
                                {selectedQuestion === question ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <ArrowRight className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Response Area */}
        {selectedQuestion && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-500" />
                Your Response
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
                <p className="text-sm font-medium text-blue-900">
                  Selected Question:
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  "{selectedQuestion}"
                </p>
              </div>

              <Textarea
                placeholder="Share your memory and feelings about this question..."
                value={memoryResponse}
                onChange={(e) => setMemoryResponse(e.target.value)}
                className="min-h-32"
                data-testid="textarea-memory-response"
              />

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setShowConnections(!showConnections)}
                  data-testid="button-show-connections"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  {showConnections ? "Hide" : "Show"} AI Connections
                </Button>

                <Button
                  onClick={handleAddMemory}
                  disabled={!memoryResponse.trim() || addMemoryMutation.isPending}
                  data-testid="button-add-memory"
                >
                  {addMemoryMutation.isPending ? "Saving..." : "Add Memory"}
                </Button>
              </div>

              {showConnections && (
                <div className="p-4 bg-yellow-50 rounded-lg border">
                  <h4 className="text-sm font-medium text-yellow-900 mb-2">
                    How this question connects to your story:
                  </h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• References your strong family connections from previous memories</li>
                    <li>• Builds on your appreciation for traditions and meaningful moments</li>
                    <li>• Explores the emotional impact of family relationships on your identity</li>
                    <li>• Helps capture your communication style and values for future conversations</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <Brain className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <h4 className="font-medium mb-1">AI Analysis</h4>
                <p className="text-gray-600">
                  Analyzes your existing memories, life events, and family relationships
                </p>
              </div>
              <div className="text-center">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <h4 className="font-medium mb-1">Connected Questions</h4>
                <p className="text-gray-600">
                  Generates questions that reference your specific experiences and build deeper understanding
                </p>
              </div>
              <div className="text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <h4 className="font-medium mb-1">Digital Legacy</h4>
                <p className="text-gray-600">
                  Preserves your authentic voice and personality for meaningful conversations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}