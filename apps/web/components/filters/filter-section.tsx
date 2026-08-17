"use client";

import { ChevronUp } from "lucide-react";
import { useState } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="border-b border-border pb-6"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between py-1 text-base font-medium">
        {title}
        <ChevronUp
          className={cn("size-4 transition-transform", !open && "rotate-180")}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4">{children}</CollapsibleContent>
    </Collapsible>
  );
}
