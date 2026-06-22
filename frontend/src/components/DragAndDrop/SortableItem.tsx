import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { twMerge } from "tailwind-merge";

interface SortableItemProps<T> {
  item: T;
  idKey: keyof T;
  className?: string;
  dragHandleOnly?: boolean;
  disabled?: boolean;
  children: (props: { dragHandleProps: any }) => React.ReactNode;
}

export function SortableItem<T>({
  item,
  idKey,
  className,
  children,
  dragHandleOnly = false,
  disabled = false,
}: SortableItemProps<T>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item[idKey] as UniqueIdentifier,
    disabled,
    animateLayoutChanges: () => false,
  });
  const dragHandleProps = { ...attributes, ...listeners };
  const itemAttributes = disabled || dragHandleOnly ? {} : attributes;
  const itemListeners = disabled || dragHandleOnly ? {} : listeners;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={twMerge(
        className,
        ` ${disabled ? "" : isDragging ? "cursor-grabbing" : dragHandleOnly ? "" : "cursor-grab"}`
      )}
      {...itemAttributes}
      {...itemListeners}
    >
      {children({ dragHandleProps })}
    </div>
  );
}
