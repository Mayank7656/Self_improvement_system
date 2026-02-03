import React, { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getTaskStatDelta } from "../lib/scoring";
import { ProgressLogEntry } from "../models/ProgressLog";
import { StatDelta } from "../models/Stat";

type Task = {
  id: number;
  title: string;
  category: string;
  tags: string[];
  completed: boolean;
};

type StatKey = keyof StatDelta;

const baseStats: StatDelta = {
  stamina: 72,
  skills: 64,
  intelligence: 68,
  power: 59,
  timeManagement: 70,
};

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Morning workout",
    completed: true,
    category: "fitness",
    tags: ["strength"],
  },
  {
    id: 2,
    title: "Deep work block",
    completed: false,
    category: "execution",
    tags: ["deepWork"],
  },
  {
    id: 3,
    title: "Meditation",
    completed: true,
    category: "recovery",
    tags: ["mindfulness"],
  },
  {
    id: 4,
    title: "Hydration reminders",
    completed: false,
    category: "planning",
    tags: ["collaboration"],
  },
];

const clampStat = (value: number) => Math.min(100, Math.max(0, value));

const buildTrend = (value: number) => {
  const deltas = [-8, -4, -2, 0, 3, 5, 2];
  return deltas.map((delta, index) => ({
    name: `Day ${index + 1}`,
    value: clampStat(value + delta),
  }));
};

const clampTotals = (totals: StatDelta) => ({
  stamina: clampStat(totals.stamina),
  skills: clampStat(totals.skills),
  intelligence: clampStat(totals.intelligence),
  power: clampStat(totals.power),
  timeManagement: clampStat(totals.timeManagement),
});

const addTotals = (totals: StatDelta, delta: StatDelta) =>
  clampTotals({
    stamina: totals.stamina + delta.stamina,
    skills: totals.skills + delta.skills,
    intelligence: totals.intelligence + delta.intelligence,
    power: totals.power + delta.power,
    timeManagement: totals.timeManagement + delta.timeManagement,
  });

const negateDelta = (delta: StatDelta): StatDelta => ({
  stamina: -delta.stamina,
  skills: -delta.skills,
  intelligence: -delta.intelligence,
  power: -delta.power,
  timeManagement: -delta.timeManagement,
});

const STAT_TOTALS_KEY = "self-improvement:statTotals";
const STAT_HISTORY_KEY = "self-improvement:statHistory";

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [stats, setStats] = useState<StatDelta>(() => {
    const stored = window.localStorage.getItem(STAT_TOTALS_KEY);
    if (stored) {
      return JSON.parse(stored) as StatDelta;
    }
    return initialTasks.reduce(
      (totals, task) =>
        task.completed
          ? addTotals(totals, getTaskStatDelta(task))
          : totals,
      baseStats,
    );
  });
  const [history, setHistory] = useState<ProgressLogEntry[]>(() => {
    const stored = window.localStorage.getItem(STAT_HISTORY_KEY);
    return stored ? (JSON.parse(stored) as ProgressLogEntry[]) : [];
  });

  const overviewData = useMemo(
    () => [
      { name: "Stamina", value: stats.stamina },
      { name: "Skills", value: stats.skills },
      { name: "Intelligence", value: stats.intelligence },
      { name: "Power", value: stats.power },
      { name: "Time Mgmt", value: stats.timeManagement },
    ],
    [stats],
  );

  const trendData = useMemo(
    () => ({
      stamina: buildTrend(stats.stamina),
      skills: buildTrend(stats.skills),
      intelligence: buildTrend(stats.intelligence),
      power: buildTrend(stats.power),
      timeManagement: buildTrend(stats.timeManagement),
    }),
    [stats],
  );

  const handleToggle = (taskId: number) => {
    setTasks((prev) => {
      const nextTasks = prev.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task,
      );
      const updatedTask = nextTasks.find((task) => task.id === taskId);
      if (!updatedTask) {
        return nextTasks;
      }
      const delta = getTaskStatDelta(updatedTask);
      const appliedDelta = updatedTask.completed ? delta : negateDelta(delta);
      const entry: ProgressLogEntry = {
        id: `${taskId}-${Date.now()}`,
        taskId: `${taskId}`,
        taskName: updatedTask.title,
        category: updatedTask.category,
        status: updatedTask.completed ? "completed" : "skipped",
        timestamp: new Date().toISOString(),
        statDelta: appliedDelta,
      };
      setStats((current) => addTotals(current, appliedDelta));
      setHistory((current) => [entry, ...current].slice(0, 25));
      return nextTasks;
    });
  };

  React.useEffect(() => {
    window.localStorage.setItem(
      STAT_TOTALS_KEY,
      JSON.stringify(stats),
    );
  }, [stats]);

  React.useEffect(() => {
    window.localStorage.setItem(
      STAT_HISTORY_KEY,
      JSON.stringify(history),
    );
  }, [history]);

  return (
    <div
      style={{
        display: "grid",
        gap: "24px",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        padding: "24px",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <section
        style={{
          gridColumn: "1 / -1",
          background: "#0f172a",
          color: "#f8fafc",
          borderRadius: "16px",
          padding: "20px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "22px" }}>Daily Stats Overview</h2>
        <p style={{ marginTop: "8px", color: "#cbd5f5" }}>
          Task completion updates the charts in real time.
        </p>
        <div style={{ height: "240px", marginTop: "16px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={overviewData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#cbd5f5" />
              <YAxis domain={[0, 100]} stroke="#cbd5f5" />
              <Tooltip />
              <Bar dataKey="value" fill="#60a5fa" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {(Object.keys(stats) as StatKey[]).map((key) => (
        <section
          key={key}
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "16px",
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
          }}
        >
          <h3 style={{ margin: 0, textTransform: "capitalize" }}>{key}</h3>
          <p style={{ marginTop: "4px", color: "#475569" }}>
            Current score: <strong>{stats[key]}</strong>
          </p>
          <div style={{ height: "180px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData[key]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      ))}

      <section
        style={{
          gridColumn: "1 / -1",
          background: "#f8fafc",
          borderRadius: "16px",
          padding: "20px",
        }}
        >
          <h3 style={{ margin: 0 }}>Tasks</h3>
          <ul style={{ listStyle: "none", padding: 0, marginTop: "12px" }}>
            {tasks.map((task) => (
            <li
              key={task.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <label style={{ display: "flex", gap: "12px" }}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggle(task.id)}
                />
                <span
                  style={{
                    textDecoration: task.completed ? "line-through" : "none",
                    color: task.completed ? "#94a3b8" : "#0f172a",
                  }}
                >
                  {task.title}
                </span>
              </label>
              <span style={{ color: "#64748b", fontSize: "14px" }}>
                {task.category} • {task.tags.join(", ")}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section
        style={{
          gridColumn: "1 / -1",
          background: "#ffffff",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
        }}
      >
        <h3 style={{ margin: 0 }}>Stat History</h3>
        {history.length === 0 ? (
          <p style={{ marginTop: "12px", color: "#64748b" }}>
            Complete tasks to record stat changes.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, marginTop: "12px" }}>
            {history.map((entry) => (
              <li
                key={entry.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid #e2e8f0",
                  gap: "12px",
                }}
              >
                <div>
                  <strong>{entry.taskName}</strong>
                  <div style={{ color: "#64748b", fontSize: "13px" }}>
                    {entry.category} • {entry.status} •{" "}
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                </div>
                <div style={{ color: "#0f172a", fontSize: "13px" }}>
                  {Object.entries(entry.statDelta)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(" | ")}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
