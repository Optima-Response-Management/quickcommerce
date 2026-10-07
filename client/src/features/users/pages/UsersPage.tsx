import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  CheckCircle2,
  Clock3,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import CreateUserModal from "../components/CreateUserModal";
import ManageAccessModal from "../components/ManageAccessModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import AccessMatrix from "../components/AccessMatrix";

import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserAccessMutation,
} from "../usersApi";

import {
  FEATURE_LABELS,
  GRANTABLE_FEATURES,
} from "../access";

import {
  ROLE_LABELS,
  type ManagedUser,
  type Role,
} from "../types";

import type { CreateUserFormValues } from "../userSchema";

const PAGE_SIZE = 20;

const roleStyles: Record<
  Role,
  string
> = {
  super_admin:
    "border-purple-200 bg-purple-50 text-purple-700",

  admin:
    "border-orange-200 bg-orange-50 text-orange-700",

  user:
    "border-slate-200 bg-slate-50 text-slate-600",
};

export default function UsersPage() {
  const [createOpen, setCreateOpen] =
    useState(false);

  const [editing, setEditing] =
    useState<ManagedUser | null>(
      null,
    );

  const [deleting, setDeleting] =
    useState<ManagedUser | null>(
      null,
    );

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [role, setRole] =
    useState<Role | "all">("all");

  const [page, setPage] =
    useState(1);

  const [actionError, setActionError] =
    useState("");

  const [actionSuccess, setActionSuccess] =
    useState("");

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetUsersQuery({
    search,
    role:
      role === "all"
        ? undefined
        : role,
    page,
    limit: PAGE_SIZE,
  });

  const [
    createUser,
    {
      isLoading:
        isCreating,
    },
  ] =
    useCreateUserMutation();

  const [
    updateAccess,
    {
      isLoading:
        isUpdating,
    },
  ] =
    useUpdateUserAccessMutation();

  const [
    deleteUser,
    {
      isLoading:
        isDeleting,
    },
  ] =
    useDeleteUserMutation();

  /*
   * Debounce search so we don't hit the API
   * on every keystroke.
   */
  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        setPage(1);
        setSearch(
          searchInput.trim(),
        );
      }, 350);

    return () =>
      window.clearTimeout(timer);
  }, [searchInput]);

  const users =
    data?.users ?? [];

  const total =
    data?.total ?? 0;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        total / PAGE_SIZE,
      ),
    );

  /*
   * Statistics
   */
  const stats = useMemo(() => {
    return {
      total,

      superAdmins:
        users.filter(
          (user) =>
            user.role ===
            "super_admin",
        ).length,

      admins:
        users.filter(
          (user) =>
            user.role === "admin",
        ).length,

      active:
        users.filter(
          (user) =>
            user.isActive,
        ).length,
    };
  }, [users, total]);

  /*
   * Toast helpers
   */
  const showSuccess = (
    message: string,
  ) => {
    setActionError("");
    setActionSuccess(message);

    window.setTimeout(() => {
      setActionSuccess("");
    }, 3500);
  };

  const showError = (
    error: unknown,
  ) => {
    const message =
      typeof error ===
        "object" &&
      error !== null &&
      "data" in error &&
      typeof (
        error as any
      ).data?.message ===
        "string"
        ? (
            error as any
          ).data.message
        : "Something went wrong. Please try again.";

    setActionSuccess("");
    setActionError(message);
  };

  /*
   * Create user
   */
  const handleCreate = async (
    values: CreateUserFormValues,
  ) => {
    try {
      await createUser({
        ...values,

        /*
         * Backend expects [] when access is "all".
         */
        platforms:
          values.platformAccess ===
          "all"
            ? []
            : values.platforms,
      }).unwrap();

      setCreateOpen(false);

      showSuccess(
        `${values.name} was created successfully.`,
      );
    } catch (error) {
      showError(error);
      throw error;
    }
  };

  /*
   * Update access
   */
  const handleAccessSave =
    async (
      changes: {
        features: any[];
        platformAccess:
          | "all"
          | "custom";
        platforms: string[];
      },
    ) => {
      if (!editing) {
        return;
      }

      try {
        await updateAccess({
          id: editing.id,
          ...changes,
        }).unwrap();

        setEditing(null);

        showSuccess(
          `${editing.name}'s access was updated.`,
        );
      } catch (error) {
        showError(error);
        throw error;
      }
    };

  /*
   * Delete
   */
  const handleDelete =
    async () => {
      if (!deleting) {
        return;
      }

      try {
        await deleteUser(
          deleting.id,
        ).unwrap();

        setDeleting(null);

        showSuccess(
          `${deleting.name} was removed.`,
        );

        if (
          users.length === 1 &&
          page > 1
        ) {
          setPage(
            (current) =>
              current - 1,
          );
        }
      } catch (error) {
        showError(error);
      }
    };

  const pageNumbers = useMemo(
    () => {
      const pages: number[] = [];

      const start = Math.max(
        1,
        page - 2,
      );

      const end = Math.min(
        totalPages,
        start + 4,
      );

      for (
        let index = start;
        index <= end;
        index++
      ) {
        pages.push(index);
      }

      return pages;
    },
    [page, totalPages],
  );

  return (
    <div className="page-enter min-h-full pb-10">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative mb-6 overflow-hidden rounded-3xl border border-brand-border bg-white p-6 shadow-brand-sm sm:p-7">
        <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-orange-200/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-primary/10 bg-brand-primary-soft px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-primary-dark">
              <ShieldCheck className="h-3.5 w-3.5" />

              Access control
            </div>

            <h1 className="text-2xl font-bold tracking-[-0.035em] text-brand-ink sm:text-3xl">
              Users & Access
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-gray">
              Create team accounts,
              control feature
              permissions and
              define which platforms
              each person can access.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setCreateOpen(true)
            }
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-ink px-5 text-xs font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#25201b] hover:shadow-xl"
          >
            <UserPlus className="h-4 w-4 transition-transform group-hover:scale-110" />

            Create user
          </button>
        </div>
      </section>

      {/* =====================================================
          ALERTS
      ====================================================== */}

      {actionSuccess && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />

          {actionSuccess}

          <button
            type="button"
            onClick={() =>
              setActionSuccess("")
            }
            className="ml-auto"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          <Activity className="h-4 w-4 shrink-0" />

          {actionError}

          <button
            type="button"
            onClick={() =>
              setActionError("")
            }
            className="ml-auto"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total users"
          value={stats.total}
          icon={Users}
          description="Accounts in workspace"
        />

        <StatCard
          label="Active users"
          value={stats.active}
          icon={CheckCircle2}
          description="Currently enabled"
          positive
        />

        <StatCard
          label="Admins"
          value={stats.admins}
          icon={ShieldCheck}
          description="Operational administrators"
        />

        <StatCard
          label="Super admins"
          value={stats.superAdmins}
          icon={ShieldCheck}
          description="Full system access"
        />
      </div>

      {/* =====================================================
          USERS PANEL
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-brand-sm">
        {/* Toolbar */}
        <div className="border-b border-brand-border-light p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-sm font-bold text-brand-ink">
                Team members
              </h2>

              <p className="mt-1 text-xs text-brand-gray">
                Search and manage account
                permissions.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {/* Search */}
              <div className="relative sm:w-[280px]">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-light" />

                <input
                  value={
                    searchInput
                  }
                  onChange={(
                    event,
                  ) =>
                    setSearchInput(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Search name or email..."
                  className="h-10 w-full rounded-xl border border-brand-border bg-brand-surface pl-10 pr-4 text-xs font-medium text-brand-ink outline-none transition focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10"
                />
              </div>

              {/* Role */}
              <select
                value={role}
                onChange={(
                  event,
                ) => {
                  setRole(
                    event.target
                      .value as
                      | Role
                      | "all",
                  );
                  setPage(1);
                }}
                className="h-10 rounded-xl border border-brand-border bg-brand-surface px-3 text-xs font-semibold text-brand-ink outline-none transition focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10"
              >
                <option value="all">
                  All roles
                </option>

                <option value="super_admin">
                  Super Admin
                </option>

                <option value="admin">
                  Admin
                </option>

                <option value="user">
                  User
                </option>
              </select>

              <button
                type="button"
                onClick={() =>
                  refetch()
                }
                disabled={
                  isFetching
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-brand-border bg-white px-4 text-xs font-bold text-brand-gray transition hover:bg-brand-surface disabled:opacity-50"
              >
                <Clock3
                  className={
                    isFetching
                      ? "h-3.5 w-3.5 animate-spin"
                      : "h-3.5 w-3.5"
                  }
                />

                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            TABLE
        ================================================== */}

        {isLoading ? (
          <UsersLoading />
        ) : isError ? (
          <EmptyState
            icon={Activity}
            title="Unable to load users"
            description="The users service could not be reached."
            action={
              <button
                type="button"
                onClick={() =>
                  refetch()
                }
                className="rounded-xl bg-brand-ink px-4 py-2.5 text-xs font-bold text-white"
              >
                Try again
              </button>
            }
          />
        ) : users.length ===
          0 ? (
          <EmptyState
            icon={Search}
            title="No users found"
            description={
              search
                ? "Try a different name or email."
                : "Create your first user to get started."
            }
            action={
              !search ? (
                <button
                  type="button"
                  onClick={() =>
                    setCreateOpen(
                      true,
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-ink px-4 py-2.5 text-xs font-bold text-white"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Create user
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-brand-border bg-[#fbfaf8] text-left">
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-gray">
                      User
                    </th>

                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-gray">
                      Role
                    </th>

                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-gray">
                      Feature access
                    </th>

                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-gray">
                      Platforms
                    </th>

                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-gray">
                      Status
                    </th>

                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-gray">
                      Last login
                    </th>

                    <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-brand-gray">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map(
                    (user) => (
                      <UserRow
                        key={
                          user.id
                        }
                        user={user}
                        onEdit={() =>
                          setEditing(
                            user,
                          )
                        }
                        onDelete={() =>
                          setDeleting(
                            user,
                          )
                        }
                        disabled={
                          isUpdating ||
                          isDeleting
                        }
                      />
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-brand-border-light bg-[#fdfcfb] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-brand-gray">
                Showing{" "}
                <span className="font-bold text-brand-ink">
                  {(page - 1) *
                    PAGE_SIZE +
                    1}
                </span>{" "}
                –{" "}
                <span className="font-bold text-brand-ink">
                  {Math.min(
                    page *
                      PAGE_SIZE,
                    total,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-bold text-brand-ink">
                  {total}
                </span>{" "}
                users
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={
                    page === 1
                  }
                  onClick={() =>
                    setPage(
                      (value) =>
                        value - 1,
                    )
                  }
                  className="h-9 rounded-xl border border-brand-border bg-white px-3 text-xs font-bold text-brand-gray disabled:opacity-40"
                >
                  Previous
                </button>

                {pageNumbers.map(
                  (
                    number,
                  ) => (
                    <button
                      key={number}
                      type="button"
                      onClick={() =>
                        setPage(
                          number,
                        )
                      }
                      className={[
                        "h-9 min-w-9 rounded-xl px-2 text-xs font-bold transition",
                        number ===
                        page
                          ? "bg-brand-ink text-white"
                          : "border border-brand-border bg-white text-brand-gray hover:bg-brand-primary-soft",
                      ].join(
                        " ",
                      )}
                    >
                      {number}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  disabled={
                    page ===
                    totalPages
                  }
                  onClick={() =>
                    setPage(
                      (value) =>
                        value + 1,
                    )
                  }
                  className="h-9 rounded-xl border border-brand-border bg-white px-3 text-xs font-bold text-brand-gray disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* =====================================================
          MODALS
      ====================================================== */}

      {createOpen && (
        <CreateUserModal
          open={createOpen}
          onClose={() =>
            setCreateOpen(
              false,
            )
          }
          onCreate={
            handleCreate
          }
          isSubmitting={
            isCreating
          }
        />
      )}

      {editing && (
        <ManageAccessModal
          user={editing}
          onClose={() =>
            setEditing(null)
          }
          onSave={
            handleAccessSave
          }
          isSubmitting={
            isUpdating
          }
        />
      )}

      {deleting && (
        <ConfirmDeleteModal
          userName={
            deleting.name
          }
          onCancel={() =>
            setDeleting(null)
          }
          onConfirm={
            handleDelete
          }
          isDeleting={
            isDeleting
          }
        />
      )}
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
  icon: Icon,
  description,
  positive,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  description: string;
  positive?: boolean;
}) {
  return (
    <div className="group rounded-2xl border border-brand-border bg-white p-5 shadow-brand-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-brand-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-gray">
            {label}
          </p>

          <p className="mt-3 text-2xl font-bold tracking-tight text-brand-ink">
            {value.toLocaleString()}
          </p>
        </div>

        <div
          className={[
            "flex h-10 w-10 items-center justify-center rounded-xl",
            positive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-brand-primary-soft text-brand-primary",
          ].join(" ")}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-3 text-[11px] text-brand-gray">
        {description}
      </p>
    </div>
  );
}

/* ============================================================
   USER ROW
============================================================ */

function UserRow({
  user,
  onEdit,
  onDelete,
  disabled,
}: {
  user: ManagedUser;
  onEdit: () => void;
  onDelete: () => void;
  disabled: boolean;
}) {
  const visibleFeatures =
    user.features.filter(
      (feature) =>
        GRANTABLE_FEATURES.includes(
          feature,
        ),
    );

  return (
    <tr className="group border-b border-brand-border-light transition-colors last:border-0 hover:bg-orange-50/20">
      {/* User */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-xs font-bold text-white shadow-sm">
            {getInitials(
              user.name,
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-brand-ink">
              {user.name}
            </p>

            <p className="mt-0.5 truncate text-xs text-brand-gray">
              {user.email}
            </p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-5 py-4">
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${roleStyles[user.role]}`}
        >
          {ROLE_LABELS[
            user.role
          ]}
        </span>
      </td>

      {/* Features */}
      <td className="max-w-[280px] px-5 py-4">
        <div className="flex flex-wrap gap-1.5">
          {visibleFeatures
            .slice(0, 3)
            .map(
              (feature) => (
                <span
                  key={feature}
                  className="rounded-lg bg-brand-primary-soft px-2 py-1 text-[10px] font-semibold text-brand-primary-dark"
                >
                  {
                    FEATURE_LABELS[
                      feature
                    ]
                  }
                </span>
              ),
            )}

          {visibleFeatures.length >
            3 && (
            <span className="rounded-lg bg-brand-surface px-2 py-1 text-[10px] font-bold text-brand-gray">
              +
              {visibleFeatures.length -
                3}{" "}
              more
            </span>
          )}
        </div>
      </td>

      {/* Platforms */}
      <td className="max-w-[230px] px-5 py-4">
        {user.platformAccess ===
        "all" ? (
          <span className="inline-flex rounded-full bg-brand-ink px-2.5 py-1 text-[10px] font-bold text-white">
            All platforms
          </span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {user.platforms
              .slice(0, 2)
              .map(
                (platform) => (
                  <span
                    key={
                      platform
                    }
                    className="rounded-lg border border-brand-border bg-brand-surface px-2 py-1 text-[10px] font-semibold text-brand-gray"
                  >
                    {platform}
                  </span>
                ),
              )}

            {user.platforms
              .length > 2 && (
              <span className="rounded-lg bg-brand-surface px-2 py-1 text-[10px] font-bold text-brand-gray">
                +
                {user.platforms
                  .length -
                  2}
              </span>
            )}
          </div>
        )}
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        {user.isActive ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-500">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Disabled
          </span>
        )}
      </td>

      {/* Last login */}
      <td className="px-5 py-4">
        <span className="text-xs text-brand-gray">
          {formatDate(
            user.lastLoginAt,
          )}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={onEdit}
            disabled={disabled}
            title="Manage access"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-brand-gray transition hover:bg-brand-primary-soft hover:text-brand-primary disabled:opacity-40"
          >
            <ShieldCheck className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={disabled}
            title="Delete user"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-brand-gray transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            disabled
            className="flex h-9 w-9 items-center justify-center rounded-xl text-brand-gray-light"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ============================================================
   LOADING
============================================================ */

function UsersLoading() {
  return (
    <div className="space-y-3 p-5">
      {Array.from({
        length: 6,
      }).map(
        (_, index) => (
          <div
            key={index}
            className="flex animate-pulse items-center gap-4 rounded-xl border border-brand-border-light bg-brand-surface p-4"
          >
            <div className="h-10 w-10 rounded-xl bg-brand-primary-soft" />

            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/4 rounded-full bg-brand-primary-soft" />
              <div className="h-2.5 w-1/5 rounded-full bg-brand-primary-soft" />
            </div>

            <div className="h-7 w-20 rounded-lg bg-brand-primary-soft" />

            <div className="h-7 w-28 rounded-lg bg-brand-primary-soft" />

            <div className="h-7 w-16 rounded-lg bg-brand-primary-soft" />
          </div>
        ),
      )}
    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof Search;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-surface text-brand-gray-light">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="text-sm font-bold text-brand-ink">
        {title}
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-brand-gray">
        {description}
      </p>

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   HELPERS
============================================================ */

function getInitials(
  name: string,
) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) =>
        part[0]
          ?.toUpperCase(),
    )
    .join("");
}

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "Never";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Never";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}