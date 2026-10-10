export type Admin = {
  id: number;
  username: string;
  role: "ADMIN";
};

export async function getCurrentAdmin(): Promise<Admin | null> {
  const response = await fetch("/auth/me", {
    credentials: "include",
  });

  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Failed to check session");

  const data = await response.json();
  return data.user?.role === "ADMIN" ? data.user : null;
}

export async function loginAdmin(username: string, password: string) {
  const response = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid username or password");
  }
}

export async function logoutAdmin() {
  const response = await fetch("/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }
}