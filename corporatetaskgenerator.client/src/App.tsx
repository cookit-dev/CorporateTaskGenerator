import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Login from "./components/user/Login";
import CreateUser from "./components/user/CreateUser";
import CreateTask from "./components/tasks/CreateTask";
import TaskTable from "./components/tasks/TaskTable";

function App() {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/create-user" element={<CreateUser />} />
                <Route path="/create-task" element={<CreateTask />} />
                <Route path="/task-table" element={<TaskTable />} />
            </Routes>
        </Router>
    );
}

export default App;