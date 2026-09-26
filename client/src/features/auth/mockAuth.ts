import type { LoginFormValues } from "./authSchema";

// Fake users for frontend-only testing
const MOCK_USERS = [
  { email: "admin@test.com", password: "123456", role: "super_admin" as const },
  { email: "customer@test.com", password: "123456", role: "customer" as const },
];

export function mockLogin(values: LoginFormValues) {
  return new Promise<{ token: string; user: { email: string; role: string } }>(
    (resolve, reject) => {
      setTimeout(() => {
        const match = MOCK_USERS.find(
          (u) => u.email === values.email && u.password === values.password
        );
        if (match) {
          resolve({
            token: "mock-jwt-token",
            user: { email: match.email, role: match.role },
          });
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 500); // simulate network delay
    }
  );
}