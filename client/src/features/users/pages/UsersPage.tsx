import { useState } from "react";
import { UserPlus } from "lucide-react";
import Table, { type Column } from "../../../components/common/Table";
import CreateUserModal from "../components/CreateUserModal";
import { mockUsers } from "../mockUsers";
import { ROLE_LABELS, type ManagedUser, type Role } from "../types";
import type { CreateUserFormValues } from "../userSchema";

const roleBadge: Record<Role, string> = {
  super_admin: "bg-brand-black text-white",
  admin: "bg-orange-50 text-brand-orange-dark",
  user: "bg-gray-100 text-brand-gray",
};

export default function UsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>(mockUsers);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCreate = (values: CreateUserFormValues) => {
    const newUser: ManagedUser = {
      id: crypto.randomUUID(),
      name: values.name,
      email: values.email,
      role: values.role,
      platformAccess: values.platformAccess,
      platforms: values.platforms,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setUsers((prev) => [newUser, ...prev]);
  };

  const columns: Column<ManagedUser>[] = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (u) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${roleBadge[u.role]}`}>
          {ROLE_LABELS[u.role]}
        </span>
      ),
    },
    {
      key: "platforms",
      label: "Platform Access",
      render: (u) =>
        u.platformAccess === "all" ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-black text-white">
            All Platforms
          </span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {u.platforms.map((p) => (
              <span key={p} className="px-2 py-0.5 rounded-md text-xs bg-orange-50 text-brand-orange-dark">
                {p}
              </span>
            ))}
          </div>
        ),
    },
    { key: "createdAt", label: "Created" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-brand-black mb-1">Users</h2>
          <p className="text-sm text-brand-gray">Create users and choose which platforms they can see</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Create User
        </button>
      </div>

      <Table data={users} columns={columns} title="All Users" pageSize={10} />

      <CreateUserModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={handleCreate} />
    </div>
  );
}