import { useEffect, useState, type FormEvent } from "react";
import { createUser, getUsers, type User } from "@/api/userService";
import { useApi } from "@/hooks/useApi";

const emptyForm = { name: "", email: "" };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState(emptyForm);

  const listApi = useApi();
  const createApi = useApi();
  const listRequest = listApi.request;
  const createRequest = createApi.request;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await listRequest(getUsers);
        setUsers(data);
      } catch {
        // Error is exposed by useApi and rendered in UI.
      }
    };

    void fetchUsers();
  }, [listRequest]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const createdUser = await createRequest(createUser, form);
      setUsers((prev) => [createdUser, ...prev]);
      setForm(emptyForm);
    } catch {
      // Error is exposed by useApi and rendered in UI.
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="font-st-display text-[26px] font-semibold tracking-[-0.02em] text-ph-ink">Users</h1>

      <form
        onSubmit={onSubmit}
        className="space-y-3 rounded-[16px] border border-ph-line-strong bg-ph-surface p-5"
      >
        <h2 className="font-ph-mono text-[11px] uppercase tracking-[0.18em] text-ph-green">Create User</h2>
        <input
          value={form.name}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, name: event.target.value }))
          }
          placeholder="Name"
          required
          className="w-full rounded-[10px] border border-ph-line-strong bg-black p-2 text-[14px] text-ph-ink outline-none transition-colors placeholder:text-ph-ink-soft/70 focus-visible:border-ph-green"
        />
        <input
          type="email"
          value={form.email}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, email: event.target.value }))
          }
          placeholder="Email"
          required
          className="w-full rounded-[10px] border border-ph-line-strong bg-black p-2 text-[14px] text-ph-ink outline-none transition-colors placeholder:text-ph-ink-soft/70 focus-visible:border-ph-green"
        />
        <button
          type="submit"
          disabled={createApi.loading}
          className="rounded-[12px] bg-ph-ink px-4 py-2 text-[13px] font-semibold text-black transition-shadow hover:shadow-[0_0_24px_rgba(0,255,65,0.35)] disabled:opacity-60"
        >
          {createApi.loading ? "Saving..." : "Create User"}
        </button>
        {createApi.error ? <p className="text-sm text-ph-ink">{createApi.error}</p> : null}
      </form>

      <section className="space-y-3 rounded-[16px] border border-ph-line-strong bg-ph-surface p-5">
        <h2 className="font-ph-mono text-[11px] uppercase tracking-[0.18em] text-ph-green">User List</h2>
        {listApi.loading ? <p>Loading users...</p> : null}
        {listApi.error ? <p className="text-sm text-ph-ink">{listApi.error}</p> : null}
        {!listApi.loading && users.length === 0 ? <p>No users found.</p> : null}
        <ul className="space-y-2">
          {users.map((user) => (
            <li key={user.id} className="rounded-[12px] border border-ph-line bg-black p-3">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-ph-ink-muted">{user.email}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
