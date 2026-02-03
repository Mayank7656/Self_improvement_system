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

type StatKey = "focus" | "energy" | "wellbeing";

type Task = {
  id: number;
  title: string;
  completed: boolean;
  statImpact: Partial<Record<StatKey, number>>;
};

const baseStats: Record<StatKey, number> = {
  focus: 72,
  energy: 64,
  wellbeing: 78,
};

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Morning workout",
    completed: true,
    statImpact: { energy: 8, wellbeing: 5 },
  },
  {
    id: 2,
    title: "Deep work block",
    completed: false,
    statImpact: { focus: 12 },
  },
  {
    id: 3,
    title: "Meditation",
    completed: true,
    statImpact: { wellbeing: 7, focus: 4 },
  },
  {
    id: 4,
    title: "Hydration reminders",
    completed: false,
    statImpact: { energy: 5, wellbeing: 3 },
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

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const stats = useMemo(() => {
    const totals: Record<StatKey, number> = { ...baseStats };
    tasks.forEach((task) => {
      if (!task.completed) {
        return;
      }
      (Object.keys(task.statImpact) as StatKey[]).forEach((key) => {
        totals[key] = clampStat(
          totals[key] + (task.statImpact[key] ?? 0),
        );
      });
    });
    return totals;
  }, [tasks]);

  const overviewData = useMemo(
    () => [
      { name: "Focus", value: stats.focus },
      { name: "Energy", value: stats.energy },
      { name: "Wellbeing", value: stats.wellbeing },
    ],
    [stats],
  );

  const trendData = useMemo(
    () => ({
      focus: buildTrend(stats.focus),
      energy: buildTrend(stats.energy),
      wellbeing: buildTrend(stats.wellbeing),
    }),
    [stats],
  );

  const handleToggle = (taskId: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task,
      ),
    );
  };

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
                {Object.entries(task.statImpact)
                  .map(
                    ([stat, value]) =>
                      `${stat} +${value}`,
                  )
                  .join(" • ")}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Dashboard;
