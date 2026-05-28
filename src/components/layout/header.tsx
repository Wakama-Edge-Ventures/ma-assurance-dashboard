"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { getDemoUser, signOut } from "@/lib/auth";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export function Header() {
  const router = useRouter();
  const [userName, setUserName] = useState("Utilisateur");

  useEffect(() => {
    const user = getDemoUser();
    if (user) setUserName(user.fullName);
  }, []);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-border bg-brand-bg/95 px-4 py-4 backdrop-blur">
      <div className="flex items-center gap-2">
        <Badge variant="muted">Mode demo MVP</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden text-sm text-brand-textMuted sm:inline-block">
          {userName}
        </span>
        <Button
          variant="ghost"
          onClick={() => {
            signOut();
            router.push("/fr/login");
          }}
          className="gap-1"
        >
          <LogOut className="h-4 w-4" />
          Deconnexion
        </Button>
      </div>
    </header>
  );
}
