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
  setItems: (items: T[]) => void;
  idKey: keyof T;
  strategy?: SortingStrategyTypes;
  children: (props: { item: T; index: number }) => React.ReactNode;
}

export function DragDropWrapper<T extends Record<string, any>>({
  items,
  setItems,
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
    setItems(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
      <SortableContext
        strategy={strategyToFunc(strategy)}
        items={items.map((item) => item[idKey] as UniqueIdentifier)}
      >
        {items.map((item, index) => children({ item, index }))}
      </SortableContext>
    </DndContext>
  );
}
