const API_BASE_URL = "http://localhost:3000";
const WS_URL = "ws://localhost:3000/ws/todos";

let socket;
let isConnecting = false;
let messageQueue = [];
let todosFetchCallback;

  const initWebSocket = () => {
    if (isConnecting) return;

    isConnecting = true;
    socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      isConnecting = false;
      while (messageQueue.length > 0) {
        const message = messageQueue.shift();
        sendMessage(message);
      }
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "todos" && todosFetchCallback) {
          todosFetchCallback(message.data);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      isConnecting = false;
    };

    socket.onclose = () => {
      isConnecting = false;
      setTimeout(initWebSocket, 5000);
    };
  };

  const sendMessage = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      messageQueue.push(message);
      if (!socket || socket.readyState === WebSocket.CLOSED) {
        initWebSocket();
      }
    }
  };

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "failed to fetch");
  }
  return response;
};
const handleAuthResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Authentication failed");
  }
  return response;
};
export const api = {
  fetchUser: () =>
    fetch(`${API_BASE_URL}/auth/user`, { credentials: "include" }).then(
      handleResponse
    ),

  fetchCategories: () =>
    fetch(`${API_BASE_URL}/categories/custom-categories`, {
      credentials: "include",
    }).then(handleResponse),

  fetchTodos: (userId, callback) => {
    todosFetchCallback = callback;
    sendMessage({ type: "fetchTodos", userId });
  },

  closeWebSocket: () => {
    if (socket) {
      socket.close();
    }
  },

  addTodo: (todoData) =>
    fetch(`${API_BASE_URL}/todo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(todoData),
    }).then(handleResponse),
  deleteAllTodos: () =>
    fetch(`${API_BASE_URL}/todo/all`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }),
  saveCategory: (category) =>
    fetch(`${API_BASE_URL}/categories/custom-categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ category }),
    }).then(handleResponse),
  updateTodo: (todoId, todoData) =>
    fetch(`${API_BASE_URL}/todo/${todoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(todoData),
    }).then(handleResponse),
  deleteAllCategories: () =>
    fetch(`${API_BASE_URL}/categories/custom-categories`, {
      method: "DELETE",
      credentials: "include",
    }),
  deleteTodo: (todoId) =>
    fetch(`${API_BASE_URL}/todo/${todoId}`, {
      method: "DELETE",
      credentials: "include",
    }).then(handleResponse),

  logout: () =>
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).then(handleResponse),
  login: (username, password) =>
    fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    }).then(handleAuthResponse),
  register: (username, password) =>
    fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    }).then(handleAuthResponse),
};
initWebSocket();
