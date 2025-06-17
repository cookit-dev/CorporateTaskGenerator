import { TaskPriority } from "./TaskPriority";
import { TaskStatus } from './TaskStatus';

export class Task {
    id: number;
    title: string;
    description?: string;
    priority: TaskPriority;
    dueDate: Date | null;
    status: TaskStatus;
    userId?: number;
    constructor(
        id: number,
        title: string,
        priority: TaskPriority,
        dueDate: Date,
        status: TaskStatus,
        description?: string,
        userId?: number
    ) {
        this.id = id;
        this.title = title;
        this.priority = priority;
        this.dueDate = dueDate;
        this.status = status;
        this.description = description;
        this.userId = userId;
    }
}