import React, { useEffect, useMemo, useState } from "react";
import { Task } from "../../models/Task";
import TaskCard from "./TaskCard";
import { Modal, Alert } from "react-bootstrap";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
} from "@tanstack/react-table";
import {
    Table,
    Form,
    Button,
    Spinner,
    Pagination,
    Container,
    Row,
    Col,
} from "react-bootstrap";

const PAGE_SIZE = 5;

const TaskTable: React.FC = () => {
    const [data, setData] = useState<Task[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const fetchTasks = async () => {
        setMessage("");

        setLoading(true);
        const sortBy = sorting[0]?.id ?? "";
        const sortDir = sorting[0]?.desc ? "desc" : "asc";

        const queryParams = new URLSearchParams({
            page: (pageIndex + 1).toString(),
            pageSize: PAGE_SIZE.toString(),
            sortBy,
            sortDir,
            search,
        });

        //const token = localStorage.getItem("jwt");
        const res = await fetch(`/api/task?${queryParams}`, {
            method: "GET"//,
            //headers: token ? {
            //    Authorization: `Bearer ${token}`
            //} : {},
        });
        const json = await res.json();
        setData(json.tasks);
        setTotalCount(json.total);
        setLoading(false);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        const token = localStorage.getItem("jwt");
        const res = await fetch(`/api/task/${id}`, {
            method: "DELETE"//,
            //headers: token ? {
            //    Authorization: `Bearer ${token}`
            //} : {},
        });
        if (res.ok) {
            fetchTasks();
            fetchStatusSummary();
            setMessage("Task deleted successfully!");
        }
    };

    const fetchStatusSummary = async () => {
        const token = localStorage.getItem("jwt");
        const res = await fetch("/api/task/status-summary", {
            //headers: token
            //    ? {
            //          Authorization: `Bearer ${token}`
            //      }
            //    : {},
        });
        const data = await res.json();
        setStatusSummary(data);
    };

    useEffect(() => {
        fetchTasks();
    }, [pageIndex, sorting, search]);

    const columns = useMemo<ColumnDef<Task>[]>(
        () => [
            {
                accessorKey: "title",
                header: ({ column }) => (
                    <Button
                        variant="link"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Title {column.getIsSorted() ? (column.getIsSorted() === "asc" ? "↑" : "↓") : ""}
                    </Button>
                ),
            },
            {
                accessorKey: "priority",
                header: ({ column }) => (
                    <Button
                        variant="link"
                        onClick={() => column.toggleSorting()}
                    >
                        Priority {column.getIsSorted() ? (column.getIsSorted() === "asc" ? "↑" : "↓") : ""}
                    </Button>
                ),
            },
            {
                accessorKey: "dueDate",
                header: ({ column }) => (
                    <Button
                        variant="link"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Due Date {column.getIsSorted() ? (column.getIsSorted() === "asc" ? "↑" : "↓") : ""}
                    </Button>
                ),
                cell: ({ getValue }) =>
                    new Date(getValue() as string).toLocaleDateString(),
            },
            {
                accessorKey: "status",
                header: ({ column }) => (
                    <Button
                        variant="link"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Status {column.getIsSorted() ? (column.getIsSorted() === "asc" ? "↑" : "↓") : ""}
                    </Button>
                ),
            },
            {
                accessorKey: "description",
                header: "Description",
                cell: ({ getValue }) => getValue() || "-",
            },
            {
                accessorKey: "userId",
                header: "User ID",
                cell: ({ getValue }) => getValue() ?? "-",
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => (
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row.original.id);
                        }}
                    >
                        Delete
                    </Button>
                ),
            },
        ],
        []
    );

    const table = useReactTable({
        data,
        columns,
        pageCount: Math.ceil(totalCount / PAGE_SIZE),
        state: {
            pagination: { pageIndex, pageSize: PAGE_SIZE },
            sorting,
        },
        manualPagination: true,
        manualSorting: true,
        onPaginationChange: (updater) => {
            const next =
                typeof updater === "function"
                    ? updater({ pageIndex, pageSize: PAGE_SIZE })
                    : updater;
            setPageIndex(next.pageIndex);
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
    });

    Chart.register(ArcElement, Tooltip, Legend);

    const [statusSummary, setStatusSummary] = useState<{ status: string, count: number }[]>([]);

    useEffect(() => {
        fetchStatusSummary();
    }, []);

    const pieData = {
        labels: statusSummary.map(s => s.status),
        datasets: [
            {
                data: statusSummary.map(s => s.count),
                backgroundColor: ["#f39c12", "#3498db", "#2ecc71", "#95a5a6"],
            },
        ],
    };

    return (
        <Container className="py-4">
            <h2 className="mb-4">Tasks</h2>

            {statusSummary.length > 0 && (
                <div style={{ maxWidth: 400, margin: "0 auto 2rem auto" }}>
                    <Pie data={pieData} />
                </div>
            )}

            <Form.Control
                type="text"
                placeholder="Search tasks by Title or Description..."
                className="mb-3"
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setPageIndex(0);
                }}
            />
            {message && <Alert variant={message.startsWith("Error") ? "danger" : "success"}>{message}</Alert>}

            {loading ? (
                <div className="text-center my-4">
                    <Spinner animation="border" />
                </div>
            ) : (
                <>
                    <Table striped bordered hover responsive>
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        setSelectedTask(row.original);
                                        setShowModal(true);
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length} className="text-center">
                                        No tasks found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>

                    <Row className="align-items-center justify-content-between">
                        <Col xs="auto">
                            Page {pageIndex + 1} of {Math.ceil(totalCount / PAGE_SIZE)}
                        </Col>
                        <Col xs="auto">
                            <Pagination>
                                <Pagination.Prev
                                    onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
                                    disabled={pageIndex === 0}
                                />
                                <Pagination.Next
                                    onClick={() =>
                                        setPageIndex((p) =>
                                            (p + 1) * PAGE_SIZE < totalCount ? p + 1 : p
                                        )
                                    }
                                    disabled={(pageIndex + 1) * PAGE_SIZE >= totalCount}
                                />
                            </Pagination>
                        </Col>
                    </Row>
                </>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Task Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedTask && (
                        <TaskCard
                            task={selectedTask}
                            onUpdate={() => {
                                setShowModal(false);
                                fetchTasks();
                                fetchStatusSummary();
                            }}
                        />
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default TaskTable;