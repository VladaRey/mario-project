import { act, render, screen } from "@testing-library/react";
import { roleFromStorage, useGetRole } from "~/hooks/use-get-role";
import { Role } from "~/lib/roles";

test("roleFromStorage", () => {
  expect(roleFromStorage("a", null, "a", "f")).toBe(Role.Admin);
  expect(roleFromStorage(null, "f", "a", "f")).toBe(Role.Fame);
  expect(roleFromStorage("wrong", "wrong", "a", "f")).toBe(Role.Guest);
  expect(roleFromStorage(null, null, undefined, undefined)).toBe(Role.Guest);
});

function Probe({ id }: { id: string }) {
  const { role, logout } = useGetRole();
  return <button data-testid={id} onClick={logout}>{role}</button>;
}

test("logout updates every mounted consumer", () => {
  localStorage.setItem("admin-password", "admin");
  render(<><Probe id="a" /><Probe id="b" /></>);
  expect(screen.getByTestId("a")).toHaveTextContent("admin");
  act(() => screen.getByTestId("a").click());
  expect(screen.getByTestId("a")).toHaveTextContent("guest");
  expect(screen.getByTestId("b")).toHaveTextContent("guest");
  expect(localStorage.getItem("admin-password")).toBeNull();
});
