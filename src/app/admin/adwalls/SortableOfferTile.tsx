"use client";

import * as React from "react";
import { RestrictToVerticalAxis } from "@dnd-kit/abstract/modifiers";
import { PointerActivationConstraints, PointerSensor, KeyboardSensor, type DragEndEvent } from "@dnd-kit/dom";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { GripVertical } from "lucide-react";

import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export const OFFER_TILE_SORTABLE_TYPE = "offer-tile";

const pointerSensor = PointerSensor.configure({
  activationConstraints(event) {
    if (event.pointerType === "touch") {
      return [
        new PointerActivationConstraints.Delay({
          value: 250,
          tolerance: { x: 5, y: 5 },
        }),
      ];
    }
    return [new PointerActivationConstraints.Distance({ value: 8 })];
  },
});

export function OfferTilesDragProvider(props: {
  children: React.ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
}) {
  return (
    <DragDropProvider
      modifiers={[RestrictToVerticalAxis]}
      sensors={[KeyboardSensor, pointerSensor]}
      onDragEnd={(event) => {
        if (event.canceled) return;
        props.onDragEnd(event);
      }}
    >
      {props.children}
    </DragDropProvider>
  );
}

export function SortableOfferTile(props: {
  id: string;
  index: number;
  heading: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const {
    ref: setSortableElement,
    handleRef: setSortableHandle,
    isDragging,
  } = useSortable({
    id: props.id,
    index: props.index,
    type: OFFER_TILE_SORTABLE_TYPE,
    accept: OFFER_TILE_SORTABLE_TYPE,
    group: "offer-tiles",
  });

  return (
    <AccordionItem
      ref={setSortableElement}
      value={props.id}
      className={cn(
        "px-2 sm:px-4",
        isDragging && "relative z-10 bg-white opacity-70 shadow-sm"
      )}
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          ref={setSortableHandle}
          aria-label={`Reorder ${props.heading}`}
          className={cn(
            "mt-0.5 flex h-9 w-8 shrink-0 items-center justify-center rounded-md",
            "text-general-muted-foreground hover:bg-[#f4f6f8] hover:text-general-primary",
            "cursor-grab touch-none active:cursor-grabbing",
            "focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
          )}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <AccordionTrigger className="py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{props.heading}</div>
              <div className="truncate text-xs text-general-muted-foreground">{props.subtitle}</div>
            </div>
          </AccordionTrigger>
        </div>
      </div>
      <AccordionContent className="pb-4 pl-8">{props.children}</AccordionContent>
    </AccordionItem>
  );
}
