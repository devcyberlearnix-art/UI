export const decodeToken = (token) => {
  if (!token) return null;
  
  // Return mock claims for demo tokens
  if (typeof token === "string" && token.startsWith("demo_token_")) {
    const role = token.replace("demo_token_", "");
    return {
      id: "demo_" + role,
      name: role.charAt(0).toUpperCase() + role.slice(1),
      email: `${role}@demo.com`,
      role: role,
      exp: Math.floor(Date.now() / 1000) + 3600, // Valid for 1 hour
    };
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("JWT Decode error:", error);
    return null;
  }
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  if (typeof token === "string" && token.startsWith("demo_token_")) return false;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return decoded.exp * 1000 < Date.now();
};

export const getUser = () => {
  const user = localStorage.getItem("lms_user");
  return user ? JSON.parse(user) : null;
};

export const setUser = (user) => {
  localStorage.setItem("lms_user", JSON.stringify(user));
};

export const removeUser = () => {
  localStorage.removeItem("lms_user");
};

export const login = (email, role) => {
  const mockUser = {
    id: "user_" + Date.now(),
    name: email.split("@")[0],
    email,
    role,
  };
  setUser(mockUser);
  return mockUser;
};

export const logout = () => {
  removeUser();
  localStorage.removeItem("lms_token");
  localStorage.removeItem("access_token");
  window.location.href = "/login";
};