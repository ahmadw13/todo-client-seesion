// src/components/Settings.jsx
import { useEffect, useState, useRef } from "react";
import "../styles/settingsStyles.css";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { toast } from "react-toastify";

const Settings = () => {
  const [customCategories, setCustomCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const handleRestoreButtonClick = () => {
    fileInputRef.current.click();
  };
  const handleMainClick = () => {
    navigate("/main");
  };
  useEffect(() => {
    loadCategoriesSettings();
  }, []);
  const handleBackup = async () => {
    try {
      const todosResponse = await api.fetchTodos();
      const categoriesResponse = await api.fetchCategories();

      if (!todosResponse.ok || !categoriesResponse.ok) {
        throw new Error("Failed to fetch todos or categories");
      }

      const todos = await todosResponse.json();
      const categories = await categoriesResponse.json();

      const backupData = {
        todos,
        categories,
      };

      const blob = new Blob([JSON.stringify(backupData)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "backup.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Backup downloaded successfully!");
    } catch (error) {
      toast.error(`Error during backup: ${error.message}`);
    }
  };

  const loadCategoriesSettings = async () => {
    try {
      const response = await api.fetchCategories();

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch custom categories"
        );
      }

      const data = await response.json();
      setCustomCategories(data);
    } catch (error) {
      toast.error(`Error loading categories: ${error.message}`);
    }
  };
  const handleSaveCategory = (e) => {
    e.preventDefault();
    localStorage.setItem("selectedCategory", selectedCategory);
    toast("Category saved successfully!");
  };

  const handleAddCustomCategory = async () => {
    if (customCategoryInput.trim()) {
      try {
        await saveCustomCategoryToDatabase(customCategoryInput);
        setCustomCategoryInput("");
        await loadCategoriesSettings();
        toast.success(`Custom category "${customCategoryInput}" added!`);
      } catch (error) {
        toast.error(`Error adding custom category: ${error.message}`);
      }
    } else {
      toast.warning("Please enter a custom category.");
    }
  };
  const handleRestore = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      toast.warning("Please select a file to restore.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const backupData = JSON.parse(e.target.result);

        for (const todo of backupData.todos) {
          await api.addTodo(todo);
        }

        for (const category of backupData.categories) {
          await api.saveCategory(category.category_name);
        }

        toast.success("Data restored successfully!");
      } catch (error) {
        toast.error(`Error restoring data: ${error.message}`);
      }
    };
    reader.readAsText(file);
  };

  const saveCustomCategoryToDatabase = async (category) => {
    try {
      const response = await api.saveCategory(category);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save custom category");
      }
    } catch (error) {
      throw new Error(error.message || "Error saving custom category");
    }
  };
  const handleDeleteAllTodos = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete all todos? This action cannot be undone."
    );
    if (confirmed) {
      try {
        const response = await api.deleteAllTodos();

        if (response.ok) {
          toast("All todos deleted successfully.");
        } else {
          const errorData = await response.json();
          toast(errorData.error || "Failed to delete todos.");
        }
      } catch (error) {
        toast.error("Error deleting all todos:", error);
      }
    }
  };

  const handleDeleteAllCategories = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete all custom categories? This action cannot be undone."
    );
    if (confirmed) {
      try {
        const response = await api.deleteAllCategories();

        if (response.ok) {
          toast("All custom categories deleted successfully.");
          loadCategoriesSettings();
        } else {
          const errorData = await response.json();
          toast(errorData.error || "Failed to delete custom categories.");
        }
      } catch (error) {
        toast.error("Error deleting custom categories:", error);
      }
    }
  };

  return (
    <div>
      <nav id="navbar">
        <h2>Todo App Settings</h2>
      </nav>
      <div id="sidebar">
        <button id="home-btn" className="sidebar-btn" onClick={handleMainClick}>
          Home
        </button>
      </div>
      <div id="main-content">
        <h1>Settings</h1>
        <form id="category-form" onSubmit={handleSaveCategory}>
          <label htmlFor="todo-category">Select Category To Sort By:</label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All Categories">All Categories</option>
            {customCategories.map((category) => (
              <option key={category.id} value={category.category_name}>
                {category.category_name}
              </option>
            ))}
            {["Work", "Personal", "Other"].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button type="submit">Save Category</button>
        </form>
        <p>
          Selected Category:{" "}
          <span id="selected-category">{selectedCategory}</span>
        </p>
        <div id="action-buttons">
          <button
            id="delete-all-categories-btn"
            className="danger-btn"
            onClick={handleDeleteAllCategories}
          >
            Delete All Categories
          </button>
          <button
            id="delete-all-todos-btn"
            className="danger-btn"
            onClick={handleDeleteAllTodos}
          >
            Delete All Todos
          </button>
          <button onClick={handleBackup}>Backup Todos</button>
          <button className="restore-btn" onClick={handleRestoreButtonClick}>
            Restore Data
          </button>
          <input
            type="file"
            onChange={handleRestore}
            accept=".json"
            ref={fileInputRef}
            style={{ display: "none" }}
          />
        </div>
        <div id="custom-category-container">
          <h2>Add a Custom Category</h2>
          <input
            type="text"
            id="custom-category-input"
            value={customCategoryInput}
            onChange={(e) => setCustomCategoryInput(e.target.value)}
            placeholder="Enter custom category"
          />
          <button
            type="button"
            id="add-custom-category-btn"
            onClick={handleAddCustomCategory}
          >
            Add Category
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
