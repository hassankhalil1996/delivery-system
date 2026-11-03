
const API_URL = import.meta.env.VITE_API_URL || "";

export type Business = {
  id: number;
  name: string;
  username: string;
  isActive: boolean;
  createdAt: string;
};

export type CreateBusinessInput = {
  name: string;
  username: string;
  password: string;
};

export async function createBusiness(
  input: CreateBusinessInput
): Promise<Business> {
  const response = await fetch(`${API_URL}/businesses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create business");
  }

  return data as Business;
}
