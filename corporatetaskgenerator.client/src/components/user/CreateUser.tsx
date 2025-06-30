import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const CreateUser: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        const response = await fetch("/api/user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
        if (response.ok) {
            setMessage("User created!");
            setUsername("");
            setPassword("");
        } else {
            setMessage("Error creating user.");
        }
    };

    return (
        <div className="create-user-container">
            <h2 className="mb-4">Create a User</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="username">
                    <Form.Control
                        type="text"
                        placeholder="Enter username..."
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                    <Form.Control
                        type="password"
                        placeholder="Enter password..."
                        required
                        onChange={e => setPassword(e.target.value)}
                    />

                </Form.Group>
                {message && <div>{message}</div>}
                <Button variant="primary" type="submit">
                    Create User
                </Button>
            </Form>
        </div>

    );
};

export default CreateUser;