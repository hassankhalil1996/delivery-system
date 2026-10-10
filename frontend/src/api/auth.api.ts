
export type AuthUser =
  | {
      id: number;
      username: string;
      role: "ADMIN";
    }
  | {
      id: number;
      username: string;
      name: string;
      role: "BUSINESS";
    }
  | {
      id: number;
      username: string;
      name: string;
      role: "COURIER";
    };

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch("/auth/me", {
    credentials: "include",
  });

  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Failed to check session");

  const data = await response.json();
  return data.user ?? null;
}

export async function login(username: string, password: string) {
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

export async function logout() {
  const response = await fetch("/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }
}
