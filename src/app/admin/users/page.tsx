"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  image: string;
  credits: number;
  signin_provider: string;
  signin_count: number;
  last_signin_at: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editCredits, setEditCredits] = useState("");

  const fetchUsers = (p: number, q: string) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: "20" });
    if (q) params.set("search", q);

    fetch(`/api/admin/users?${params}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setUsers(res.data.users);
          setTotal(res.data.total);
          setTotalPages(res.data.totalPages);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers(page, search);
  }, [page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(1, search);
  };

  const handleUpdateCredits = async (userId: string) => {
    const credits = parseInt(editCredits);
    if (isNaN(credits) || credits < 0) return;

    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, credits }),
    });
    const result = await res.json();

    if (result.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, credits } : u)),
      );
      setEditingUser(null);
      setEditCredits("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users ({total})</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email or name..."
            className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-violet-500" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-900/80">
                <tr>
                  <th className="px-4 py-3 font-medium text-zinc-400">User</th>
                  <th className="px-4 py-3 font-medium text-zinc-400">
                    Provider
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-400">
                    Credits
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-400">
                    Sign-ins
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-400">
                    Last Active
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-400">
                    Registered
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-800/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-200">
                        {user.name || "-"}
                      </p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {user.signin_provider || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {editingUser === user.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editCredits}
                            onChange={(e) => setEditCredits(e.target.value)}
                            className="w-20 rounded border border-zinc-600 bg-zinc-700 px-2 py-1 text-sm text-white"
                            min="0"
                          />
                          <button
                            onClick={() => handleUpdateCredits(user.id)}
                            className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="rounded bg-zinc-600 px-2 py-1 text-xs text-white hover:bg-zinc-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-zinc-300">
                          {user.credits ?? 0}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {user.signin_count || 0}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      {user.last_signin_at
                        ? new Date(user.last_signin_at).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {editingUser !== user.id && (
                        <button
                          onClick={() => {
                            setEditingUser(user.id);
                            setEditCredits(String(user.credits ?? 0));
                          }}
                          className="rounded bg-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-600"
                        >
                          Edit Credits
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-zinc-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
