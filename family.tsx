import { FamilyTree } from "@/components/family-tree";

export default function FamilyPage() {
  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="family-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Family Tree
          </h1>
          <p className="text-muted-foreground mt-2" data-testid="text-page-description">
            Map your family relationships and preserve important details about the people who shaped your life
          </p>
        </div>
      </div>

      <FamilyTree />
    </div>
  );
}