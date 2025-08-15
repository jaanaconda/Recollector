import { useState } from "react";
import { Lock, Shield, Eye, Share2, CheckCircle, AlertTriangle, Heart, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function PrivacyDemo() {
  const [demoPasscode, setDemoPasscode] = useState("ABC123DEF456");
  const { toast } = useToast();

  const copyPasscode = () => {
    navigator.clipboard.writeText(demoPasscode);
    toast({
      title: "Passcode Copied",
      description: "Demo passcode copied to clipboard",
    });
  };

  const visitSharedMemory = () => {
    window.open(`/shared?code=${demoPasscode}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="page-privacy-demo">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-warm-gray mb-4">
            Complete Privacy by Default
          </h1>
          <p className="text-xl text-soft-gray max-w-2xl mx-auto">
            Recollector puts you in complete control of your memories. Everything is private until you explicitly choose to share it with unique passcodes.
          </p>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Private by Default</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-soft-gray text-sm">
                All memories are completely private when created. No one can access them without your explicit permission.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Share2 className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Selective Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-soft-gray text-sm">
                Share specific memories with specific people using unique passcodes. You control who sees what.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Access Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-soft-gray text-sm">
                See exactly who accessed your shared memories and when. Full transparency and control.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Demo Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-warm-gray mb-6 text-center">
            Try the Privacy System
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Demo Memory */}
            <div>
              <h3 className="text-lg font-medium text-warm-gray mb-4">Sample Private Memory</h3>
              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-green-100 text-green-800">
                      <Heart className="h-3 w-3 mr-1" />
                      Family Relationships
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-medium text-warm-gray">
                    "What's your favorite memory with your grandparents?"
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-soft-gray mb-4">
                    I remember summer afternoons at my grandmother's house, helping her bake chocolate chip cookies. She would let me lick the spoon and tell me stories about when she was young...
                  </p>
                  
                  <div className="flex items-center space-x-2 text-xs text-soft-gray">
                    <Calendar className="h-3 w-3" />
                    <span>Recorded 2 days ago</span>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-green-200">
                    <p className="text-xs text-green-700 mb-3">
                      <CheckCircle className="h-3 w-3 inline mr-1" />
                      This memory is completely private until you share it
                    </p>
                    
                    <Button
                      onClick={() => toast({
                        title: "Privacy Protected",
                        description: "This memory would remain private in your personal account",
                      })}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      data-testid="button-demo-privacy"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Protected by Privacy System
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sharing Demo */}
            <div>
              <h3 className="text-lg font-medium text-warm-gray mb-4">Secure Sharing</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Share2 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Demo Share Link Created
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-blue-700 mb-1">
                        Unique Access Passcode
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={demoPasscode}
                          readOnly
                          className="font-mono text-sm bg-white"
                          data-testid="input-demo-passcode"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={copyPasscode}
                          data-testid="button-copy-demo-passcode"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-xs text-blue-700 space-y-1">
                      <div className="flex justify-between">
                        <span>Views allowed:</span>
                        <span className="font-medium">Unlimited</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current views:</span>
                        <span className="font-medium">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expires:</span>
                        <span className="font-medium">In 30 days</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={visitSharedMemory}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      data-testid="button-try-shared-memory"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Try Accessing Shared Memory
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Principles */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="text-lg font-medium text-amber-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Our Privacy Principles
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-800">
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>No memories are public unless you explicitly make them so</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Every share link uses a unique, secure passcode</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>You can revoke access to shared memories at any time</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>All access is logged and tracked for your security</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>You control view limits and expiration dates</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Your data stays yours - no selling or sharing with third parties</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}