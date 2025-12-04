"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useOthers, useSelf } from "@/lib/liveblocks";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Monitor, Moon, Sun } from "lucide-react";

const MAX_VISIBLE = 5;

export function PresenceAvatars() {
  const others = useOthers();
  const self = useSelf();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const allUsers = [
    ...(self ? [{ connectionId: self.connectionId, info: self.info }] : []),
    ...others.map((other) => ({
      connectionId: other.connectionId,
      info: other.info,
    })),
  ];

  const visibleUsers = allUsers.slice(0, MAX_VISIBLE);
  const remainingCount = allUsers.length - MAX_VISIBLE;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TooltipProvider>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex -space-x-2 cursor-pointer">
            {visibleUsers.map((user) => (
              <Tooltip key={user.connectionId}>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Avatar
                      className="h-8 w-8 border-2 border-white dark:border-slate-900"
                      style={{ backgroundColor: user.info?.color || "#6366f1" }}
                    >
                      <AvatarFallback
                        className="text-xs font-medium text-white"
                        style={{ backgroundColor: user.info?.color || "#6366f1" }}
                      >
                        {getInitials(user.info?.name || "?")}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online indicator */}
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-slate-900" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {user.info?.name || "Anoniem"}
                    {self?.connectionId === user.connectionId && " (jij)"}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}

            {remainingCount > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-8 w-8 border-2 border-white bg-slate-200 dark:border-slate-900 dark:bg-slate-700">
                    <AvatarFallback className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      +{remainingCount}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{remainingCount} meer deelnemers</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Thema</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {mounted && (
            <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
              <DropdownMenuRadioItem value="light">
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                <Monitor className="mr-2 h-4 w-4" />
                System
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}
