
export type Courier = {
  id: number;
  name: string;
  username: string;
  isActive: boolean;
  createdAt: string;
};

export type CreateCourierInput = {
  name: string;
  username: string;
  password: string;
};

const API_URL = import.meta.env.VITE_API_URL || "";

export async function createCourier(
  input: CreateCourierInput
): Promise<Courier> {
  const response = await fetch(`${API_URL}/couriers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create courier");
  }

  return data as Courier;
}
