import { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { FolderKanban, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectDialog } from "@/components/projects/ProjectDialog";
import { ProjectDetailDialog } from "@/components/projects/ProjectDetailDialog";
import { useProjects, useReorderProjects } from "@/hooks/useProjects";
import { PROJECT_STATUSES, PROJECT_STATUS_META } from "@/constants/projects";
import type { ProjectReorderItem } from "@/services/projects.service";
import type { Project, ProjectStatus } from "@/types/project";
import { cn } from "@/lib/utils";

type Board = Record<ProjectStatus, Project[]>;

function group(projects: Project[]): Board {
  const board: Board = { todo: [], in_progress: [], testing: [], completed: [] };
  for (const p of projects) board[p.status]?.push(p);
  for (const k of Object.keys(board) as ProjectStatus[]) board[k].sort((a, b) => a.order - b.order);
  return board;
}

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useProjects();
  const reorder = useReorderProjects();
  const [board, setBoard] = useState<Board>(() => group(projects));

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<ProjectStatus>("todo");
  const [detail, setDetail] = useState<Project | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => setBoard(group(projects)), [projects]);

  const openCreate = (status: ProjectStatus) => {
    setEditing(null);
    setDefaultStatus(status);
    setDialogOpen(true);
  };
  const openDetail = (p: Project) => {
    setDetail(p);
    setDetailOpen(true);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    const from = source.droppableId as ProjectStatus;
    const to = destination.droppableId as ProjectStatus;
    const next: Board = { ...board, [from]: [...board[from]], [to]: [...board[to]] };
    const [moved] = next[from].splice(source.index, 1);
    next[to].splice(destination.index, 0, { ...moved, status: to });
    setBoard(next);
    const changes: ProjectReorderItem[] = [];
    next[to].forEach((p, i) => changes.push({ id: p._id, order: i, status: to }));
    if (from !== to) next[from].forEach((p, i) => changes.push({ id: p._id, order: i, status: from }));
    reorder.mutate(changes);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Ship portfolio-worthy projects with a kanban board, milestones and tasks."
        icon={<FolderKanban className="h-5 w-5" />}
        actions={
          <Button variant="gradient" onClick={() => openCreate("todo")}>
            <Plus className="h-4 w-4" /> New Project
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-6 w-6" />}
          title="No projects yet"
          description="Add your first project to start tracking milestones and progress."
          action={
            <Button variant="gradient" onClick={() => openCreate("todo")}>
              <Plus className="h-4 w-4" /> New Project
            </Button>
          }
        />
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {PROJECT_STATUSES.map((status) => (
              <div key={status} className="flex flex-col rounded-2xl border border-border bg-muted/30">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2.5 w-2.5 rounded-full", PROJECT_STATUS_META[status].dot)} />
                    <span className="text-sm font-semibold">{PROJECT_STATUS_META[status].label}</span>
                    <span className="rounded-md bg-muted px-1.5 text-xs text-muted-foreground">{board[status].length}</span>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={() => openCreate(status)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn("flex min-h-[120px] flex-1 flex-col gap-2 px-3 pb-3", snapshot.isDraggingOver && "bg-primary/5")}
                    >
                      {board[status].map((p, index) => (
                        <Draggable key={p._id} draggableId={p._id} index={index}>
                          {(prov, snap) => (
                            <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
                              <ProjectCard project={p} onClick={() => openDetail(p)} dragging={snap.isDragging} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      <ProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} project={editing} defaultStatus={defaultStatus} />
      <ProjectDetailDialog
        project={detail}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={(p) => {
          setEditing(p);
          setDialogOpen(true);
        }}
      />
    </div>
  );
}
