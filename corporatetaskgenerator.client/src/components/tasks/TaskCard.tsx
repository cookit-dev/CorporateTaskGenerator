import React, { useState } from "react";
import { Card, Badge, Button, Form, Spinner, Alert } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Task } from "../../models/Task";
import { TaskPriority } from "../../models/TaskPriority";
import { TaskStatus } from "../../models/TaskStatus";

interface TaskCardProps {
    task: Task;
    onUpdate?: (task: Task) => void; // Optional callback for parent updates
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate }) => {
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState<Task>({ ...task });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [priority, setPriority] = useState<TaskPriority>(TaskPriority.Low);
    const [status, setStatus] = useState<TaskStatus>(TaskStatus.Pending);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDateChange = (date: Date | null) => {
        setForm((prev) => ({
            ...prev,
            dueDate: date,
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/task/${form.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error("Failed to update task");
            setEditMode(false);
            if (onUpdate) onUpdate(form);
        } catch (err: any) {
            setError(err.message || "Error updating task");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="mb-3 shadow-sm">
            <Card.Body>
                {editMode ? (
                    <Form>
                        <Form.Group className="mb-2">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="taskPriority">
                            <Form.Label>Priority</Form.Label>
                            <Form.Select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} required>
                                {Object.values(TaskPriority).map((value) => (
                                    <option key={value} value={value}>
                                        {value.charAt(0).toUpperCase() + value.slice(1)}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Due Date</Form.Label>
                            <div>
                                <DatePicker
                                    selected={form.dueDate}
                                    onChange={handleDateChange}
                                    dateFormat="yyyy-MM-dd"
                                    className="form-control"
                                    placeholderText="Select due date"
                                    required
                                />
                            </div>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="taskStatus">
                            <Form.Label>Status</Form.Label>
                            <Form.Select value={status} onChange={e => setStatus(e.target.value as TaskStatus)} required>
                                {Object.values(TaskStatus).map((value) => (
                                    <option key={value} value={value}>
                                        {value.charAt(0).toUpperCase() + value.slice(1)}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                value={form.description || ""}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-end gap-2 mt-3">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setEditMode(false);
                                    setForm({ ...task });
                                    setError(null);
                                }}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleSave}
                                disabled={loading}
                            >
                                {loading ? <Spinner size="sm" animation="border" /> : "Save"}
                            </Button>
                        </div>
                        {error && <Alert variant="danger" className="mt-2">{error}</Alert>}
                    </Form>
                ) : (
                    <>
                        <Card.Title>
                            {task.title}{" "}
                            <Badge bg="secondary" className="ms-2">
                                {task.priority}
                            </Badge>
                        </Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">
                            Due: {new Date(task.dueDate ? task.dueDate : new Date).toLocaleDateString()}
                        </Card.Subtitle>
                        <Card.Text>
                            {task.description || <span className="text-muted">No description</span>}
                        </Card.Text>
                        <div>
                            <Badge bg={task.status === "Completed" ? "success" : "warning"}>
                                {task.status}
                            </Badge>
                        </div>
                        <div className="mt-2 text-end">
                            <small>User ID: {task.userId ?? "-"}</small>
                        </div>
                        <div className="d-flex justify-content-end mt-3">
                            <Button variant="outline-primary" size="sm" onClick={() => setEditMode(true)}>
                                Edit
                            </Button>
                        </div>
                    </>
                )}
            </Card.Body>
        </Card>
    );
};

export default TaskCard;