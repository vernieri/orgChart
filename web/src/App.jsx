import React, { useEffect, useMemo, useState } from "react";

const API =
  (import.meta && import.meta.env && import.meta.env.VITE_API_URL) ||
  "http://localhost:8080/api/v1";

async function fetchJSON(path, opts) {
  const res = await fetch(`${API}${path}`, opts);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `HTTP ${res.status}`);
  }
  return res.json();
}

async function postJSON(path, body) {
  return fetchJSON(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function useTeams() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reload = async () => {
    try {
      setLoading(true);
      setData(await fetchJSON("/teams"));
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    reload();
  }, []);
  return { data, loading, error, reload };
}

function useEmployees() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reload = async () => {
    try {
      setLoading(true);
      setData(await fetchJSON("/employees"));
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    reload();
  }, []);
  return { data, loading, error, reload };
}

function Card({ title, children, actions }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/80 shadow-sm">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {actions}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`rounded-xl px-4 py-2 text-sm font-medium shadow-sm transition active:scale-[0.98] bg-gray-900 text-white hover:bg-black ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-gray-600">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-900"
      />
    </label>
  );
}

function Select({ label, children, ...props }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-gray-600">{label}</span>
      <select
        {...props}
        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-900"
      >
        {children}
      </select>
    </label>
  );
}

function Notice({ type = "info", children }) {
  const palette = {
    info: "bg-blue-50 text-blue-700 border-blue-200",
    error: "bg-red-50 text-red-700 border-red-200",
    success: "bg-green-50 text-green-700 border-green-200",
  }[type];
  return (
    <div className={`rounded-xl border px-3 py-2 text-sm ${palette}`}>
      {children}
    </div>
  );
}

function TeamForm({ onCreated }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMsg({ t: "error", m: "Team name is required" });
      return;
    }
    try {
      setBusy(true);
      await postJSON("/teams", { name: name.trim() });
      setName("");
      setMsg({ t: "success", m: "Team created" });
      onCreated?.();
    } catch (e) {
      setMsg({ t: "error", m: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Input
        label="Team name"
        placeholder="e.g., Engineering"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <Button disabled={busy}>{busy ? "Saving..." : "Create team"}</Button>
        {msg && (
          <span
            className={`text-sm ${
              msg.t === "error" ? "text-red-600" : "text-green-700"
            }`}
          >
            {msg.m}
          </span>
        )}
      </div>
    </form>
  );
}

function EmployeeForm({ teams, employees, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    title: "",
    teamId: "",
    managerId: "",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim())
      return setMsg({ t: "error", m: "Name is required" });
    if (!form.email.trim())
      return setMsg({ t: "error", m: "Email is required" });
    try {
      setBusy(true);
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        title: form.title.trim(),
        teamId: form.teamId ? Number(form.teamId) : undefined,
        managerId: form.managerId ? Number(form.managerId) : undefined,
      };
      await postJSON("/employees", payload);
      setForm({
        name: "",
        email: "",
        title: "",
        teamId: "",
        managerId: "",
      });
      setMsg({ t: "success", m: "Employee created" });
      onCreated?.();
    } catch (e) {
      setMsg({ t: "error", m: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Input
        label="Full name"
        placeholder="e.g., Alice Doe"
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
      />
      <Input
        label="Email"
        placeholder="alice@corp.com"
        value={form.email}
        onChange={(e) => set("email", e.target.value)}
      />
      <Input
        label="Title"
        placeholder="e.g., Engineering Manager"
        value={form.title}
        onChange={(e) => set("title", e.target.value)}
      />
      <Select
        label="Team"
        value={form.teamId}
        onChange={(e) => set("teamId", e.target.value)}
      >
        <option value="">— none —</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </Select>
      <Select
        label="Manager"
        value={form.managerId}
        onChange={(e) => set("managerId", e.target.value)}
      >
        <option value="">— none —</option>
        {employees.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name} {e.title ? `— ${e.title}` : ""}
          </option>
        ))}
      </Select>
      <div className="md:col-span-2 flex items-center gap-2">
        <Button disabled={busy}>
          {busy ? "Saving..." : "Create employee"}
        </Button>
        {msg && (
          <span
            className={`text-sm ${
              msg.t === "error" ? "text-red-600" : "text-green-700"
            }`}
          >
            {msg.m}
          </span>
        )}
      </div>
    </form>
  );
}

/* ---- FIX: o EmployeeForm termina aqui ↑ (estava faltando este fechamento) ---- */

function EditEmployeeDialog({
  open,
  onClose,
  employee,
  teams,
  employees,
  onSaved,
}) {
  const [form, setForm] = useState({
    name: employee?.name || "",
    email: employee?.email || "",
    title: employee?.title || "",
    teamId: employee?.team?.id ? String(employee.team.id) : "",
    managerId: employee?.manager?.id ? String(employee.manager.id) : "",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (employee) {
      setForm({
        name: employee.name || "",
        email: employee.email || "",
        title: employee.title || "",
        teamId: employee.team?.id ? String(employee.team.id) : "",
        managerId: employee.manager?.id ? String(employee.manager.id) : "",
      });
      setMsg(null);
    }
  }, [employee]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!employee) return;
    if (!form.name.trim())
      return setMsg({ t: "error", m: "Name is required" });
    if (!form.email.trim())
      return setMsg({ t: "error", m: "Email is required" });
    try {
      setBusy(true);
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        title: form.title.trim(),
        teamId: form.teamId ? Number(form.teamId) : null,
        managerId: form.managerId ? Number(form.managerId) : null,
      };
      await fetchJSON(`/employees/${employee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      onSaved?.();
      onClose?.();
    } catch (e) {
      setMsg({ t: "error", m: e.message });
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-xl rounded-2xl bg-white p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Edit employee</h3>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            label="Full name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
          <Input
            label="Email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
          <Select
            label="Team"
            value={form.teamId}
            onChange={(e) => set("teamId", e.target.value)}
          >
            <option value="">— none —</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
          <Select
            label="Manager"
            value={form.managerId}
            onChange={(e) => set("managerId", e.target.value)}
          >
            <option value="">— none —</option>
            {employees
              .filter((x) => x.id !== employee?.id) // evita auto-gestão
              .map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                  {e.title ? ` — ${e.title}` : ""}
                </option>
              ))}
          </Select>
        </div>

        {msg && (
          <div
            className={`mt-3 text-sm ${
              msg.t === "error" ? "text-red-600" : "text-green-700"
            }`}
          >
            {msg.m}
          </div>
        )}

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm hover:bg-gray-100"
          >
            Cancel
          </button>
          <Button onClick={save} disabled={busy}>
            {busy ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---- FIX: removi a chave solta extra que havia aqui ---- */

function EmployeeTable({ employees, onEdit }) {
  return (
    <div className="overflow-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600">
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Title</th>
            <th className="px-3 py-2">Email</th>
            <th className="px-3 py-2">Team</th>
            <th className="px-3 py-2">Manager</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((e) => (
            <tr key={e.id} className="border-t">
              <td className="px-3 py-2 font-medium">{e.name}</td>
              <td className="px-3 py-2">{e.title || "—"}</td>
              <td className="px-3 py-2">{e.email}</td>
              <td className="px-3 py-2">{e.team?.name || "—"}</td>
              <td className="px-3 py-2">{e.manager?.name || "—"}</td>
              <td className="px-3 py-2">
                <button
                  className="rounded-lg border px-3 py-1 text-xs hover:bg-gray-50"
                  onClick={() => onEdit?.(e)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
          {employees.length === 0 && (
            <tr>
              <td className="px-3 py-6 text-center text-gray-500" colSpan={6}>
                No employees yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function TreeNode({ node, depth = 0 }) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  return (
    <div className="my-1">
      <div
        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-50"
        onClick={() => setOpen((o) => !o)}
        style={{ paddingLeft: `${depth * 16}px` }}
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded border text-xs">
          {hasChildren ? (open ? "−" : "+") : "•"}
        </span>
        <div className="flex flex-col">
          <span className="font-medium">{node.name}</span>
          <span className="text-xs text-gray-600">
            {node.title || ""} {node.team ? `· ${node.team}` : ""}
          </span>
        </div>
      </div>
      {hasChildren && open && (
        <div className="border-l border-gray-200 ml-4">
          {node.children.map((c) => (
            <TreeNode key={c.id} node={c} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function TreeViewer({ employees }) {
  const [rootId, setRootId] = useState("");
  const [node, setNode] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const load = async (id) => {
    try {
      setBusy(true);
      setErr(null);
      const data = await fetchJSON(`/employees/${id}/tree`);
      setNode(data);
    } catch (e) {
      setErr(e.message);
      setNode(null);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (rootId) load(rootId);
  }, [rootId]);

  const rootOptions = useMemo(
    () => employees.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [employees]
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-end">
        <Select
          label="Root employee"
          value={rootId}
          onChange={(e) => setRootId(e.target.value)}
        >
          <option value="">— select —</option>
          {rootOptions.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} {e.title ? `— ${e.title}` : ""}
            </option>
          ))}
        </Select>
        <div className="md:pb-2">
          <Button onClick={() => rootId && load(rootId)} className="md:ml-2">
            Refresh
          </Button>
        </div>
      </div>

      {busy && <Notice>Loading tree…</Notice>}
      {err && <Notice type="error">{err}</Notice>}
      {node && !busy && !err && (
        <div className="rounded-xl border p-3">
          <TreeNode node={node} />
        </div>
      )}
    </div>
  );
}

export default function OrgChartApp() {
  const {
    data: teams,
    loading: teamsLoading,
    error: teamsError,
    reload: reloadTeams,
  } = useTeams();
  const {
    data: employees,
    loading: empLoading,
    error: empError,
    reload: reloadEmployees,
  } = useEmployees();
  const [health, setHealth] = useState(null);

  // estado para edição
  const [editing, setEditing] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const onEdit = (emp) => {
    setEditing(emp);
    setEditOpen(true);
  };
  const closeEdit = () => {
    setEditOpen(false);
    setEditing(null);
  };

  useEffect(() => {
    fetchJSON("/healthz").then(setHealth).catch(() => setHealth(null));
  }, []);

  const anyLoading = teamsLoading || empLoading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <header className="sticky top-0 z-10 backdrop-blur border-b bg-white/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold tracking-tight">orgChart · Admin</h1>
          <div className="text-xs text-gray-600">
            API: {API.replace("http://", "").replace("https://", "")}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        {health ? (
          <Notice type="success">Backend connected</Notice>
        ) : (
          <Notice type="error">
            Cannot reach backend. Start your Go server at {API}.
          </Notice>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card title="Create team">
            {teamsError && <Notice type="error">{String(teamsError)}</Notice>}
            <TeamForm onCreated={reloadTeams} />
            <div className="mt-4 text-xs text-gray-600">
              {teams.length} team(s)
            </div>
          </Card>

          <Card title="Create employee">
            {(empError || teamsError) && (
              <Notice type="error">{String(empError || teamsError)}</Notice>
            )}
            <EmployeeForm
              teams={teams}
              employees={employees}
              onCreated={reloadEmployees}
            />
          </Card>
        </div>

        <Card title="Employees">
          {anyLoading ? (
            <Notice>Loading…</Notice>
          ) : (
            <EmployeeTable employees={employees} onEdit={onEdit} />
          )}
        </Card>

        <Card title="Hierarchy viewer">
          <TreeViewer employees={employees} />
        </Card>

        {/* Dialog de edição */}
        <EditEmployeeDialog
          open={editOpen}
          onClose={closeEdit}
          employee={editing}
          teams={teams}
          employees={employees}
          onSaved={reloadEmployees}
        />

        <footer className="pt-4 text-center text-xs text-gray-500">
          Built with React + Tailwind · Point VITE_API_URL to your API if needed
        </footer>
      </main>
    </div>
  );
}
