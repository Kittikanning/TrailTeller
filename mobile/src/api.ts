
const BASE_URL = "http://10.0.2.2:3000"; // Android Emulator

export const loginUser = async (email: string, password: string) => {
  const res = await fetch(`${BASE_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'เกิดข้อผิดพลาด');
  }

  return res.json(); // { id, name, email }
};
