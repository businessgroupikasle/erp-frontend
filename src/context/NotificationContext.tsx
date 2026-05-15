"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

export interface Notification {
  id: string;
  type: "success" | "warning" | "info" | "alert";
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("erp_notifications");
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse notifications", e);
      }
    }
  }, []);

  // Save to localStorage whenever notifications change
  useEffect(() => {
    localStorage.setItem("erp_notifications", JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback((notif: Omit<Notification, "id" | "time" | "read">) => {
    const newNotif: Notification = {
      ...notif,
      id: Math.random().toString(36).substring(7),
      time: "Just now",
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50)); // Keep last 50
    
    // Show toast
    toast(newNotif.title, {
      icon: "🔔",
      duration: 4000,
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("🔌 Connected to Notification System");
    });

    // Listen for POS Orders
    newSocket.on("new-order", (order: any) => {
      addNotification({
        type: "success",
        title: "New POS Order",
        message: `Invoice #${order.invoiceNum} created for ${order.totalAmount}`,
        link: `/pos/history?id=${order.id}`,
      });
      window.dispatchEvent(new CustomEvent("erp:refresh-pos-orders"));
    });

    // Listen for Franchise Orders
    newSocket.on("new-franchise-order", (order: any) => {
      addNotification({
        type: "info",
        title: "Franchise Order Placed",
        message: `Order #${order.orderNumber} received from ${order.franchise?.name || "Franchise"}`,
        link: `/franchise-orders`,
      });
      window.dispatchEvent(new CustomEvent("erp:refresh-franchise-orders"));
    });

    newSocket.on("franchise-order-updated", (order: any) => {
      addNotification({
        type: "warning",
        title: "Order Status Updated",
        message: `Order #${order.orderNumber} is now ${order.status}`,
        link: `/franchise-orders`,
      });
      window.dispatchEvent(new CustomEvent("erp:refresh-franchise-orders"));
    });

    return () => {
      newSocket.close();
    };
  }, [user, addNotification]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
