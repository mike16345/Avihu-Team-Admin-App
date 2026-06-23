import React from "react";
import {
  DndContext,
  closestCenter,
  UniqueIdentifier,
  useSensors,
  useSensor,
  MouseSensor,
  TouchSensor,
  PointerActivationConstraint,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  rectSwappingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

type SortingStrategyTypes = "vertical" | "horizontal" | "rectSwapping" | "rectSorting";

const strategyToFunc = (strategy: SortingStrategyTypes) => {
  switch (strategy) {
    case "vertical":
      return verticalListSortingStrategy;
    case "horizontal":
      return horizontalListSortingStrategy;
    case "rectSwapping":
      return rectSwappingStrategy;
    case "rectSorting":
      return rectSortingStrategy;
    default:
      return rectSortingStrategy;
  }
};

interface DragDropWrapperProps<T extends Record<string, any>> {
  items: T[];
  setItems?: (items: T[]) => void;
  onMove?: (oldIndex: number, newIndex: number) => void;
  idKey: keyof T;
  strategy?: SortingStrategyTypes;
  children: (props: { item: T; index: number }) => React.ReactNode;
}

export function DragDropWrapper<T extends Record<string, any>>({
  items,
  setItems,
  onMove,
  idKey,
  children,
  strategy = "rectSorting",
}: DragDropWrapperProps<T>) {
  const delayConstraint: PointerActivationConstraint = { delay: 300, tolerance: 10 };

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: delayConstraint,
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: delayConstraint,
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item[idKey] === active.id);
    const newIndex = items.findIndex((item) => item[idKey] === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    if (onMove) {
      onMove(oldIndex, newIndex);
      return;
    }

    if (setItems) {
      setItems(arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
      <SortableContext
        strategy={strategyToFunc(strategy)}
        items={items.map((item) => item[idKey] as UniqueIdentifier)}
      >
        {items.map((item, index) => (
          <React.Fragment key={String((item[idKey] as UniqueIdentifier) ?? index)}>
            {children({ item, index })}
          </React.Fragment>
        ))}
      </SortableContext>
    </DndContext>
  );
}
