import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, RefreshCw, Brain, Heart, MessageSquare, ArrowRight } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ThoughtfulQuestionsProps {
  userId?: string;
  categoryId?: string;
  onQuestionSelect?: (question: string) => void;
  showCategory?: boolean;
}

export function ThoughtfulQuestions({ 
  userId = "user-1", 
  categoryId,
  onQuestionSelect,
  showCategory = true
}: ThoughtfulQuestionsProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch intelligent question suggestions
  const { data: questionData, isLoading, refetch } = useQuery({
    queryKey: ["/api/question-suggestions", userId, categoryId],
    queryFn: () => apiRequest(`/api/question-suggestions/${userId}?categoryId=${categoryId || ''}`),
  });

  const questions = questionData?.questions || [];

  const handleQuestionSelect = (question: string) => {
    setSelectedQuestion(question);
    onQuestionSelect?.(question);
    
    toast({
      title: "Question selected",
      description: "Use this thoughtful prompt to guide your memory recording",
    });
  };

  const getQuestionIcon = (index: number) => {
    const icons = [Brain, Heart, MessageSquare, Lightbulb];
    const Icon = icons[index % icons.length];
    return <Icon className="w-4 h-4" />;
  };

  const getQuestionColor = (index: number) => {
    const colors = ["blue", "red", "green", "yellow", "purple"];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Generating thoughtful questions...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" data-testid="thoughtful-questions">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              AI-Suggested Questions
              {showCategory && categoryId && (
                <Badge variant="outline" className="ml-2">
                  {categoryId}
                </Badge>
              )}
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              data-testid="button-refresh-questions"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              New Questions
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No personalized questions yet</p>
              <p className="mb-4">
                Add more memories, life events, and family relationships for AI to generate 
                thoughtful questions that build on your unique story
              </p>
              <Button onClick={() => refetch()} data-testid="button-generate-questions">
                <Lightbulb className="w-4 h-4 mr-2" />
                Generate Questions
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border">
                <Brain className="w-5 h-5 text-blue-600" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Personalized for your story
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    These questions are generated based on your existing memories, life events, and family relationships
                  </p>
                </div>
              </div>

              {questions.map((question: string, index: number) => (
                <Card 
                  key={index}
                  className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${
                    selectedQuestion === question 
                      ? `border-l-${getQuestionColor(index)}-500 bg-${getQuestionColor(index)}-50 dark:bg-${getQuestionColor(index)}-950/20` 
                      : 'border-l-gray-300 hover:border-l-gray-400'
                  }`}
                  onClick={() => handleQuestionSelect(question)}
                  data-testid={`question-card-${index}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-${getQuestionColor(index)}-100 dark:bg-${getQuestionColor(index)}-900/20 flex items-center justify-center`}>
                        {getQuestionIcon(index)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed font-medium mb-2">
                          {question}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs bg-${getQuestionColor(index)}-100 text-${getQuestionColor(index)}-700 dark:bg-${getQuestionColor(index)}-900/20 dark:text-${getQuestionColor(index)}-300`}
                          >
                            Personalized
                          </Badge>
                          {selectedQuestion === question ? (
                            <Badge variant="default" className="text-xs">
                              Selected
                            </Badge>
                          ) : (
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  How these questions work
                </h4>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>
                    • <strong>Connected:</strong> Questions reference your existing memories and experiences
                  </p>
                  <p>
                    • <strong>Deep:</strong> Designed to reveal personality, values, and emotional patterns
                  </p>
                  <p>
                    • <strong>Personal:</strong> Built specifically for your unique life story and relationships
                  </p>
                  <p>
                    • <strong>Legacy-focused:</strong> Help capture your authentic voice for future generations
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}