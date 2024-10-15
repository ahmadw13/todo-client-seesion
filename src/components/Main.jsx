import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Main.module.css";
import { toast } from "react-toastify";
import { api } from "../services/api";

const Main = () => {
  const [displayUsername, setDisplayUsername] = useState("");
  const [todos, setTodos] = useState([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentTodo, setCurrentTodo] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const navigate = useNavigate();
  useEffect(() => {
    const webSocket = new WebSocket("ws://localhost:3000/ws/todos");

    webSocket.onopen = () => {
      webSocket.send(JSON.stringify({ type: "fetchTodos" }));
    };

    webSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "todos") {
        const validTodos = data.data.filter((todo) => todo && todo.title);
        setTodos(validTodos);
      }
    };

    webSocket.onclose = () => {};
    return () => {
      webSocket.close();
    };
  }, []);
  useEffect(() => {}, [todos]);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await api.fetchUser();
        if (response.ok) {
          const user = await response.json();
          setDisplayUsername(`Welcome, ${user.username}`);
        } else {
          toast.error("Failed to fetch user details.");
        }
      } catch (error) {
        toast.error("Error fetching user details:", error);
      }
    };

    const loadCategories = async () => {
      try {
        const response = await api.fetchCategories();
        const customCategories = await response.json();
        const defaultCategories = ["Work", "Personal", "Other"];
        const allCategories = [
          ...customCategories.map((category) => category.category_name),
          ...defaultCategories,
        ];
        setCategories(allCategories);
      } catch (error) {
        toast.error("Error loading categories:", error);
      }
    };

    loadCategories();
    fetchUsername();
  }, []);

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const handleLogout = async () => {
    try {
      const response = await api.logout();
      if (response.ok) {
        navigate("/");
      } else {
        toast.error("Failed to log out.");
      }
    } catch (error) {
      toast.error("Error during logout:", error);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    const title = e.target.todoTitle.value;
    const description = e.target.todoDescription.value;
    const dateTime = e.target.todoDateTime.value;
    const category = e.target.todoCategory.value;

    try {
      const response = await api.addTodo({
        title,
        description,
        date_time: dateTime,
        category,
      });
      if (response.ok) {
        const newTodo = await response.json();
        setTodos((prevTodos) => [...prevTodos, newTodo]);
        e.target.reset();
        toast.success("Todo added successfully");
      } else {
        throw new Error("Failed to add todo");
      }
    } catch (error) {
      toast.error(error.message || "Error adding todo");
    }
  };

  useEffect(() => {
    const savedCategory = localStorage.getItem("selectedCategory");
    if (savedCategory) {
      setSelectedCategory(savedCategory);
    }
  }, []);

  const handleEditTodo = (todo) => {
    setCurrentTodo(todo);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      await api.deleteTodo(todoId);
      setTodos(todos.filter((todo) => todo.id !== todoId));
    } catch (error) {
      toast.error("Error deleting todo:", error);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    const updatedTodo = {
      ...currentTodo,
      title: e.target.editTitle.value,
      description: e.target.editDescription.value,
      date_time: e.target.editDate.value,
      category: e.target.editCategory.value,
    };

    try {
      const response = await api.updateTodo(currentTodo.id, updatedTodo);
      if (response.ok) {
        const updatedTodoData = await response.json();
        setTodos((prevTodos) =>
          prevTodos.map((todo) =>
            todo.id === currentTodo.id ? updatedTodoData : todo
          )
        );
        setIsEditDialogOpen(false);
        setCurrentTodo(null);
        toast.success("Todo updated successfully");
      } else {
        throw new Error("Failed to update todo");
      }
    } catch (error) {
      toast.error(error.message || "Error updating todo");
    }
  };

  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredTodos = todos.filter((todo) => {
    const matchesSearch = todo.title.toLowerCase().includes(searchTerm);
    const matchesCategory =
      selectedCategory === "All Categories" ||
      todo.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <nav id={styles.navbar}>
        <h2>Todo App</h2>
        <input
          type="text"
          id="search-input"
          placeholder="Search todos..."
          onChange={handleSearchInput}
          value={searchTerm}
        />
        <span id={styles.usernameDisplay}>{displayUsername}</span>
      </nav>
      <div id={styles.contentWrapper}>
        <div id={styles.sidebar}>
          <button className={styles.sidebarBtn} onClick={handleSettingsClick}>
            Settings
          </button>
          <button
            id="logout-button"
            className={styles.sidebarBtn}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
        <div id={styles.mainContent} key={todos.length}>
          <h1>Todo List</h1>
          <p>Sorting by: {selectedCategory}</p>
          <form id="todo-form" onSubmit={handleAddTodo}>
            <input
              type="text"
              name="todoTitle"
              placeholder="Enter todo title"
              required
            />
            <textarea
              name="todoDescription"
              placeholder="Enter todo description"
              required
            />
            <input type="datetime-local" name="todoDateTime" required />
            <select name="todoCategory" required>
              <option value="">Select a category</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <button type="submit">Add Todo</button>
          </form>
          <div className={styles.todoList}>
            {filteredTodos.length > 0 ? (
              filteredTodos.map((todo) => {
                if (!todo || !todo.title) return null; // Check if todo and title exist
                return (
                  <section className={styles.todoItem} key={todo.id}>
                    <h3>{todo.title}</h3>
                    <p>{todo.description}</p>
                    <time dateTime={new Date(todo.date_time).toISOString()}>
                      {new Date(todo.date_time).toLocaleString()}
                    </time>
                    <p>
                      <strong>Category:</strong> {todo.category}
                    </p>
                    <div className="buttons-container">
                      <button
                        className="edit-btn"
                        onClick={() => handleEditTodo(todo)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-todo-btn"
                        onClick={() => handleDeleteTodo(todo.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </section>
                );
              })
            ) : (
              <p>No todos available.</p> // Fallback message
            )}
          </div>
        </div>
      </div>
      {isEditDialogOpen && (
        <dialog className={styles.dialog} open>
          <form id="editForm" onSubmit={handleSaveChanges}>
            <label htmlFor="editTitle">Title:</label>
            <input
              type="text"
              id="editTitle"
              name="editTitle"
              defaultValue={currentTodo?.title}
              required
            />
            <label htmlFor="editDescription">Description:</label>
            <textarea
              id="editDescription"
              name="editDescription"
              defaultValue={currentTodo?.description}
              required
            />
            <label htmlFor="editDate">Date:</label>
            <input
              type="datetime-local"
              id="editDate"
              name="editDate"
              defaultValue={new Date(currentTodo?.date_time)
                .toISOString()
                .slice(0, 16)}
              required
            />
            <label htmlFor="editCategory">Category:</label>
            <select
              id="editCategory"
              name="editCategory"
              defaultValue={currentTodo?.category}
              required
            >
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default Main;
