import React from "react";
import { Link } from "react-router-dom";

const userId = localStorage.getItem("userId");


const Header: React.FC = () => (
    <header
        style={{
            width: "100%",
            background: "#222",
            color: "#fff",
            padding: "1rem 0",
            fontSize: "1.5rem",
            letterSpacing: "1px",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
        }}
    >
        <span style={{ marginLeft: "1.5rem" }}>Corporate Task Generator</span>
        <nav style={{ marginRight: "1.5rem" }}>
            <Link
                to="/"
                style={{
                    color: "#fff",
                    textDecoration: "none",
                    marginLeft: "1.5rem",
                    fontSize: "1rem",
                }}
            >
                Login
            </Link>
            <Link
                to="/create-user"
                style={{
                    color: "#fff",
                    textDecoration: "none",
                    marginLeft: "1.5rem",
                    fontSize: "1rem",
                }}
            >
                Create User
            </Link>

            {userId != "" &&
                <>
                    <Link
                        to="/create-task"
                        style={{
                            color: "#fff",
                            textDecoration: "none",
                            marginLeft: "1.5rem",
                            fontSize: "1rem",
                        }}
                    >
                        Create Task
                    </Link>
                    <Link
                        to="/task-table"
                        style={{
                            color: "#fff",
                            textDecoration: "none",
                            marginLeft: "1.5rem",
                            fontSize: "1rem",
                        }}
                    >
                        Tasks
                    </Link></>
            }
        </nav>
    </header>
);

export default Header;