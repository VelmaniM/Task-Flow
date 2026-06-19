import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaRegClock } from "react-icons/fa";
import "./TaskBoard.css";

const initialColumns = {
  "To Do": { id: "To Do", title: "To Do", taskIds: [] },
  "Inprogress": { id: "Inprogress", title: "In Progress", taskIds: [] },
  "Complete": { id: "Complete", title: "Completed", taskIds: [] }
};

const TaskBoard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState({});
  const [columns, setColumns] = useState(initialColumns);

  useEffect(() => {
    const storedUser = localStorage.getItem("taskflow_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/data?userId=${user.email}`);
      const data = res.data;
      
      const taskMap = {};
      const newColumns = JSON.parse(JSON.stringify(initialColumns)); // deep copy

      data.forEach(task => {
        taskMap[task.id] = task;
        
        let status = task.process;
        if (!newColumns[status]) status = "To Do"; // Fallback
        
        newColumns[status].taskIds.push(task.id);
      });

      setTasks(taskMap);
      setColumns(newColumns);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  const isOverdue = (createdDate, status) => {
    if (status === "Complete" || !createdDate) return false;
    return new Date(createdDate) < new Date(new Date().toDateString());
  };

  const isNewTask = (createdStr) => {
    if (!createdStr) return false;
    const createdDate = new Date(createdStr);
    const now = new Date();
    const diffHours = (now - createdDate) / (1000 * 60 * 60);
    return diffHours < 2;
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const startColumn = columns[source.droppableId];
    const finishColumn = columns[destination.droppableId];

    // Moving within the same column
    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...startColumn, taskIds: newTaskIds };
      setColumns({ ...columns, [newColumn.id]: newColumn });
      return;
    }

    // Moving to a different column
    const startTaskIds = Array.from(startColumn.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = { ...startColumn, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finishColumn.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finishColumn, taskIds: finishTaskIds };

    setColumns({
      ...columns,
      [newStart.id]: newStart,
      [newFinish.id]: newFinish
    });

    // Update backend
    const newStatus = finishColumn.id;
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/data/${draggableId}`, { process: newStatus });
      setTasks(prev => ({
        ...prev,
        [draggableId]: { ...prev[draggableId], process: newStatus }
      }));
    } catch (err) {
      console.error("Failed to update status on drag", err);
      fetchTasks(); // revert on fail
    }
  };

  return (
    <div className="board-container">
      <div className="board-header">
        <h1>Task Board</h1>
        <p>Use this board to visually track your tasks as they move through different stages of completion. Drag and drop cards between columns to update their status instantly.</p>
      </div>

      <div className="board-columns">
        <DragDropContext onDragEnd={onDragEnd}>
          {Object.values(columns).map(column => (
            <div className="board-column" key={column.id}>
              <div className="column-header">
                <h3>{column.title}</h3>
                <span className="task-count">{column.taskIds.length}</span>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    className={`task-list-droppable ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {column.taskIds.map((taskId, index) => {
                      const task = tasks[taskId];
                      if (!task) return null;
                      const overdue = isOverdue(task.createdDate, task.process);
                      
                      return (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              className={`task-card status-${task.process ? task.process.replace(" ", "-") : "To-Do"}`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.9 : 1
                              }}
                              onClick={() => navigate(`/update/${task.id}`)}
                            >
                              <div className="task-card-header">
                                <h4 className="task-card-title">
                                  {task.taskname}
                                  {task.process === "To Do" && isNewTask(task.created) && (
                                    <span className="new-badge">NEW</span>
                                  )}
                                </h4>
                                <span className={`badge priority-${task.priority?.toLowerCase() || 'low'}`} style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem" }}>
                                  {task.priority || "Low"}
                                </span>
                              </div>
                              <p className="task-card-desc">{task.description}</p>
                              
                              <div className="task-card-footer" style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                                {task.tag && (
                                  <span className="task-tag" style={{backgroundColor: "rgba(99, 102, 241, 0.1)", color: "var(--primary-color)", padding: "0.2rem 0.5rem", borderRadius: "12px", fontSize: "0.7rem", fontWeight: "600"}}>
                                    {task.tag}
                                  </span>
                                )}
                                  <span className={`task-card-date ${overdue ? 'overdue' : ''}`} style={overdue ? {color: "var(--danger-color)", fontWeight: "bold"} : {}}>
                                    <FaRegClock style={{marginRight: "4px"}} />
                                    {task.createdDate ? (overdue ? `${task.createdDate} (Overdue)` : task.createdDate) : "No date"}
                                  </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                    {column.taskIds.length === 0 && (
                      <div className="empty-column">No tasks here</div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </DragDropContext>
      </div>
    </div>
  );
};

export default TaskBoard;
