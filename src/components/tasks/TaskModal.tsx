import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Task, TaskInput, TaskPriority, TaskStatus } from "@/lib/types";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/types";

interface TaskModalProps {
  open: boolean;
  task: Task | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: TaskInput) => void;
}

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const TEXTAREA_CLASS =
  "flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function TaskModal({ open, task, saving, onClose, onSubmit }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("To Do");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [titleError, setTitleError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(task?.title ?? "");
      setDescription(task?.description ?? "");
      setStatus(task?.status ?? "To Do");
      setPriority(task?.priority ?? "Medium");
      setTitleError(null);
    }
  }, [open, task]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setTitleError("Title is required.");
      return;
    }
    if (trimmed.length > 200) {
      setTitleError("Title must be at most 200 characters.");
      return;
    }
    setTitleError(null);
    onSubmit({
      title: trimmed,
      description: description.trim(),
      status,
      priority,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !saving && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {task ? "Edit task" : "Create a new task"}
          </DialogTitle>
          <DialogDescription>
            {task
              ? "Update the task details below. Changes are saved to PostgreSQL."
              : "Add a task with a title, description, status and priority."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              name="title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (titleError) setTitleError(null);
              }}
              placeholder="e.g. Review the deployment plan"
              maxLength={200}
              autoFocus
              aria-invalid={titleError ? true : undefined}
            />
            {titleError ? (
              <p className="text-sm text-rose-600" role="alert">
                {titleError}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <textarea
              id="task-description"
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add more context about this task (optional)"
              maxLength={5000}
              className={TEXTAREA_CLASS}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-status">Status</Label>
              <select
                id="task-status"
                name="status"
                value={status}
                onChange={(event) => setStatus(event.target.value as TaskStatus)}
                className={SELECT_CLASS}
              >
                {TASK_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              <select
                id="task-priority"
                name="priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value as TaskPriority)}
                className={SELECT_CLASS}
              >
                {TASK_PRIORITIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 transition-colors hover:bg-indigo-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : task ? (
                "Save changes"
              ) : (
                "Create task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}