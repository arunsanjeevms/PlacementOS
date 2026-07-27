import { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { STATUS_META, type TaskStatus } from "@/constants/tasks";
import { useReorderTasks } from "@/hooks/useTasks";
import type { ReorderItem } from "@/services/tasks.service";
import type { Task } from "@/types/task";
import { cn } from "@/lib/utils";

const COLUMNS: TaskStatus[] = ["todo", "in_progress", "done"];

interface KanbanBoardProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onAdd: (status: TaskStatus) => void;
}

type Board = Record<TaskStatus, Task[]>;

function groupTasks(tasks: Task[]): Board {
  const board: Board = { todo: [], in_progress: [], done: [], archived: [] };
  for (const t of tasks) board[t.status]?.push(t);
  for (const key of Object.keys(board) as TaskStatus[]) {
    board[key].sort((a, b) => a.order - b.order);
  }
  return board;
}

export function KanbanBoard({ tasks, onEdit, onAdd }: KanbanBoardProps) {
  const reorder = useReorderTasks();
  const [board, setBoard] = useState<Board>(() => groupTasks(tasks));

  // Keep local board in sync when the underlying query data changes.
  useEffect(() => setBoard(groupTasks(tasks)), [tasks]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const from = source.droppableId as TaskStatus;
    const to = destination.droppableId as TaskStatus;
    const next: Board = { ...board, [from]: [...board[from]], [to]: [...board[to]] };

    const [moved] = next[from].splice(source.index, 1);
    const updatedTask = { ...moved, status: to };
    next[to].splice(destination.index, 0, updatedTask);
    setBoard(next);

    // Persist new order for the affected column(s).
    const changes: ReorderItem[] = [];
    next[to].forEach((t, i) => changes.push({ id: t._id, order: i, status: to }));
    if (from !== to) next[from].forEach((t, i) => changes.push({ id: t._id, order: i, status: from }));
    reorder.mutate(changes);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((status) => (
          <div key={status} className="flex flex-col rounded-2xl border border-border bg-muted/30">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", STATUS_META[status].dot)} />
                <span className="text-sm font-semibold">{STATUS_META[status].label}</span>
                <span className="rounded-md bg-muted px-1.5 text-xs text-muted-foreground">{board[status].length}</span>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => onAdd(status)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Droppable droppableId={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "flex min-h-[120px] flex-1 flex-col gap-2 px-3 pb-3 transition-colors",
                    snapshot.isDraggingOver && "bg-primary/5"
                  )}
                >
                  {board[status].map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id} index={index}>
                      {(prov, snap) => (
                        <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
                          <TaskCard task={task} onClick={() => onEdit(task)} dragging={snap.isDragging} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {board[status].length === 0 && !snapshot.isDraggingOver && (
                    <button
                      onClick={() => onAdd(status)}
                      className="rounded-lg border border-dashed border-border/70 py-6 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      + Add task
                    </button>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
