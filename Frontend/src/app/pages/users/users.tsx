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
      <h1 className="text-2xl font-semibold">Users</h1>

      <form
        onSubmit={onSubmit}
        className="space-y-3 rounded-lg border border-slate-300 p-4 shadow-sm"
      >
        <h2 className="text-lg font-medium">Create User</h2>
        <input
          value={form.name}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, name: event.target.value }))
          }
          placeholder="Name"
          required
          className="w-full rounded-md border border-slate-300 p-2"
        />
        <input
          type="email"
          value={form.email}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, email: event.target.value }))
          }
          placeholder="Email"
          required
          className="w-full rounded-md border border-slate-300 p-2"
        />
        <button
          type="submit"
          disabled={createApi.loading}
          className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
        >
          {createApi.loading ? "Saving..." : "Create User"}
        </button>
        {createApi.error ? <p className="text-sm text-red-600">{createApi.error}</p> : null}
      </form>

      <section className="space-y-3 rounded-lg border border-slate-300 p-4 shadow-sm">
        <h2 className="text-lg font-medium">User List</h2>
        {listApi.loading ? <p>Loading users...</p> : null}
        {listApi.error ? <p className="text-sm text-red-600">{listApi.error}</p> : null}
        {!listApi.loading && users.length === 0 ? <p>No users found.</p> : null}
        <ul className="space-y-2">
          {users.map((user) => (
            <li key={user.id} className="rounded-md border border-slate-200 p-3">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-slate-600">{user.email}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
