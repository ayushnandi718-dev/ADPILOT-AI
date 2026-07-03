"use client";

import { useState, useMemo, type ComponentType } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Info,
  ArrowRight,
  Clock,
} from "lucide-react";
import { mockNotifications } from "@/mock/notifications";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const typeConfig: Record<string, { icon: ComponentType<{ className?: string }>; color: string; bg: string }> = {
  success: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  error: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  warning: {
    icon: AlertCircle,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  info: {
    icon: Info,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  recommendation: {
    icon: Lightbulb,
    color: "text-[#A78BFA]",
    bg: "bg-[#7C3AED]/10",
  },
};

type FilterType = "all" | "success" | "warning" | "error" | "recommendation" | "info";

const filterTabs: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Success", value: "success" },
  { label: "Warning", value: "warning" },
  { label: "Error", value: "error" },
  { label: "Recommendations", value: "recommendation" },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredNotifications = useMemo(() => {
    if (filter === "all") return notifications;
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, typeof notifications> = {};
    filteredNotifications.forEach((n) => {
      const date = new Date(n.createdAt).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(n);
    });
    return groups;
  }, [filteredNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  function handleMarkAllRead() {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
  }

  function handleMarkRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      )
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
    >
      <motion.div
        variants={fadeInUp}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Stay updated with campaign alerts, milestones, and recommendations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass rounded-lg px-3 py-1.5 text-xs text-[#9CA3AF] flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5" />
            {unreadCount} unread
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        className="glass rounded-xl p-1.5 flex items-center gap-1 overflow-x-auto"
      >
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
              filter === tab.value
                ? "bg-[#7C3AED] text-white shadow-sm"
                : "text-[#9CA3AF] hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      <motion.div variants={staggerContainer} className="space-y-6">
        {Object.entries(groupedByDate).map(([date, items]) => (
          <motion.div key={date} variants={fadeInUp}>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-3.5 w-3.5 text-[#6B7280]" />
              <h3 className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                {date}
              </h3>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="space-y-2">
              {items.map((notification) => {
                const config = typeConfig[notification.type];
                const Icon = config.icon;
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "glass rounded-xl p-4 flex items-start gap-4 transition-all hover:bg-white/[0.04]",
                      !notification.isRead && "border-l-2 border-l-[#7C3AED]"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
                        config.bg
                      )}
                    >
                      <Icon className={cn("h-5 w-5", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4
                              className={cn(
                                "text-sm font-medium",
                                notification.isRead
                                  ? "text-white"
                                  : "text-white"
                              )}
                            >
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="h-2 w-2 rounded-full bg-[#7C3AED] shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-[#9CA3AF] mt-0.5">
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-[#6B7280] whitespace-nowrap">
                            {formatRelativeTime(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkRead(notification.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white/5 text-[#6B7280] hover:text-white transition-colors"
                            >
                              <CheckCheck className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      {notification.link && (
                        <a
                          href={notification.link}
                          className="inline-flex items-center gap-1 text-xs text-[#7C3AED] hover:text-[#A78BFA] mt-2 transition-colors"
                        >
                          View details
                          <ArrowRight className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredNotifications.length === 0 && (
        <motion.div
          variants={fadeInUp}
          className="glass rounded-xl p-12 text-center"
        >
          <Bell className="h-12 w-12 text-[#6B7280] mx-auto mb-4" />
          <p className="text-lg font-medium text-white mb-1">
            No notifications
          </p>
          <p className="text-sm text-[#9CA3AF]">
            {filter === "all"
              ? "You're all caught up! New notifications will appear here."
              : `No ${filter} notifications to show.`}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
