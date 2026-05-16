# Testing Patterns

**Analysis Date:** 2026-05-16

## Current State

No test framework is installed. No test files exist in `goodwell-service-os/src/`.
The `package.json` has no `test` script and no testing dependencies.

This project is at scaffold stage — all testing infrastructure must be added before
writing tests. The guidance below prescribes what to set up, based on the tech stack
(Next.js 16, React 19, TypeScript strict, Tailwind v4).

## Recommended Test Framework

**Runner:** Vitest (preferred over Jest for Next.js 16 + Turbopack projects)
- Jest has known compatibility issues with ES module packages in Next.js 16
- Vitest is faster and natively supports ES modules and TypeScript

**Alternatively:** Jest with `jest-environment-jsdom` if the team prefers Jest
- Requires `ts-jest` or Babel transform
- Slower cold start vs Vitest

**React Testing:** `@testing-library/react` + `@testing-library/user-event`

**Setup to add to `package.json`:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage"
  },
  "devDependencies": {
    "vitest": "^2",
    "@vitejs/plugin-react": "^4",
    "@testing-library/react": "^16",
    "@testing-library/user-event": "^14",
    "@testing-library/jest-dom": "^6",
    "jsdom": "^26",
    "@vitest/coverage-v8": "^2"
  }
}
```

**Config file to create:** `goodwell-service-os/vitest.config.ts`
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

## Test File Organization

**Location:** Co-located with source files (preferred for component tests)
- `src/app/page.test.tsx` alongside `src/app/page.tsx`
- `src/components/Button/Button.test.tsx` alongside `src/components/Button/Button.tsx`

**Alternatively:** Centralized `src/__tests__/` directory for integration tests

**Naming:**
- Unit/component tests: `[name].test.tsx` or `[name].test.ts`
- Integration tests: `[name].integration.test.ts`
- No `.spec.` suffix — use `.test.` consistently

**Setup file to create:** `goodwell-service-os/src/test/setup.ts`
```typescript
import "@testing-library/jest-dom";
```

## Test Structure Pattern

**Suite Organization:**
```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "@/app/page";

describe("Home", () => {
  it("renders the heading", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
```

**Patterns:**
- Group related tests in `describe` blocks named after the component/function
- Use `it("verb + expected result")` phrasing: `it("renders the heading")`
- Prefer `screen` queries over destructured `getBy*` from render
- Use `userEvent` over `fireEvent` for user interaction simulation

## Mocking

**Framework:** `vi` (Vitest built-in) or `jest` mocks if using Jest

**Next.js module mocking:**
```typescript
import { vi } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt} />
  ),
}));
```

**What to Mock:**
- `next/navigation` hooks (`useRouter`, `usePathname`, `useSearchParams`)
- `next/image` — replace with plain `<img>` in test environment
- External API calls / tRPC procedures
- Database clients (Prisma)

**What NOT to Mock:**
- Internal utility functions (test them directly)
- React state and context (use real implementations)
- Tailwind CSS (ignored in jsdom environment)

## Fixtures and Test Data

**Test Data Pattern (to establish when models exist):**
```typescript
// src/test/factories/order.ts
export function createOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: "order-1",
    customerId: "customer-1",
    status: "pending",
    createdAt: new Date("2026-01-01"),
    ...overrides,
  };
}
```

**Location:** `goodwell-service-os/src/test/factories/`

## Coverage

**Requirements:** None enforced yet. Target to establish: 70% for business logic, 50% overall.

**View Coverage:**
```bash
npm run test:coverage
```

Coverage reports output to `goodwell-service-os/coverage/` (add to `.gitignore`).

## Test Types

**Unit Tests:**
- Scope: Pure functions, utility helpers, individual components in isolation
- Location: Co-located with source file

**Integration Tests:**
- Scope: Multi-component flows, tRPC route handlers with mocked DB
- Location: `src/__tests__/integration/`

**E2E Tests:**
- Framework: Not configured. Playwright is recommended when E2E is needed.
- Scope: Critical user flows (create order, mark complete, invoice)

## Async Testing

```typescript
import { waitFor } from "@testing-library/react";

it("loads data after mount", async () => {
  render(<OrderList />);
  await waitFor(() => {
    expect(screen.getByText("Order #001")).toBeInTheDocument();
  });
});
```

## Error Testing

```typescript
it("shows error message on failed submission", async () => {
  const user = userEvent.setup();
  vi.mocked(createOrder).mockRejectedValueOnce(new Error("Network error"));

  render(<OrderForm />);
  await user.click(screen.getByRole("button", { name: /submit/i }));

  await waitFor(() => {
    expect(screen.getByRole("alert")).toHaveTextContent("Network error");
  });
});
```

## Server Component Testing

Next.js Server Components cannot be rendered directly with `@testing-library/react` in a
jsdom environment. Two options:

1. **Extract logic** into plain functions and test those independently
2. **Use Playwright** for Server Component rendering (E2E approach)

For components like `src/app/layout.tsx` and `src/app/page.tsx` (pure Server Components with
no interactivity), prefer E2E tests via Playwright over unit tests.

---

*Testing analysis: 2026-05-16*
