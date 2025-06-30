import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Form, Alert } from 'react-bootstrap';

const Login: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const navigate = useNavigate();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        const response = await fetch("/api/user/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
        if (response.ok) {
            setMessage("Login successful!");
            // After successful login
            const data = await response.json();

            if (data.token) {
                localStorage.setItem("jwt", data.token);
                localStorage.setItem("userId", data.user.id);
                navigate("/task-table"); 
            }
        } else {
            setMessage("Invalid username or password.");
        }
    };

    return (

        <div className="login-container">
            <h2 className="mb-4">Login</h2>
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

                {message && <Alert variant={message.startsWith("Error") ? "danger" : "success"}>{message}</Alert>}

                <Button variant="primary" type="submit">
                    Login
                </Button>
                <div className="mt-3">
                    <Link to="/create-user">Create a new account</Link>
                </div>
            </Form>
        </div>
    );
};

export default Login;