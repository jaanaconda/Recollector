import { useState } from "react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { ChatInterface } from "@/components/chat-interface";
import { DigitalLegacyInterface } from "@/components/digital-legacy-interface";
import { RecordingModal } from "@/components/recording-modal";
import { RecentConversations } from "@/components/recent-conversations";
import { FamilyAccess } from "@/components/family-access";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Heart } from "lucide-react";

export default function Home() {
  const [mode, setMode] = useState<"conversation" | "recording" | "legacy">("legacy");
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);

  const handleModeChange = (newMode: "conversation" | "recording" | "legacy") => {
    if (newMode === "recording") {
      setIsRecordingModalOpen(true);
    } else {
      setMode(newMode);
    }
  };

  const handleAddMemories = () => {
    setIsRecordingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="page-home">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Sidebar onAddMemories={handleAddMemories} />
          
          <div className="lg:col-span-3">
            {/* Privacy Highlight */}
            <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900">
                      Create Your Digital Legacy
                    </h3>
                    <p className="text-sm text-purple-700">
                      Preserve your voice, personality, and wisdom so loved ones can continue conversations with you forever.
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => setMode("legacy")}
                    variant={mode === "legacy" ? "default" : "outline"}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    data-testid="button-legacy-mode"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Try Legacy Mode
                  </Button>
                  <Button 
                    onClick={() => window.open('/religious-memories', '_blank')}
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    data-testid="button-religious-memories"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Religious Section
                  </Button>
                </div>
              </div>
            </div>

            {mode === "legacy" ? (
              <DigitalLegacyInterface userId="user-1" userName="Sarah Johnson" />
            ) : (
              <>
                <ChatInterface mode={mode} onModeChange={handleModeChange} />
                <RecentConversations />
                <FamilyAccess />
              </>
            )}
          </div>
        </div>
      </div>

      <RecordingModal 
        isOpen={isRecordingModalOpen}
        onClose={() => setIsRecordingModalOpen(false)}
      />
    </div>
  );
}
