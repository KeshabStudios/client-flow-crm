import { Plus, Users, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function Contacts() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts"
        description="Manage your contact relationships."
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </PageHeader>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search contacts..." className="pl-9" />
        </div>
        <Button variant="outline" size="sm">Filter</Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No contacts yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
            Get started by adding your first contact. You can import them or add manually.
          </p>
          <div className="flex gap-3">
            <Button variant="outline">Import Contacts</Button>
            <Button>Add Your First Contact</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
