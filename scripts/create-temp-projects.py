import os

root_dir = "/home/hahuy/projects/react-of-titan/temp-projects"

# Helper to write files
def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"[+] Created: {path}")

# ==========================================
# 1. E-COMMERCE SKELETON
# ==========================================
def create_ecommerce():
    base = os.path.join(root_dir, "ecommerce")
    
    # README
    write_file(os.path.join(base, "README.md"), """
# E-commerce Architecture Demo
Demonstrates Feature-Based React architecture for a shopping application.

## Structure
- **shared/components/ui/ProductCard**: Reusable presentation component.
- **features/product-catalog**: Domain logic for loading and displaying product list.
- **features/shopping-cart**: Domain logic for managing items added to cart.
- **pages/Catalog & Cart**: Composes the feature sections.
""")

    # Shared UI
    write_file(os.path.join(base, "src/shared/components/ui/ProductCard/ProductCard.tsx"), """
import { Button } from "@/shared/components/ui/Button/Button";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <Button onClick={() => onAddToCart(product)}>Add to Cart</Button>
    </div>
  );
}
export default ProductCard;
""")

    # Catalog Feature
    write_file(os.path.join(base, "src/features/product-catalog/types/product.types.ts"), """
export interface Product {
  id: string;
  name: string;
  price: number;
}
""")
    write_file(os.path.join(base, "src/features/product-catalog/hooks/useProducts.ts"), """
import { useState, useEffect } from "react";
import type { Product } from "../types/product.types";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch
    setTimeout(() => {
      setProducts([
        { id: "1", name: "Titan Laptop", price: 1299 },
        { id: "2", name: "Titan Mouse", price: 49 },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  return { products, isLoading };
}
""")
    write_file(os.path.join(base, "src/features/product-catalog/components/ProductList/ProductList.tsx"), """
import type { Product } from "../../types/product.types";
import { ProductCard } from "@/shared/components/ui/ProductCard/ProductCard";

interface ProductListProps {
  products: Product[];
  onAddToCart: (p: Product) => void;
}

export function ProductList({ products, onAddToCart }: ProductListProps) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}
export default ProductList;
""")
    write_file(os.path.join(base, "src/features/product-catalog/index.tsx"), """
import { useProducts } from "./hooks/useProducts";
import { ProductList } from "./components/ProductList/ProductList";
import type { Product } from "./types/product.types";

interface ProductCatalogProps {
  onAddToCart: (p: Product) => void;
}

export function ProductCatalogSection({ onAddToCart }: ProductCatalogProps) {
  const { products, isLoading } = useProducts();

  if (isLoading) return <div>Loading catalog...</div>;

  return (
    <section className="catalog-section">
      <h2>Products</h2>
      <ProductList products={products} onAddToCart={onAddToCart} />
    </section>
  );
}
export default ProductCatalogSection;
""")

    # Cart Feature
    write_file(os.path.join(base, "src/features/shopping-cart/types/cart.types.ts"), """
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}
""")
    write_file(os.path.join(base, "src/features/shopping-cart/hooks/useCart.ts"), """
import { useState, useCallback } from "react";
import type { CartItem } from "../types/cart.types";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((product: { id: string; name: string; price: number }) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  return { items, addToCart };
}
""")
    write_file(os.path.join(base, "src/features/shopping-cart/components/CartItems/CartItems.tsx"), """
import type { CartItem } from "../../types/cart.types";

interface CartItemsProps {
  items: CartItem[];
}

export function CartItems({ items }: CartItemsProps) {
  if (items.length === 0) return <p>Your cart is empty.</p>;

  return (
    <ul className="cart-list">
      {items.map((item) => (
        <li key={item.id}>
          {item.name} - ${item.price} x {item.quantity}
        </li>
      ))}
    </ul>
  );
}
export default CartItems;
""")
    write_file(os.path.join(base, "src/features/shopping-cart/index.tsx"), """
import { CartItems } from "./components/CartItems/CartItems";
import { useCart } from "./hooks/useCart";

export function CartSection() {
  const { items } = useCart();

  return (
    <section className="cart-section">
      <h2>Shopping Cart</h2>
      <CartItems items={items} />
    </section>
  );
}
export default CartSection;
""")

    # Pages & Router
    write_file(os.path.join(base, "src/pages/Catalog/CatalogPage.tsx"), """
import { ProductCatalogSection } from "@/features/product-catalog";
import { CartSection } from "@/features/shopping-cart";

export function CatalogPage() {
  // Demo handles passing handlers between features at page level
  const handleAdd = (p: any) => console.log("Added:", p);

  return (
    <div className="catalog-page">
      <h1>Titan Store</h1>
      <ProductCatalogSection onAddToCart={handleAdd} />
      <CartSection />
    </div>
  );
}
export default CatalogPage;
""")

    write_file(os.path.join(base, "src/app/router.tsx"), """
import { createBrowserRouter } from "react-router";
import { CatalogPage } from "@/pages/Catalog/CatalogPage";

export const router = createBrowserRouter([
  { path: "/store", element: <CatalogPage /> }
]);
""")

# ==========================================
# 2. CHAT APP SKELETON
# ==========================================
def create_chat():
    base = os.path.join(root_dir, "chat-app")
    
    # README
    write_file(os.path.join(base, "README.md"), """
# Chat App Architecture Demo
Demonstrates Feature-Based React architecture for a real-time messaging application.

## Structure
- **features/chat-rooms**: Manages room navigation and selection.
- **features/message-feed**: Handles loading, typing, and sending messages.
- **pages/Chat**: Integrates the room list sidebar with the message box.
""")

    # Chat Rooms Feature
    write_file(os.path.join(base, "src/features/chat-rooms/types/room.types.ts"), """
export interface Room {
  id: string;
  name: string;
}
""")
    write_file(os.path.join(base, "src/features/chat-rooms/hooks/useRooms.ts"), """
import { useState } from "react";
import type { Room } from "../types/room.types";

export function useRooms() {
  const [rooms] = useState<Room[]>([
    { id: "general", name: "# general-chat" },
    { id: "random", name: "# random-talk" },
  ]);
  return { rooms };
}
""")
    write_file(os.path.join(base, "src/features/chat-rooms/components/RoomList/RoomList.tsx"), """
import type { Room } from "../../types/room.types";

interface RoomListProps {
  rooms: Room[];
  activeId: string;
  onSelectRoom: (id: string) => void;
}

export function RoomList({ rooms, activeId, onSelectRoom }: RoomListProps) {
  return (
    <div className="room-list">
      {rooms.map((room) => (
        <button
          key={room.id}
          className={room.id === activeId ? "active" : ""}
          onClick={() => onSelectRoom(room.id)}
        >
          {room.name}
        </button>
      ))}
    </div>
  );
}
export default RoomList;
""")
    write_file(os.path.join(base, "src/features/chat-rooms/index.tsx"), """
import { RoomList } from "./components/RoomList/RoomList";
import { useRooms } from "./hooks/useRooms";

interface ChatRoomsProps {
  activeRoomId: string;
  onSelectRoom: (id: string) => void;
}

export function ChatRoomsSection({ activeRoomId, onSelectRoom }: ChatRoomsProps) {
  const { rooms } = useRooms();

  return (
    <aside className="chat-rooms-sidebar">
      <h3>Channels</h3>
      <RoomList rooms={rooms} activeId={activeRoomId} onSelectRoom={onSelectRoom} />
    </aside>
  );
}
export default ChatRoomsSection;
""")

    # Message Feed Feature
    write_file(os.path.join(base, "src/features/message-feed/types/message.types.ts"), """
export interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
}
""")
    write_file(os.path.join(base, "src/features/message-feed/hooks/useMessages.ts"), """
import { useState, useEffect } from "react";
import type { Message } from "../types/message.types";

export function useMessages(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Seed sample messages for active room
    setMessages([
      { id: "1", text: `Welcome to ${roomId}!`, sender: "System", timestamp: "12:00" },
    ]);
  }, [roomId]);

  const sendMessage = (text: string) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: "Me",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  return { messages, sendMessage };
}
""")
    write_file(os.path.join(base, "src/features/message-feed/components/MessageList/MessageList.tsx"), """
import type { Message } from "../../types/message.types";

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="message-list">
      {messages.map((msg) => (
        <div key={msg.id} className="message-item">
          <strong>{msg.sender}:</strong> <span>{msg.text}</span>
          <small>{msg.timestamp}</small>
        </div>
      ))}
    </div>
  );
}
export default MessageList;
""")
    write_file(os.path.join(base, "src/features/message-feed/index.tsx"), """
import { MessageList } from "./components/MessageList/MessageList";
import { useMessages } from "./hooks/useMessages";
import { useState } from "react";

interface MessageFeedProps {
  roomId: string;
}

export function MessageFeedSection({ roomId }: MessageFeedProps) {
  const { messages, sendMessage } = useMessages(roomId);
  const [text, setText] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText("");
  };

  return (
    <div className="message-feed-area">
      <MessageList messages={messages} />
      <form onSubmit={handleSend} className="message-input-form">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
export default MessageFeedSection;
""")

    # Page & Router
    write_file(os.path.join(base, "src/pages/Chat/ChatPage.tsx"), """
import { useState } from "react";
import { ChatRoomsSection } from "@/features/chat-rooms";
import { MessageFeedSection } from "@/features/message-feed";

export function ChatPage() {
  const [activeRoom, setActiveRoom] = useState("general");

  return (
    <div className="chat-layout" style={{ display: "flex", gap: "1rem" }}>
      <ChatRoomsSection activeRoomId={activeRoom} onSelectRoom={setActiveRoom} />
      <MessageFeedSection roomId={activeRoom} />
    </div>
  );
}
export default ChatPage;
""")

    write_file(os.path.join(base, "src/app/router.tsx"), """
import { createBrowserRouter } from "react-router";
import { ChatPage } from "@/pages/Chat/ChatPage";

export const router = createBrowserRouter([
  { path: "/chat", element: <ChatPage /> }
]);
""")

# ==========================================
# 3. KANBAN TASK MANAGER SKELETON
# ==========================================
def create_task_manager():
    base = os.path.join(root_dir, "task-manager")
    
    # README
    write_file(os.path.join(base, "README.md"), """
# Kanban Task Manager Demo
Demonstrates Feature-Based React architecture for a project board dashboard.

## Structure
- **features/task-board**: Contains columns, tasks, drag-drop board handlers.
- **features/task-history**: Lists timeline logs of task modifications.
- **pages/Board**: Composes the board grid alongside the audit log list.
""")

    # Task Board Feature
    write_file(os.path.join(base, "src/features/task-board/types/task.types.ts"), """
export interface Task {
  id: string;
  title: string;
  status: "todo" | "doing" | "done";
}
""")
    write_file(os.path.join(base, "src/features/task-board/hooks/useTasks.ts"), """
import { useState } from "react";
import type { Task } from "../types/task.types";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "Implement Auth Flow", status: "todo" },
    { id: "2", title: "Review UI CSS", status: "doing" },
  ]);

  const moveTask = (id: string, nextStatus: Task["status"]) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    );
  };

  return { tasks, moveTask };
}
""")
    write_file(os.path.join(base, "src/features/task-board/components/KanbanBoard/KanbanBoard.tsx"), """
import type { Task } from "../../types/task.types";

interface KanbanBoardProps {
  tasks: Task[];
  onMove: (id: string, status: Task["status"]) => void;
}

export function KanbanBoard({ tasks, onMove }: KanbanBoardProps) {
  const renderColumn = (colStatus: Task["status"]) => {
    const colTasks = tasks.filter((t) => t.status === colStatus);
    return (
      <div className="kanban-column">
        <h4>{colStatus.toUpperCase()}</h4>
        {colTasks.map((t) => (
          <div key={t.id} className="kanban-task-card">
            <p>{t.title}</p>
            <select value={t.status} onChange={(e) => onMove(t.id, e.target.value as any)}>
              <option value="todo">TODO</option>
              <option value="doing">DOING</option>
              <option value="done">DONE</option>
            </select>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="kanban-board" style={{ display: "flex", gap: "1rem" }}>
      {renderColumn("todo")}
      {renderColumn("doing")}
      {renderColumn("done")}
    </div>
  );
}
export default KanbanBoard;
""")
    write_file(os.path.join(base, "src/features/task-board/index.tsx"), """
import { KanbanBoard } from "./components/KanbanBoard/KanbanBoard";
import { useTasks } from "./hooks/useTasks";
import type { Task } from "./types/task.types";

interface TaskBoardProps {
  onTaskMoved?: (title: string, status: Task["status"]) => void;
}

export function TaskBoardSection({ onTaskMoved }: TaskBoardProps) {
  const { tasks, moveTask } = useTasks();

  const handleMove = (id: string, status: Task["status"]) => {
    const task = tasks.find((t) => t.id === id);
    moveTask(id, status);
    if (task && onTaskMoved) {
      onTaskMoved(task.title, status);
    }
  };

  return (
    <section className="task-board-section">
      <h2>Project Board</h2>
      <KanbanBoard tasks={tasks} onMove={handleMove} />
    </section>
  );
}
export default TaskBoardSection;
""")

    # Task History Feature
    write_file(os.path.join(base, "src/features/task-history/types/history.types.ts"), """
export interface HistoryItem {
  id: string;
  message: string;
  time: string;
}
""")
    write_file(os.path.join(base, "src/features/task-history/hooks/useHistory.ts"), """
import { useState, useCallback } from "react";
import type { HistoryItem } from "../types/history.types";

export function useHistory() {
  const [logs, setLogs] = useState<HistoryItem[]>([]);

  const addLog = useCallback((message: string) => {
    const newLog: HistoryItem = {
      id: Date.now().toString(),
      message,
      time: new Date().toLocaleTimeString(),
    };
    setLogs((prev) => [newLog, ...prev]);
  }, []);

  return { logs, addLog };
}
""")
    write_file(os.path.join(base, "src/features/task-history/components/HistoryLog/HistoryLog.tsx"), """
import type { HistoryItem } from "../../types/history.types";

interface HistoryLogProps {
  logs: HistoryItem[];
}

export function HistoryLog({ logs }: HistoryLogProps) {
  if (logs.length === 0) return <p>No logs recorded.</p>;

  return (
    <ul className="history-log">
      {logs.map((log) => (
        <li key={log.id}>
          [{log.time}] {log.message}
        </li>
      ))}
    </ul>
  );
}
export default HistoryLog;
""")
    write_file(os.path.join(base, "src/features/task-history/index.tsx"), """
import { HistoryLog } from "./components/HistoryLog/HistoryLog";
import { useHistory } from "./hooks/useHistory";

export function TaskHistorySection() {
  const { logs } = useHistory();

  return (
    <section className="task-history-section">
      <h3>Activity Logs</h3>
      <HistoryLog logs={logs} />
    </section>
  );
}
export default TaskHistorySection;
""")

    # Page & Router
    write_file(os.path.join(base, "src/pages/Board/BoardPage.tsx"), """
import { TaskBoardSection } from "@/features/task-board";
import { TaskHistorySection } from "@/features/task-history";

export function BoardPage() {
  // Demonstration of page-level state/callback piping
  const handleLog = (title: string, status: string) => {
    console.log(`Log: ${title} moved to ${status}`);
  };

  return (
    <div className="board-page">
      <h1>Task Workspace</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <TaskBoardSection onTaskMoved={handleLog} />
        <TaskHistorySection />
      </div>
    </div>
  );
}
export default BoardPage;
""")

    write_file(os.path.join(base, "src/app/router.tsx"), """
import { createBrowserRouter } from "react-router";
import { BoardPage } from "@/pages/Board/BoardPage";

export const router = createBrowserRouter([
  { path: "/kanban", element: <BoardPage /> }
]);
""")

def main():
    print(f"[*] Initializing temp directory at: {root_dir}")
    os.makedirs(root_dir, exist_ok=True)
    
    print("\n=== Generating E-commerce Demo ===")
    create_ecommerce()
    
    print("\n=== Generating Chat App Demo ===")
    create_chat()
    
    print("\n=== Generating Task Manager Demo ===")
    create_task_manager()
    
    print("\n[+] Done! Generated 3 demo projects demonstrating feature-based architecture.")

if __name__ == "__main__":
    main()
