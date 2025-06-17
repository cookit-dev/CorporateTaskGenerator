import React, { useState } from "react";
import { Form, Button, Row, Col, Alert, Modal } from "react-bootstrap";
import { TaskPriority } from "../../models/TaskPriority";
import { TaskStatus } from "../../models/TaskStatus";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { Task } from "../../models/Task";

const CreateTask: React.FC = () => {
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState<TaskPriority>(TaskPriority.Low);
    const [status, setStatus] = useState<TaskStatus>(TaskStatus.Pending);
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [description, setDescription] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const userId = localStorage.getItem("userId");

    const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as TaskPriority;
        if (value === TaskPriority.High) {
            setShowConfirm(true);
        }
        setPriority(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        const task: Task = {
            id: 0, // Assuming the backend will assign the ID
            title,
            priority,
            dueDate: dueDate,
            status,
            description: description || "",
            userId: userId != null ? parseInt(userId) : 0,
        };

        const response = await fetch("/api/task", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task),
        });

        if (response.ok) {
            setMessage("Task created successfully!");
            setTitle("");
            setPriority(TaskPriority.Low);
            setDueDate(null);
            setStatus(TaskStatus.Pending);
            setDescription("");
        } else {
            setMessage("Error creating task.");
        }
    };

    const handleConfirm = () => {
        setShowConfirm(false);
    };

    const handleCancel = () => {
        setShowConfirm(false);
        setPriority(TaskPriority.Low);
    };

    return (
        <Row className="justify-content-center mt-5">
            <Col xs={12} md={8} lg={6}>
                <h2>Add Task</h2>
                {message && <Alert variant={message.startsWith("Error") ? "danger" : "success"}>{message}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="taskTitle">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            maxLength={200}
                            placeholder="Enter task title"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="taskDescription">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Enter task description (optional)"
                            rows={3}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="taskPriority">
                        <Form.Label>Priority</Form.Label>
                        <Form.Select value={priority} onChange={handlePriorityChange} required>
                            {Object.values(TaskPriority).map((value) => (
                                <option key={value} value={value}>
                                    {value.charAt(0).toUpperCase() + value.slice(1)}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="taskDueDate">
                        <Form.Label>Due Date</Form.Label>
                        <div>
                            <DatePicker
                                selected={dueDate}
                                onChange={date => setDueDate(date)}
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
                    <Button variant="primary" type="submit" className="w-100">
                        Add Task
                    </Button>
                </Form>

                <Modal show={showConfirm} onHide={handleCancel} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>High Priority Confirmation</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to set this task to <b>High</b> priority?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleConfirm}>
                            Yes, set as High
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Col>
        </Row>
    );
};

export default CreateTask;