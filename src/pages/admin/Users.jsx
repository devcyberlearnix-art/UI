import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search, Download, Edit, Trash2, Plus, Loader2,
  AlertCircle, Eye, X, RefreshCw,
  Users as UsersIcon, GraduationCap, BookOpen, ShieldOff,
  CheckCircle2, XCircle, ChevronLeft, ChevronRight,
  UserCircle2, Mail, Calendar, Hash, LogIn,
} from "lucide-react";
import { adminApi } from "../../api/adminApi";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

// ── helpers ───────────────────────────────────────────────────────────────────
const ROLE_COLORS = {
  USER:        { bg: "#e0f2fe", color: "#0369a1" },
  STUDENT:     { bg: "#d1fae5", color: "#065f46" },
  INSTRUCTOR:  { bg: "#ede9fe", color: "#5b21b6" },
  ADMIN:       { bg: "#ffedd5", color: "#c2410c" },
  SUB_ADMIN:   { bg: "#fef3c7", color: "#92400e" },
  SUPER_ADMIN: { bg: "#fee2e2", color: "#991b1b" },
};

const STATUS_COLORS = {
  ACTIVE:   { bg: "#dcfce7", color: "#166534" },
  INACTIVE: { bg: "#f3f4f6", color: "#4b5563" },
  BLOCKED:  { bg: "#fee2e2", color: "#991b1b" },
  PENDING:  { bg: "#fef9c3", color: "#854d0e" },
};

const AVATAR_BG = ["#6366f1","#ec4899","#14b8a6","#f97316","#8b5cf6","#06b6d4","#f43f5e","#10b981"];
const avatarBg  = (s = "") => AVATAR_BG[(s.charCodeAt(0) || 0) % AVATAR_BG.length];

// Never crashes — converts anything to string
const safe = (v) => (v == null ? "" : String(v));

const PAGE_SIZE = 10;

// Transform any backend user shape → normalised display object
const normalise = (u) => {
  const first = safe(u.firstName);
  const last  = safe(u.lastName);
  const name  = safe(u.name || u.displayName || u.username) || (first || last ? `${first} ${last}`.trim() : "—");
  const status = safe(u.status || u.accountStatus || "ACTIVE").toUpperCase();
  const role   = safe(u.role || u.userRole || u.role1 || "USER").toUpperCase();

  return {
    _id:       safe(u.id || u._id || u.userId || u.user_id) || crypto.randomUUID(),
    name,
    email:     safe(u.email || u.emailAddress) || "—",
    phone:     safe(u.phone || u.phoneNumber || u.mobile) || "—",
    role,
    status,
    courses:   Number(u.courses ?? u.enrolledCourses ?? u.courseCount ?? 0),
    createdAt: u.createdAt || u.created_at || u.joinedDate || u.registrationDate || null,
    userId:    safe(u.id || u.userId || u._id || u.user_id) || "—",
  };
};

// Extract users array from any response envelope
const extractUsers = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;

  // Common envelope keys — order matters (most specific first)
  for (const key of ["users","data","items","content","result","records","list","members"]) {
    if (raw[key] && Array.isArray(raw[key])) return raw[key];
  }
  // Nested: { success, data: { users: [...] } }
  if (raw.data && typeof raw.data === "object" && !Array.isArray(raw.data)) {
    return extractUsers(raw.data);
  }
  return [];
};

const fmtDate = (v) => {
  if (!v) return "—";
  try { return new Date(v).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }); }
  catch { return safe(v); }
};

// ── Component ─────────────────────────────────────────────────────────────────
const Users = () => {
  const navigate  = useNavigate();
  const { user: authUser } = useAuth();

  // any admin/sub-admin role can view
  const isAdmin       = ["admin","super_admin","sub_admin","main_admin","SUB_ADMIN","ADMIN","SUPER_ADMIN"].includes(authUser?.role || "");
  const hasPermission = (p) => isAdmin || (authUser?.permissions || []).includes(p);

  const [allUsers,      setAllUsers]      = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search,        setSearch]        = useState("");
  const [roleFilter,    setRoleFilter]    = useState("All");
  const [statusFilter,  setStatusFilter]  = useState("All");
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [errorType,     setErrorType]     = useState(""); // 'auth' | 'network' | 'other'
  const [page,          setPage]          = useState(1);

  const [viewUser,      setViewUser]      = useState(null);
  const [viewLoading,   setViewLoading]   = useState(false);  // loading state for GET /users/{id}
  const [viewDetail,    setViewDetail]    = useState(null);   // full detail from API
  const [confirmDelete, setConfirmDelete] = useState(null);   // user to delete (shows confirm)
  const [deleting,      setDeleting]      = useState(false);
  const [editUser,      setEditUser]      = useState(null);
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [formData,      setFormData]      = useState({ name:"", email:"", role:"USER", status:"ACTIVE" });
  const [saving,        setSaving]        = useState(false);

  // Token override panel (shown when API returns 401/403)
  const [tokenInput,   setTokenInput]   = useState("");
  const [savingToken,  setSavingToken]  = useState(false);

  const saveOverrideToken = async () => {
    const t = tokenInput.trim().replace(/^Bearer\s+/i, "");
    if (!t) return toast.error("Please paste a valid Bearer token");
    setSavingToken(true);
    localStorage.setItem("lms_users_api_token", t);
    setTokenInput("");
    await fetchUsers();  // retry immediately with new token
    setSavingToken(false);
  };

  const clearOverrideToken = () => {
    localStorage.removeItem("lms_users_api_token");
    fetchUsers();
  };

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    setErrorType("");
    try {
      const raw  = await adminApi.getUsers();
      console.log("[Users] raw API response →", raw);

      const arr = extractUsers(raw).map(normalise);
      console.log("[Users] parsed users →", arr.length, "users");
      setAllUsers(arr);
    } catch (err) {
      console.error("[Users] error →", err);
      if (err.status === 401 || err.status === 403 || err?.response?.status === 401 || err?.response?.status === 403) {
        setErrorType("auth");
        // If we used an override token and it still failed, clear it so user can paste a fresh one
        const hadOverride = !!localStorage.getItem('lms_users_api_token');
        if (hadOverride) {
          localStorage.removeItem('lms_users_api_token');
          setError("The saved token was rejected (401/403). Please paste a fresh Bearer token below.");
        } else {
          setError("Access denied (401/403). Your admin account lacks USER_SERVICE permission. Paste the SUB_ADMIN Bearer token below.");
        }
      } else if (!err?.response) {
        setErrorType("network");
        setError("Cannot reach the backend. Check that the ngrok tunnel is active.");
      } else {
        setErrorType("other");
        setError(err?.response?.data?.message || err.message || "Failed to load users");
      }
      toast.error("Could not load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── filtering ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let data = [...allUsers];
    const q  = search.trim().toLowerCase();
    if (q) {
      data = data.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.userId.toLowerCase().includes(q)
      );
    }
    if (roleFilter   !== "All") data = data.filter(u => u.role   === roleFilter);
    if (statusFilter !== "All") data = data.filter(u => u.status === statusFilter);
    setFilteredUsers(data);
    setPage(1);
  }, [search, roleFilter, statusFilter, allUsers]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pagedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    total:       allUsers.length,
    students:    allUsers.filter(u => ["USER","STUDENT"].includes(u.role)).length,
    instructors: allUsers.filter(u => u.role === "INSTRUCTOR").length,
    blocked:     allUsers.filter(u => u.status === "BLOCKED").length,
  };

  // ── actions ───────────────────────────────────────────────────────────────

  // GET /api/v1/admin/users/:userId — opens view modal and fetches full detail
  const openView = async (u) => {
    setViewUser(u);          // show modal immediately with list data
    setViewDetail(null);
    setViewLoading(true);
    try {
      const raw = await adminApi.getUserById(u.userId || u._id);
      // raw may be { success, data: {...} } or the user object directly
      const detail = raw?.data || raw;
      setViewDetail(normalise(detail));
    } catch (err) {
      console.warn("[Users] getUserById failed — using list data", err?.message);
      // Fallback: keep showing the row data we already have
    } finally {
      setViewLoading(false);
    }
  };

  // DELETE /api/v1/admin/users/:userId
  const handleDelete = async (u) => {
    setDeleting(true);
    try {
      await adminApi.deleteUser(u._id);
      setAllUsers(p => p.filter(x => x._id !== u._id));
      setConfirmDelete(null);
      setViewUser(null);
      toast.success(`User "${u.name}" deleted`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  // PUT /api/v1/admin/users/:userId/status   body: { "status": "ACTIVE" | "BLOCKED" }
  const handleToggleStatus = async (u) => {
    const newStatus = u.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
    // Optimistic update
    setAllUsers(p => p.map(x => x._id === u._id ? { ...x, status: newStatus } : x));
    if (viewDetail?._id === u._id) setViewDetail(v => ({ ...v, status: newStatus }));
    try {
      await adminApi.updateUserStatus(u._id, newStatus);
      toast.success(`User ${newStatus === "BLOCKED" ? "blocked" : "unblocked"}`);
    } catch (err) {
      // Rollback on failure
      setAllUsers(p => p.map(x => x._id === u._id ? { ...x, status: u.status } : x));
      if (viewDetail?._id === u._id) setViewDetail(v => ({ ...v, status: u.status }));
      toast.error(err?.response?.data?.message || "Status update failed");
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) return toast.error("Name and email are required");
    setSaving(true);
    try {
      if (editUser) {
        await adminApi.updateUser(editUser._id, formData);
        setAllUsers(p => p.map(u => u._id === editUser._id ? { ...u, ...formData } : u));
        toast.success("User updated"); setEditUser(null);
      } else {
        const [first, ...rest] = formData.name.trim().split(" ");
        await adminApi.createUser({ firstName: first, lastName: rest.join(" "), email: formData.email, role: formData.role, status: formData.status, password: "TempPass@123" });
        toast.success("User created"); setShowAddModal(false); await fetchUsers();
      }
    } catch (err) { toast.error(err?.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const handleExport = () => {
    const csv = ["ID,Name,Email,Role,Status,Phone,Joined",
      ...filteredUsers.map(u => `"${u.userId}","${u.name}","${u.email}","${u.role}","${u.status}","${u.phone}","${fmtDate(u.createdAt)}"`)
    ].join("\n");
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })), download: "users.csv" });
    a.click(); toast.success("CSV exported");
  };

  // ── special states ────────────────────────────────────────────────────────
  if (loading) return (
    <div style={s.center}>
      <div style={s.spinner} />
      <p style={{ color: "#6b7280", marginTop: 14, fontSize: 15 }}>Fetching registered users…</p>
    </div>
  );

  // ── main render ───────────────────────────────────────────────────────────
  return (
    <div style={s.page}>

      {/* Header */}
      <div style={s.headerRow}>
        <div>
          <h1 style={s.h1}>Registered Users</h1>
          <p style={{ color: "#6b7280", fontSize: 13, marginTop: 3 }}>
            All users who have registered on this platform · <strong>{allUsers.length}</strong> total
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={fetchUsers} style={s.iconBtn} title="Refresh from API"><RefreshCw size={16} /></button>
          {allUsers.length > 0 && <button onClick={handleExport} style={s.outlineBtn}><Download size={15} /> Export CSV</button>}
          {hasPermission("users:edit") && (
            <button onClick={() => { setFormData({ name:"", email:"", role:"USER", status:"ACTIVE" }); setShowAddModal(true); }} style={s.primaryBtn}>
              <Plus size={16} /> Add User
            </button>
          )}
        </div>
      </div>


      {/* ── Error / Token Panel ─────────────────────────────────────────── */}
      {error && errorType !== "auth" && (
        <div style={{ ...s.errBanner, flexDirection: "row", alignItems: "center" }}>
          <AlertCircle size={17} color="#dc2626" style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 13, color: "#b91c1c", flex: 1 }}>{error}</p>
          <button onClick={fetchUsers} style={{ ...s.iconBtn, padding: "5px 10px" }} title="Retry">
            <RefreshCw size={13} />
          </button>
        </div>
      )}

      {/* Auth error → show token paste panel (no re-login needed) */}
      {error && errorType === "auth" && (
        <div style={{ background: "#fffbeb", border: "1px solid #fbbf24", borderRadius: 14, padding: "18px 20px", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
            <AlertCircle size={17} color="#b45309" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, color: "#92400e", fontSize: 14, margin: "0 0 3px" }}>API Token Required</p>
              <p style={{ color: "#b45309", fontSize: 13, margin: 0 }}>{error}</p>
            </div>
            <button onClick={fetchUsers} style={{ ...s.iconBtn, padding: "5px 10px", border: "1px solid #fbbf24", background: "#fef3c7" }} title="Retry">
              <RefreshCw size={13} color="#b45309" />
            </button>
          </div>
          <p style={{ fontSize: 12, color: "#78350f", marginBottom: 8, fontWeight: 600 }}>
            Paste the SUB_ADMIN Bearer token from your curl command (no "Bearer " prefix needed):
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && saveOverrideToken()}
              placeholder='Paste token here… e.g. eyJhbGciOiJIUzI1NiJ9.eyJy…'
              style={{ flex: 1, minWidth: 200, padding: "9px 12px", border: "1px solid #fbbf24", borderRadius: 9, fontSize: 13, background: "#fff", color: "#111827", fontFamily: "monospace" }}
            />
            <button
              onClick={saveOverrideToken}
              disabled={savingToken || !tokenInput.trim()}
              style={{ ...s.primaryBtn, background: "linear-gradient(135deg,#f59e0b,#d97706)", padding: "9px 18px", opacity: (!tokenInput.trim() || savingToken) ? 0.6 : 1 }}
            >
              {savingToken
                ? <><div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #fff4", borderTop: "2px solid #fff", animation: "spin .7s linear infinite" }} /> Verifying…</>
                : <><CheckCircle2 size={15} /> Apply & Load Users</>
              }
            </button>
          </div>
          <p style={{ fontSize: 11, color: "#92400e", marginTop: 8, marginBottom: 0 }}>
            💡 Copy from: <code style={{ background: "#fef3c7", padding: "1px 6px", borderRadius: 4 }}>Authorization: Bearer …</code> in your curl command. Token is saved in your browser for this session.
          </p>
        </div>
      )}

      {/* Stats */}
      <div style={s.statsGrid}>
        {[
          { label: "Total Users",  v: stats.total,       icon: <UsersIcon size={20} />,     bg:"#eef2ff", c:"#4f46e5" },
          { label: "Students",     v: stats.students,    icon: <GraduationCap size={20} />, bg:"#e0f2fe", c:"#0284c7" },
          { label: "Instructors",  v: stats.instructors, icon: <BookOpen size={20} />,      bg:"#ede9fe", c:"#7c3aed" },
          { label: "Blocked",      v: stats.blocked,     icon: <ShieldOff size={20} />,     bg:"#fee2e2", c:"#dc2626" },
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={{ width:44, height:44, borderRadius:12, background:st.bg, color:st.c, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{st.icon}</div>
            <div>
              <p style={{ fontSize:12, color:"#6b7280", margin:0 }}>{st.label}</p>
              <p style={{ fontSize:28, fontWeight:800, color:"#111827", lineHeight:1.1, margin:0 }}>{st.v}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={s.filterRow}>
        <div style={{ position:"relative", flex:1, minWidth:200 }}>
          <Search size={15} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"#9ca3af", pointerEvents:"none" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email or ID…" style={{ ...s.input, paddingLeft:34 }} />
        </div>
        <select value={roleFilter}   onChange={e => setRoleFilter(e.target.value)}   style={s.select}>
          <option value="All">All Roles</option>
          {["USER","STUDENT","INSTRUCTOR","ADMIN","SUB_ADMIN","SUPER_ADMIN"].map(r => <option key={r} value={r}>{r.replace("_"," ")}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={s.select}>
          <option value="All">All Statuses</option>
          {["ACTIVE","BLOCKED","INACTIVE","PENDING"].map(st => <option key={st} value={st}>{st}</option>)}
        </select>
        <span style={{ fontSize:13, color:"#6b7280", whiteSpace:"nowrap" }}>{filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <div style={s.card}>
        {pagedUsers.length === 0 ? (
          <div style={s.emptyBox}>
            <UsersIcon size={52} style={{ color:"#d1d5db", marginBottom:12 }} />
            <p style={{ fontSize:16, fontWeight:600, color:"#374151", margin:"0 0 6px" }}>
              {allUsers.length === 0 ? "No registered users found" : "No users match your filters"}
            </p>
            <p style={{ fontSize:13, color:"#9ca3af", margin:0 }}>
              {allUsers.length === 0
                ? "The API returned an empty list. Make sure you are logged in as SUB_ADMIN."
                : "Try clearing the search or filter."}
            </p>
            {allUsers.length === 0 && (
              <button onClick={fetchUsers} style={{ ...s.primaryBtn, marginTop:16 }}>
                <RefreshCw size={15} /> Retry
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={s.table}>
              <thead>
                <tr style={{ background:"#f9fafb" }}>
                  {["User","ID","Role","Courses","Status","Joined","Actions"].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedUsers.map((u, i) => {
                  const rs = ROLE_COLORS[u.role]     || { bg:"#f3f4f6", color:"#374151" };
                  const ss = STATUS_COLORS[u.status] || { bg:"#f3f4f6", color:"#374151" };
                  return (
                    <tr key={u._id} style={{ background: i%2===0?"#fff":"#fafafa", borderBottom:"1px solid #f3f4f6", transition:"background .12s" }}
                        onMouseEnter={e => e.currentTarget.style.background="#fff7ed"}
                        onMouseLeave={e => e.currentTarget.style.background = i%2===0?"#fff":"#fafafa"}>
                      {/* User */}
                      <td style={s.td}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:38, height:38, borderRadius:"50%", background:avatarBg(u.name), color:"#fff", fontWeight:700, fontSize:15, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            {(u.name.charAt(0) || "?").toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight:600, fontSize:14, color:"#111827", margin:0 }}>{u.name}</p>
                            <p style={{ fontSize:12, color:"#6b7280", margin:0 }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* ID */}
                      <td style={s.td}><span style={s.mono}>{u.userId.length > 14 ? u.userId.slice(0,14)+"…" : u.userId}</span></td>
                      {/* Role */}
                      <td style={s.td}><span style={{ ...s.badge, background:rs.bg, color:rs.color }}>{u.role.replace("_"," ")}</span></td>
                      {/* Courses */}
                      <td style={{ ...s.td, textAlign:"center", fontWeight:600, color:"#374151" }}>{u.courses}</td>
                      {/* Status */}
                      <td style={s.td}>
                        <span style={{ ...s.badge, background:ss.bg, color:ss.color, gap:4 }}>
                          {u.status === "BLOCKED" ? <XCircle size={11}/> : <CheckCircle2 size={11}/>}
                          {u.status}
                        </span>
                      </td>
                      {/* Joined */}
                      <td style={{ ...s.td, color:"#6b7280", fontSize:13 }}>{fmtDate(u.createdAt)}</td>
                      {/* Actions */}
                      <td style={s.td}>
                        <div style={{ display:"flex", gap:5 }}>
                          <button onClick={() => openView(u)} style={s.btn("#0ea5e9")} title="View details"><Eye size={14}/></button>
                          {hasPermission("users:edit") && (
                            <>
                              <button onClick={() => { setFormData({ name:u.name, email:u.email, role:u.role, status:u.status }); setEditUser(u); }} style={s.btn("#8b5cf6")} title="Edit user"><Edit size={14}/></button>
                              <button
                                onClick={() => handleToggleStatus(u)}
                                style={s.btn(u.status==="BLOCKED"?"#10b981":"#f97316")}
                                title={u.status==="BLOCKED"?"Unblock user":"Block user"}>
                                <ShieldOff size={14}/>
                              </button>
                              <button onClick={() => setConfirmDelete(u)} style={s.btn("#ef4444")} title="Delete user"><Trash2 size={14}/></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={s.pages}>
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} style={s.pgBtn(page===1)}><ChevronLeft size={16}/></button>
            <span style={{ fontSize:13, color:"#374151" }}>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} style={s.pgBtn(page===totalPages)}><ChevronRight size={16}/></button>
          </div>
        )}
      </div>

      {/* ── View / Detail Modal ───────────────────────────────────────── */}
      {viewUser && (
        <Modal
          title="User Details"
          onClose={() => { setViewUser(null); setViewDetail(null); setConfirmDelete(null); }}
        >
          {/* Show confirm delete panel if triggered */}
          {confirmDelete ? (
            <div style={{ textAlign:"center", padding:"8px 0" }}>
              <div style={{ width:60, height:60, borderRadius:"50%", background:"#fee2e2", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
                <Trash2 size={26} color="#dc2626" />
              </div>
              <p style={{ fontWeight:700, fontSize:16, color:"#111827", margin:"0 0 6px" }}>Delete User?</p>
              <p style={{ color:"#6b7280", fontSize:13, margin:"0 0 20px" }}>
                <strong>{confirmDelete.name}</strong> ({confirmDelete.email}) will be permanently removed.
              </p>
              <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
                <button onClick={() => setConfirmDelete(null)} style={s.outlineBtn}>Cancel</button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  disabled={deleting}
                  style={{ ...s.primaryBtn, background:"linear-gradient(135deg,#ef4444,#dc2626)", justifyContent:"center" }}
                >
                  {deleting
                    ? <><div style={{ width:14,height:14,borderRadius:"50%",border:"2px solid #fff4",borderTop:"2px solid #fff",animation:"spin .7s linear infinite" }}/> Deleting…</>
                    : <><Trash2 size={14}/> Yes, Delete</>}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
                <div style={{ width:60, height:60, borderRadius:"50%", background:avatarBg(viewUser.name), color:"#fff", fontSize:24, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {(viewUser.name.charAt(0)||"?").toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:700, fontSize:18, color:"#111827", margin:0 }}>{(viewDetail||viewUser).name}</p>
                  <p style={{ color:"#6b7280", fontSize:13, margin:"2px 0 0" }}>{(viewDetail||viewUser).email}</p>
                  {viewLoading && <p style={{ fontSize:11, color:"#f97316", margin:"4px 0 0", display:"flex", alignItems:"center", gap:4 }}><div style={{ width:10,height:10,borderRadius:"50%",border:"2px solid #fed7aa",borderTop:"2px solid #f97316",animation:"spin .7s linear infinite" }}/>Fetching latest data from API…</p>}
                </div>
              </div>

              {/* Detail grid */}
              {(() => {
                const d = viewDetail || viewUser;
                const statusStyle = STATUS_COLORS[d.status] || { bg:"#f3f4f6", color:"#374151" };
                return (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                    {[
                      [<Hash size={12}/>,        "User ID",     d.userId],
                      [<Mail size={12}/>,         "Email",       d.email],
                      [<UserCircle2 size={12}/>,  "Role",        d.role],
                      [<BookOpen size={12}/>,     "Courses",     d.courses],
                      [<CheckCircle2 size={12}/>, "Status",      d.status],
                      [<Calendar size={12}/>,     "Joined",      fmtDate(d.createdAt)],
                      ...(d.phone && d.phone !== "—" ? [[<Hash size={12}/>, "Phone", d.phone]] : []),
                    ].map(([icon, label, value]) => (
                      <div key={label} style={{ background:"#f8fafc", borderRadius:10, padding:"11px 13px", border:"1px solid #e5e7eb" }}>
                        <p style={{ fontSize:11, color:"#9ca3af", display:"flex", alignItems:"center", gap:4, margin:"0 0 3px" }}>{icon}{label}</p>
                        {label === "Status" ? (
                          <span style={{ ...s.badge, background:statusStyle.bg, color:statusStyle.color, fontSize:12 }}>
                            {d.status === "BLOCKED" ? <XCircle size={10}/> : <CheckCircle2 size={10}/>}
                            {safe(value)||"—"}
                          </span>
                        ) : (
                          <p style={{ fontWeight:600, color:"#111827", fontSize:13, margin:0, wordBreak:"break-all" }}>{safe(value)||"—"}</p>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Action buttons inside modal */}
              {hasPermission("users:edit") && (
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", borderTop:"1px solid #f3f4f6", paddingTop:14 }}>
                  <button
                    onClick={() => {
                      const d = viewDetail || viewUser;
                      setFormData({ name:d.name, email:d.email, role:d.role, status:d.status });
                      setEditUser(d);
                      setViewUser(null);
                    }}
                    style={{ ...s.outlineBtn, flex:1, justifyContent:"center" }}
                  >
                    <Edit size={14}/> Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(viewDetail || viewUser)}
                    style={{ ...s.outlineBtn, flex:1, justifyContent:"center",
                      color: (viewDetail||viewUser).status==="BLOCKED"?"#10b981":"#f97316",
                      borderColor: (viewDetail||viewUser).status==="BLOCKED"?"#a7f3d0":"#fed7aa" }}
                  >
                    <ShieldOff size={14}/>
                    {(viewDetail||viewUser).status==="BLOCKED" ? "Unblock" : "Block"} User
                  </button>
                  <button
                    onClick={() => setConfirmDelete(viewDetail || viewUser)}
                    style={{ ...s.outlineBtn, color:"#ef4444", borderColor:"#fca5a5", flex:1, justifyContent:"center" }}
                  >
                    <Trash2 size={14}/> Delete
                  </button>
                </div>
              )}
            </>
          )}
        </Modal>
      )}

      {/* Add / Edit Modal */}
      {(showAddModal || editUser) && (
        <Modal title={editUser ? "Edit User" : "Add New User"} onClose={() => { setShowAddModal(false); setEditUser(null); }}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {[
              { label:"Full Name", key:"name",  type:"text",  ph:"e.g. Ravi Kumar" },
              { label:"Email",     key:"email", type:"email", ph:"user@example.com" },
            ].map(({ label, key, type, ph }) => (
              <label key={key} style={s.fieldLabel}>
                {label}
                <input type={type} placeholder={ph} value={formData[key]} onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))} style={s.fieldInput} />
              </label>
            ))}
            <label style={s.fieldLabel}>Role
              <select value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))} style={s.fieldInput}>
                {["USER","STUDENT","INSTRUCTOR"].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <label style={s.fieldLabel}>Status
              <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))} style={s.fieldInput}>
                {["ACTIVE","BLOCKED","INACTIVE"].map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </label>
            <button onClick={handleSave} disabled={saving} style={{ ...s.primaryBtn, width:"100%", justifyContent:"center", marginTop:4 }}>
              {saving && <div style={{ ...s.spinner, width:16, height:16, borderWidth:2, marginRight:0 }} />}
              {saving ? "Saving…" : editUser ? "Update User" : "Create User"}
            </button>
          </div>
        </Modal>
      )}

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        * { box-sizing: border-box; }
        input:focus, select:focus { outline:2px solid #f97316; }
        tr:hover td { transition: background .1s; }
      `}</style>

      {/* ── Standalone Confirm Delete (from table row trash icon) */}
      {confirmDelete && !viewUser && (
        <Modal title="Confirm Delete" onClose={() => setConfirmDelete(null)}>
          <div style={{ textAlign:"center", padding:"8px 0" }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:"#fee2e2", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <Trash2 size={28} color="#dc2626" />
            </div>
            <p style={{ fontWeight:700, fontSize:17, color:"#111827", margin:"0 0 6px" }}>Delete User?</p>
            <p style={{ color:"#6b7280", fontSize:13, margin:"0 0 4px" }}><strong>{confirmDelete.name}</strong></p>
            <p style={{ color:"#9ca3af", fontSize:12, margin:"0 0 24px" }}>{confirmDelete.email} · This is permanent and cannot be undone.</p>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={() => setConfirmDelete(null)} style={{ ...s.outlineBtn, flex:1, justifyContent:"center" }}>Cancel</button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deleting}
                style={{ ...s.primaryBtn, background:"linear-gradient(135deg,#ef4444,#dc2626)", flex:1, justifyContent:"center", boxShadow:"0 2px 8px rgba(239,68,68,.3)" }}
              >
                {deleting
                  ? <><div style={{ width:14, height:14, borderRadius:"50%", border:"2px solid #fff4", borderTop:"2px solid #fff", animation:"spin .7s linear infinite" }}/> Deleting…</>
                  : <><Trash2 size={14}/> Yes, Delete</>}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, backdropFilter:"blur(4px)", padding:16 }}>
    <div style={{ background:"#fff", borderRadius:20, padding:"24px 28px", width:"100%", maxWidth:480, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 25px 60px rgba(0,0,0,.2)", animation:"slideUp .2s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ fontWeight:700, fontSize:17, color:"#111827", margin:0 }}>{title}</h2>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#6b7280" }}><X size={20}/></button>
      </div>
      {children}
    </div>
    <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
  </div>
);



// ── styles ────────────────────────────────────────────────────────────────────
const s = {
  page:       { background:"#f8fafc", minHeight:"100vh", padding:"24px", fontFamily:"'Inter','Segoe UI',sans-serif" },
  center:     { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"70vh" },
  spinner:    { width:44, height:44, borderRadius:"50%", border:"4px solid #fde8d8", borderTop:"4px solid #f97316", animation:"spin .7s linear infinite" },
  authCard:   { background:"#fff", borderRadius:20, padding:"36px 32px", maxWidth:380, width:"100%", textAlign:"center", boxShadow:"0 8px 40px rgba(0,0,0,.1)", border:"1px solid #e5e7eb" },
  headerRow:  { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 },
  h1:         { fontSize:24, fontWeight:800, color:"#111827", margin:0 },
  errBanner:  { display:"flex", alignItems:"center", gap:12, background:"#fef2f2", border:"1px solid #fecaca", borderRadius:12, padding:"12px 16px", marginBottom:18 },
  statsGrid:  { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:18 },
  statCard:   { background:"#fff", borderRadius:14, padding:"16px 18px", display:"flex", alignItems:"center", gap:14, boxShadow:"0 1px 6px rgba(0,0,0,.06)", border:"1px solid #e5e7eb" },
  filterRow:  { display:"flex", gap:10, marginBottom:18, flexWrap:"wrap", alignItems:"center" },
  input:      { width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:10, fontSize:14, background:"#fff", color:"#111827" },
  select:     { border:"1px solid #e5e7eb", borderRadius:10, padding:"9px 12px", fontSize:14, background:"#fff", color:"#374151", cursor:"pointer" },
  card:       { background:"#fff", borderRadius:16, boxShadow:"0 1px 10px rgba(0,0,0,.07)", border:"1px solid #e5e7eb", overflow:"hidden" },
  emptyBox:   { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"56px 20px", textAlign:"center" },
  table:      { width:"100%", borderCollapse:"collapse" },
  th:         { padding:"12px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:".06em", borderBottom:"1px solid #e5e7eb" },
  td:         { padding:"13px 16px", fontSize:14, verticalAlign:"middle" },
  badge:      { display:"inline-flex", alignItems:"center", padding:"3px 10px", borderRadius:999, fontSize:12, fontWeight:600, gap:3 },
  mono:       { fontFamily:"monospace", fontSize:12, background:"#f3f4f6", color:"#374151", padding:"2px 8px", borderRadius:6 },
  btn:        (c) => ({ background:`${c}18`, border:"none", borderRadius:8, padding:"6px 8px", cursor:"pointer", color:c, display:"inline-flex", alignItems:"center", justifyContent:"center" }),
  pages:      { display:"flex", alignItems:"center", justifyContent:"center", gap:12, padding:"14px 16px", borderTop:"1px solid #f3f4f6" },
  pgBtn:      (d) => ({ background:d?"#f3f4f6":"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:"6px 10px", cursor:d?"default":"pointer", color:d?"#d1d5db":"#374151", display:"flex", alignItems:"center" }),
  primaryBtn: { background:"linear-gradient(135deg,#f97316,#ea580c)", color:"#fff", border:"none", borderRadius:10, padding:"9px 18px", cursor:"pointer", fontWeight:600, fontSize:14, display:"flex", alignItems:"center", gap:7, boxShadow:"0 2px 8px rgba(249,115,22,.28)" },
  outlineBtn: { background:"#fff", color:"#374151", border:"1px solid #e5e7eb", borderRadius:10, padding:"9px 16px", cursor:"pointer", fontWeight:600, fontSize:14, display:"flex", alignItems:"center", gap:7 },
  iconBtn:    { background:"#fff", color:"#374151", border:"1px solid #e5e7eb", borderRadius:10, padding:"9px 10px", cursor:"pointer", display:"flex", alignItems:"center" },
  fieldLabel: { display:"flex", flexDirection:"column", gap:5, fontSize:13, fontWeight:600, color:"#374151" },
  fieldInput: { border:"1px solid #e5e7eb", borderRadius:9, padding:"9px 12px", fontSize:14, color:"#111827", background:"#fff" },
};

export default Users;