import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { UserPlus, MoreVertical, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function FamilyAccess() {
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    relationship: "",
    accessLevel: "limited",
  });
  const { toast } = useToast();
  const userId = "user-1"; // Default user for demo

  const { data: familyMembers = [] } = useQuery({
    queryKey: ["/api/family", userId],
  });

  const addFamilyMemberMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/family", { ...data, userId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/family"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Family Member Added",
        description: "Family member has been successfully added.",
      });
      setIsAddingMember(false);
      setNewMember({ name: "", email: "", relationship: "", accessLevel: "limited" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add family member. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email || !newMember.relationship) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    addFamilyMemberMutation.mutate(newMember);
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "full":
        return "bg-green-100 text-green-700";
      case "limited":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const getAccessLevelText = (level: string) => {
    switch (level) {
      case "full":
        return "Full Access";
      case "limited":
        return "Limited Access";
      default:
        return level;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6" data-testid="family-access">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-warm-gray">Family Access</h3>
        <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
          <DialogTrigger asChild>
            <Button className="px-4 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-secondary/90" data-testid="button-invite-family">
              <UserPlus size={16} className="mr-2" />
              Invite Family
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-add-family-member">
            <DialogHeader>
              <DialogTitle>Add Family Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-1">Name</label>
                <Input
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="Enter name"
                  data-testid="input-member-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-1">Email</label>
                <Input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="Enter email"
                  data-testid="input-member-email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-1">Relationship</label>
                <Input
                  value={newMember.relationship}
                  onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                  placeholder="e.g., Son, Daughter, Friend"
                  data-testid="input-member-relationship"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-1">Access Level</label>
                <Select value={newMember.accessLevel} onValueChange={(value) => setNewMember({ ...newMember, accessLevel: value })}>
                  <SelectTrigger data-testid="select-access-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="limited">Limited Access</SelectItem>
                    <SelectItem value="full">Full Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsAddingMember(false)} className="flex-1" data-testid="button-cancel-add-member">
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddMember} 
                  disabled={addFamilyMemberMutation.isPending}
                  className="flex-1 bg-secondary hover:bg-secondary/90"
                  data-testid="button-save-member"
                >
                  {addFamilyMemberMutation.isPending ? "Adding..." : "Add Member"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-3">
        {familyMembers.map((member: any) => (
          <div key={member.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg" data-testid={`family-member-${member.id}`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                {member.avatar ? (
                  <img 
                    src={member.avatar} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-warm-gray" data-testid={`text-member-name-${member.id}`}>
                  {member.name}
                </p>
                <p className="text-xs text-soft-gray" data-testid={`text-member-relationship-${member.id}`}>
                  {member.relationship}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span 
                className={`px-2 py-1 text-xs rounded-full font-medium ${getAccessLevelColor(member.accessLevel)}`}
                data-testid={`text-member-access-${member.id}`}
              >
                {getAccessLevelText(member.accessLevel)}
              </span>
              <button className="text-soft-gray hover:text-warm-gray" data-testid={`button-member-menu-${member.id}`}>
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-start space-x-2">
          <Info className="text-blue-500 text-sm mt-0.5" size={16} />
          <div>
            <p className="text-sm text-blue-700 font-medium">Privacy & Security</p>
            <p className="text-xs text-blue-600 mt-1">
              All conversations are encrypted and access is strictly controlled by your permissions. 
              Family members can only access what you've explicitly shared.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
