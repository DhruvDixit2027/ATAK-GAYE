import React, { useEffect, useState } from "react";
import {
  Users,
  Wrench,
  ClipboardList,
  IndianRupee,
  LogOut,
  RefreshCw,
  Sun,
  Moon,
  Phone,
  Bike,
  Star,
  CheckCircle2,
  XCircle,
  Search,
} from "lucide-react";
import { BACKEND_URL } from "./config";

export default function Dashboard({ onLogout, theme, toggleTheme }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [helpers, setHelpers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, helpersRes, requestsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/admin/stats`),
        fetch(`${BACKEND_URL}/api/admin/users`),
        fetch(`${BACKEND_URL}/api/admin/helpers`),
        fetch(`${BACKEND_URL}/api/admin/requests`),
      ]);
      setStats(await statsRes.json());
      setUsers(await usersRes.json());
      setHelpers(await helpersRes.json());
      setRequests(await requestsRes.json());
    } catch (err) {
      console.error("Admin data fetch karne mein error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    setSearch("");
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("atakGayeAdminAuth");
    onLogout();
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "users", label: "Users", count: users.length },
    { id: "helpers", label: "Helpers", count: helpers.length },
    { id: "requests", label: "Requests", count: requests.length },
  ];

  const initials = (name = "?") =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const filteredUsers = users.filter((u) =>
    `${u.name} ${u.phone}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredHelpers = helpers.filter((h) =>
    `${h.name} ${h.phone} ${h.vehicleNumber}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredRequests = requests.filter((r) =>
    `${r.issueType} ${r.userId?.name || ""} ${r.helperId?.name || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const statusBadge = (status) => {
    const map = {
      pending: "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
      matched: "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
      accepted: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400",
      "in-progress": "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400",
      completed: "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400",
      rejected: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400",
      cancelled: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
    };
    return map[status] || "bg-slate-100 dark:bg-slate-800 text-slate-500";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      {/* Top bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-sm z-10">
        <div>
          <h1 className="text-lg font-black">Atak Gaye Admin</h1>
          <p className="text-xs text-slate-500 dark:text-slate-500">Business Dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun size={15} className="text-yellow-400" />
            ) : (
              <Moon size={15} className="text-slate-600" />
            )}
          </button>
          <button
            onClick={fetchAll}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-500 dark:hover:text-red-400 text-sm font-semibold transition-colors"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 flex-wrap gap-3">
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-colors ${
                activeTab === t.id
                  ? "bg-white dark:bg-slate-900 text-orange-500 dark:text-orange-400 border border-slate-200 dark:border-slate-800 border-b-white dark:border-b-slate-900"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
              style={{ marginBottom: "-1px" }}
            >
              {t.label}
              {t.count != null && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeTab === t.id
                      ? "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab !== "overview" && (
          <div className="relative mb-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search karo..."
              className="pl-8 pr-3 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-orange-400 w-56 transition-colors"
            />
          </div>
        )}
      </div>

      <div className="p-6">
        {activeTab === "overview" && stats && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={Users}
                label="Total Users"
                value={stats.totalUsers}
                color="blue"
                onClick={() => setActiveTab("users")}
              />
              <StatCard
                icon={Wrench}
                label="Total Helpers"
                value={stats.totalHelpers}
                color="orange"
                onClick={() => setActiveTab("helpers")}
              />
              <StatCard
                icon={ClipboardList}
                label="Aaj ki Requests"
                value={stats.todayRequests}
                color="purple"
                onClick={() => setActiveTab("requests")}
              />
              <StatCard
                icon={IndianRupee}
                label="Aaj ki Earnings"
                value={`₹${stats.todayEarnings}`}
                color="green"
                onClick={() => setActiveTab("requests")}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Requests (all time)</div>
                <div className="text-3xl font-black">{stats.totalRequests}</div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Earnings (all time)</div>
                <div className="text-3xl font-black text-green-600 dark:text-green-400">₹{stats.totalEarnings}</div>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <CardTable
            emptyText="Koi user nahi mila"
            headers={["User", "Phone", "Vehicle", "Registered"]}
            items={filteredUsers}
            renderRow={(u) => (
              <>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar text={initials(u.name)} color="blue" />
                    <span className="font-semibold">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Phone size={12} className="text-slate-400" /> {u.phone}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full capitalize">
                    <Bike size={12} /> {u.vehicleType}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                  {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </>
            )}
          />
        )}

        {/* HELPERS TAB */}
        {activeTab === "helpers" && (
          <CardTable
            emptyText="Koi helper nahi mila"
            headers={["Helper", "Phone", "Vehicle", "Skills", "Rating", "Status"]}
            items={filteredHelpers}
            renderRow={(h) => (
              <>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar text={initials(h.name)} color="orange" />
                    <span className="font-semibold">{h.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Phone size={12} className="text-slate-400" /> {h.phone}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs">
                  <div className="capitalize font-medium">{h.vehicleType}</div>
                  <div className="text-slate-400">{h.vehicleNumber}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1 max-w-[180px]">
                    {(h.skillTypes || []).map((s) => (
                      <span
                        key={s}
                        className="text-[10px] font-semibold bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full capitalize"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-sm font-bold">
                    <Star size={13} className="text-yellow-400 fill-yellow-400" /> {h.rating}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {h.availability ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 px-2.5 py-1 rounded-full">
                      <CheckCircle2 size={12} /> Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2.5 py-1 rounded-full">
                      <XCircle size={12} /> Busy
                    </span>
                  )}
                </td>
              </>
            )}
          />
        )}

        {/* REQUESTS TAB */}
        {activeTab === "requests" && (
          <CardTable
            emptyText="Koi request nahi mili"
            headers={["Issue", "User", "Helper", "Status", "Amount", "Date"]}
            items={filteredRequests}
            renderRow={(r) => (
              <>
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold capitalize">{r.issueType}</span>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {r.userId?.name || "—"}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {r.helperId?.name || "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusBadge(r.status)}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-bold text-green-600 dark:text-green-400 text-sm">
                  {r.amount ? `₹${r.amount}` : "—"}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                  {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </>
            )}
          />
        )}
      </div>
    </div>
  );
}
      function StatCard({ icon: Icon, label, value, color, onClick }) {
  const colors = {
    blue: "bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
    orange: "bg-orange-50 dark:bg-orange-500/10 text-orange-500 dark:text-orange-400 border-orange-200 dark:border-orange-500/20",
    purple: "bg-purple-50 dark:bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-200 dark:border-purple-500/20",
    green: "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20",
  };
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-lg transition-all ${
        onClick ? "cursor-pointer active:scale-95 hover:border-orange-300 dark:hover:border-orange-500/40" : ""
      }`}
    >

      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon size={18} />
      </div>
      <div className="text-2xl font-black">{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">{label}</div>
    </div>
  );
}

function Avatar({ text, color }) {
  const colors = {
    blue: "from-blue-400 to-blue-500",
    orange: "from-orange-400 to-orange-500",
  };
  return (
    <div
      className={`w-8 h-8 rounded-full bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}
    >
      {text}
    </div>
  );
}

function CardTable({ headers, items, renderRow, emptyText }) {
  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 text-sm text-center py-16">
        {emptyText}
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              {headers.map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr
                key={item._id || i}
                className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors last:border-b-0"
              >
                {renderRow(item)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}