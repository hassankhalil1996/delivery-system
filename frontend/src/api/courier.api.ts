
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

export async function createCourier(
  input: CreateCourierInput
): Promise<Courier> {
  const response = await fetch("/couriers", {
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
