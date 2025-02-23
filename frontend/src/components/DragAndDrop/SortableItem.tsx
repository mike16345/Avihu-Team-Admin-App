import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { twMerge } from "tailwind-merge";

interface SortableItemProps<T> {
  item: T;
  idKey: keyof T;
  className?: string;
  children: (props: { dragHandleProps: any }) => React.ReactNode;
}

export function SortableItem<T>({ item, idKey, className, children }: SortableItemProps<T>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item[idKey] as UniqueIdentifier,
    animateLayoutChanges: () => false,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={twMerge(className, ` ${isDragging ? "cursor-grabbing" : "cursor-grab"}`)}
      {...attributes}
      {...listeners}
    >
      {children({ dragHandleProps: listeners })}
    </div>
  );
}
