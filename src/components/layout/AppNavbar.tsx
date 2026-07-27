import { SidebarTrigger } from "@/components/ui/sidebar";
import { SearchCommand } from "./SearchCommand";
import { NotificationsPopover } from "./NotificationsPopover";
import { UserNav } from "./UserNav";
import { Separator } from "@/components/ui/separator";

export function AppNavbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
      <div className="flex items-center gap-2 md:gap-3">
        <SidebarTrigger className="h-8 w-8" />
        <Separator orientation="vertical" className="h-6" />
      </div>

      <div className="flex flex-1 items-center justify-end gap-3 md:gap-4">
        <SearchCommand />

        <div className="flex items-center gap-1">
          <NotificationsPopover />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
