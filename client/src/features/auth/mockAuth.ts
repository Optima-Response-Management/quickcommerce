import { store } from "../../app/store";
import type { LoginFormValues } from "./authSchema";
import type { AuthUser } from "./authSlice";

const DEMO_PASSWORD = "123456"; // same password for every mock user

export function mockLogin(values: LoginFormValues) {
  return new Promise<{ token: string; user: AuthUser }>((resolve, reject) => {
    setTimeout(() => {
      const users = store.getState().users.list;
      const match = users.find((u) => u.email.toLowerCase() === values.email.toLowerCase());
      if (match && values.password === DEMO_PASSWORD) {
        resolve({
          token: "mock-jwt-token",
          user: {
            email: match.email,
            name: match.name,
            role: match.role,
            platforms: match.platforms,
            features: match.features,
          },
        });
      } else {
        reject(new Error("Invalid credentials"));
      }
    }, 500);
  });
}