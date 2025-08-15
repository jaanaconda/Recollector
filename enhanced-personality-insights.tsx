import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Brain, Lightbulb, Heart, MessageSquare, Target, Zap, TrendingUp, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PersonalityInsight {
  id: string;
  userId: string;
  category: string;
  insight: string;
  confidence: number;
  sources: string[];
  examples: string[];
  lastUpdated: string;
  createdAt: string;
}

const INSIGHT_CATEGORIES = [
  { id: 'communication_style', label: 'Communication Style', icon: MessageSquare, color: 'blue' },
  { id: 'values', label: 'Core Values', icon: Heart, color: 'red' },
  { id: 'decision_making', label: 'Decision Making', icon: Target, color: 'green' },
  { id: 'humor', label: 'Sense of Humor', icon: Lightbulb, color: 'yellow' },
  { id: 'emotional_patterns', label: 'Emotional Patterns', icon: Brain, color: 'purple' },
  { id: 'learning_style', label: 'Learning Style', icon: TrendingUp, color: 'indigo' },
];

export function EnhancedPersonalityInsights({ userId = "user-1" }: { userId?: string }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch personality insights
  const { data: insights = [], isLoading } = useQuery<PersonalityInsight[]>({
    queryKey: ["/api/personality-insights", userId]
  });

  // Generate insights mutation
  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/personality-insights/generate", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personality-insights"] });
      toast({
        title: "Success",
        description: "Personality insights have been regenerated based on your latest memories and life events"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate personality insights",
        variant: "destructive",
      });
    },
  });

  const getInsightsByCategory = (category: string) => {
    return insights.filter(insight => insight.category === category);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.6) return "bg-yellow-500";
    if (confidence >= 0.4) return "bg-orange-500";
    return "bg-red-500";
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = INSIGHT_CATEGORIES.find(cat => cat.id === categoryId);
    if (!category) return Brain;
    return category.icon;
  };

  const getCategoryColor = (categoryId: string) => {
    const category = INSIGHT_CATEGORIES.find(cat => cat.id === categoryId);
    return category?.color || 'gray';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Personality Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="personality-insights-container">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Personality Insights
            </div>
            <Button
              size="sm"
              onClick={() => generateInsightsMutation.mutate()}
              disabled={generateInsightsMutation.isPending}
              data-testid="button-regenerate-insights"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${generateInsightsMutation.isPending ? 'animate-spin' : ''}`} />
              {generateInsightsMutation.isPending ? "Analyzing..." : "Regenerate"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No personality insights yet</p>
              <p className="mb-4">AI will analyze your memories and life events to understand your unique personality</p>
              <Button 
                onClick={() => generateInsightsMutation.mutate()}
                disabled={generateInsightsMutation.isPending}
                data-testid="button-generate-first-insights"
              >
                <Zap className="w-4 h-4 mr-2" />
                Generate Your Personality Profile
              </Button>
            </div>
          ) : (
            <>
              {/* Category Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {INSIGHT_CATEGORIES.map((category) => {
                  const categoryInsights = getInsightsByCategory(category.id);
                  const avgConfidence = categoryInsights.length > 0 
                    ? categoryInsights.reduce((sum, insight) => sum + insight.confidence, 0) / categoryInsights.length 
                    : 0;
                  
                  const Icon = category.icon;
                  
                  return (
                    <Card 
                      key={category.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedCategory === category.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                      data-testid={`card-category-${category.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 text-${category.color}-500`} />
                            <span className="font-medium text-sm">{category.label}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {categoryInsights.length}
                          </Badge>
                        </div>
                        {categoryInsights.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Confidence</span>
                              <span>{Math.round(avgConfidence * 100)}%</span>
                            </div>
                            <Progress value={avgConfidence * 100} className="h-1" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Detailed Insights */}
              {selectedCategory && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {(() => {
                        const category = INSIGHT_CATEGORIES.find(cat => cat.id === selectedCategory);
                        const Icon = category?.icon || Brain;
                        return <Icon className={`w-5 h-5 text-${category?.color || 'gray'}-500`} />;
                      })()}
                      {INSIGHT_CATEGORIES.find(cat => cat.id === selectedCategory)?.label || selectedCategory}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getInsightsByCategory(selectedCategory).map((insight) => (
                        <div key={insight.id} className="border rounded-lg p-4" data-testid={`insight-${insight.id}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <p className="text-sm leading-relaxed mb-2">{insight.insight}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Confidence:</span>
                                <div className="flex items-center gap-1">
                                  <div className={`w-2 h-2 rounded-full ${getConfidenceColor(insight.confidence)}`}></div>
                                  <span className="text-xs">{Math.round(insight.confidence * 100)}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {insight.examples.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs text-muted-foreground mb-2">Examples:</p>
                              <div className="space-y-1">
                                {insight.examples.map((example, index) => (
                                  <p key={index} className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded italic">
                                    "{example}"
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                            Last updated: {new Date(insight.lastUpdated).toLocaleDateString()}
                            {insight.sources.length > 0 && (
                              <span className="ml-4">
                                Based on {insight.sources.length} source(s)
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Summary Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">AI Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{insights.length}</p>
                      <p className="text-xs text-muted-foreground">Total Insights</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {insights.filter(i => i.confidence >= 0.8).length}
                      </p>
                      <p className="text-xs text-muted-foreground">High Confidence</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {INSIGHT_CATEGORIES.filter(cat => getInsightsByCategory(cat.id).length > 0).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Categories</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">
                        {Math.round((insights.reduce((sum, insight) => sum + insight.confidence, 0) / insights.length) * 100) || 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">Avg Confidence</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}