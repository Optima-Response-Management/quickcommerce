import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UserPlus, ShieldCheck, Trash2, Lock } from "lucide-react";
import Table, { type Column } from "../../../components/common/Table";
import CreateUserModal from "../components/CreateUserModal";
import ManageAccessModal from "../components/ManageAccessModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import AccessMatrix from "../components/AccessMatrix";
import { addUser, deleteUser, updateAccess } from "../userSlice";
import { ALL_FEATURES, GRANTABLE_FEATURES, FEATURE_LABELS } from "../access";
import { ROLE_LABELS, type ManagedUser, type Role } from "../types";
import type { CreateUserFormValues } from "../userSchema";
import type { RootState } from "../../../app/store";

const roleBadge: Record<Role, string> = {
  super_admin: "bg-brand-black text-white",
  admin: "bg-brand-primary-soft text-brand-primary-dark",
  user: "bg-gray-100 text-brand-gray",
};

export default function UsersPage() {
  const dispatch = useDispatch();
  const users = useSelector((state: RootState) => state.users.list);
  const me = useSelector((state: RootState) => state.auth.user);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [deleting, setDeleting] = useState<ManagedUser | null>(null);

  // Only the super admin who created a user can change their access or delete them
  const canManage = (u: ManagedUser) =>
    me?.role === "super_admin" && u.createdBy === me.email && u.email !== me.email;

  const creatorName = (email: string) =>
    email === "system" ? "System" : users.find((u) => u.email === email)?.name ?? email;

  const handleCreate = (values: CreateUserFormValues) => {
    dispatch(
      addUser({
        id: crypto.randomUUID(),
        name: values.name,
        email: values.email,
        role: values.role,
        platformAccess: values.platformAccess,
        platforms: values.platforms,
        features: values.role === "super_admin" ? ALL_FEATURES : values.features,
        createdBy: me?.email ?? "system",
        createdAt: new Date().toISOString().slice(0, 10),
      })
    );
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
      key: "features",
      label: "Feature Access",
      render: (u) => {
        const granted = GRANTABLE_FEATURES.filter((f) => u.features.includes(f));
        return granted.length === GRANTABLE_FEATURES.length ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-black text-white">
            All Features
          </span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {granted.map((f) => (
              <span key={f} className="px-2 py-0.5 rounded-md text-xs bg-brand-primary-soft text-brand-primary-dark">
                {FEATURE_LABELS[f]}
              </span>
            ))}
          </div>
        );
      },
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
              <span key={p} className="px-2 py-0.5 rounded-md text-xs bg-gray-100 text-brand-gray">
                {p}
              </span>
            ))}
          </div>
        ),
    },
    { key: "createdBy", label: "Created By", render: (u) => creatorName(u.createdBy) },
    { key: "createdAt", label: "Created" },
    {
      key: "id",
      label: "Actions",
      render: (u) =>
        canManage(u) ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setEditing(u)}
              title="Manage access"
              className="p-1.5 rounded-md text-brand-gray hover:bg-brand-primary-soft hover:text-brand-primary-dark transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeleting(u)}
              title="Delete user"
              className="p-1.5 rounded-md text-brand-gray hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span
            title={
              u.email === me?.email
                ? "You can't manage your own account"
                : `Only ${creatorName(u.createdBy)} can manage this user`
            }
            className="inline-flex text-gray-300"
          >
            <Lock className="w-4 h-4" />
          </span>
        ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-brand-black mb-1">Users</h2>
          <p className="text-sm text-brand-gray">
            Create users and choose which features and platforms they can access
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Create User
        </button>
      </div>

      <AccessMatrix />

      <Table key={users.length} data={users} columns={columns} title="All Users" pageSize={10} />

      <CreateUserModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={handleCreate} />

      {editing && (
        <ManageAccessModal
          key={editing.id}
          user={editing}
          onClose={() => setEditing(null)}
          onSave={(changes) => {
            dispatch(updateAccess({ id: editing.id, ...changes }));
            setEditing(null);
          }}
        />
      )}

      {deleting && (
        <ConfirmDeleteModal
          userName={deleting.name}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            dispatch(deleteUser(deleting.id));
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}