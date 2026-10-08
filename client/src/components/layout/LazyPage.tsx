import { Suspense } from "react";
import type { ReactNode } from "react";

interface LazyPageProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function LazyPage({
  children,
  fallback = null,
}: LazyPageProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}