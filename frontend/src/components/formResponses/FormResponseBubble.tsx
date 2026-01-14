import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useFormResponseQuery from "@/hooks/queries/formResponses/useFormResponseQuery";
import FormResponseViewer from "@/components/formResponses/FormResponseViewer";
import Loader from "@/components/ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import { useUsersStore } from "@/store/userStore";
import useUserQuery from "@/hooks/queries/user/useUserQuery";
import { FormResponse } from "@/interfaces/IFormResponse";

type FormResponseBubbleProps = {
  responseId?: string;
  initialTop?: number;
  rightOffset?: number;
  className?: string;
  formResponse: FormResponse | undefined;
};

const BUBBLE_SIZE = 56;
const EDGE_PADDING = 16;
const MAX_DRAG_X = 80;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const FormResponseBubble = ({
  responseId,
  formResponse,
  initialTop = 180,
  rightOffset = EDGE_PADDING,
  className,
}: FormResponseBubbleProps) => {
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(initialTop);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({
    pointerId: -1,
    startY: 0,
    startX: 0,
    startTop: 0,
    moved: false,
    justDragged: false,
  });

  const { data, isLoading, isError, error } = useFormResponseQuery(
    responseId,
    open && !formResponse
  );
  const response = formResponse ?? data?.data;

  const { users } = useUsersStore();
  const cachedUser = useMemo(
    () => users.find((entry) => entry._id === response?.userId),
    [users, response?.userId]
  );

  const { data: fetchedUser } = useUserQuery(
    response?.userId,
    Boolean(response?.userId) && !cachedUser && open
  );

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startX: event.clientX,
      startTop: top,
      moved: false,
      justDragged: false,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (dragState.current.pointerId !== event.pointerId) return;
    const deltaY = event.clientY - dragState.current.startY;
    const deltaX = event.clientX - dragState.current.startX;
    if (Math.abs(deltaY) > 4 || Math.abs(deltaX) > 4) {
      dragState.current.moved = true;
    }
    const maxTop = Math.max(EDGE_PADDING, window.innerHeight - BUBBLE_SIZE - EDGE_PADDING);
    setTop(clamp(dragState.current.startTop + deltaY, EDGE_PADDING, maxTop));
    setDragOffsetX(clamp(deltaX, -MAX_DRAG_X, MAX_DRAG_X / 2));
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (dragState.current.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragState.current.pointerId = -1;
    if (dragState.current.moved) {
      dragState.current.justDragged = true;
    }
    dragState.current.moved = false;
    setDragOffsetX(0);
    setIsDragging(false);
  };

  const handleClick = () => {
    if (dragState.current.justDragged) {
      dragState.current.justDragged = false;
      return;
    }
    setOpen(true);
  };

  const respondentName = useMemo(() => {
    const user = cachedUser || fetchedUser;
    const firstName = user?.firstName?.trim() ?? "";
    const lastName = user?.lastName?.trim() ?? "";
    const name = `${firstName} ${lastName}`.trim();
    return name || response?.userId || "Unknown user";
  }, [cachedUser, fetchedUser, response?.userId]);

  useEffect(() => {
    const handleResize = () => {
      const maxTop = Math.max(EDGE_PADDING, window.innerHeight - BUBBLE_SIZE - EDGE_PADDING);
      setTop((prev) => clamp(prev, EDGE_PADDING, maxTop));
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="secondary"
        className={cn(
          "fixed z-40 left-0 h-14 w-14 rounded-full shadow-lg cursor-grab",
          isDragging && "cursor-grabbing",
          className
        )}
        style={{
          top,
          right: rightOffset,
          transform: `translateX(${dragOffsetX}px)`,
          touchAction: "none",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
        aria-label="Open response details"
      >
        שאלון
      </Button>
      <DialogContent className="max-w-4xl min-h-[90vh] max-h-[90vh] overflow-y-auto" dir="rtl">
        {!responseId ? (
          <div className="py-10 flex items-center justify-center size-full text-center text-sm text-muted-foreground">
            אין תגובה זמינה להצגה.
          </div>
        ) : isLoading ? (
          <div className="py-10 flex items-center justify-center">
            <Loader size="large" />
          </div>
        ) : isError ? (
          <ErrorPage message={error?.message} />
        ) : response ? (
          <FormResponseViewer
            response={response}
            respondentName={respondentName}
            navigationMode="select"
          />
        ) : (
          <div className="py-10 flex items-center justify-center size-full text-center text-sm text-muted-foreground">
            אין תגובה זמינה להצגה.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FormResponseBubble;
