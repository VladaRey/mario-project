import { fireEvent, screen } from "@testing-library/react";
import { renderWithI18n } from "./test-utils";
import { activeTab, TabBarView } from "~/components/shell/bottom-tab-bar";
import { Role } from "~/lib/roles";

jest.mock("next/navigation", () => ({ usePathname: () => "/", useRouter: () => ({ push: jest.fn() }) }));

test("activeTab", () => {
  expect(activeTab("/")).toBe("events");
  expect(activeTab("/event/e1/lottery")).toBe("events");
  expect(activeTab("/players/player/p1")).toBe("players");
  expect(activeTab("/penalties")).toBe("penalties");
  expect(activeTab("/admin/events")).toBe("admin");
});

const noop = () => undefined;

test("last slot depends on role", () => {
  const { rerender } = renderWithI18n(<TabBarView role={Role.Guest} active="events" penaltyCount={2} onFfp={noop} onFame={noop} />);
  expect(screen.getByRole("link", { name: /Log in/ })).toHaveAttribute("href", "/login");
  rerender(<TabBarView role={Role.Admin} active="events" penaltyCount={2} onFfp={noop} onFame={noop} />);
  expect(screen.getByRole("link", { name: /Admin/ })).toHaveAttribute("href", "/admin");
  const onFame = jest.fn();
  rerender(<TabBarView role={Role.Fame} active="events" penaltyCount={2} onFfp={noop} onFame={onFame} />);
  fireEvent.click(screen.getByRole("button", { name: /Fame/ }));
  expect(onFame).toHaveBeenCalled();
});

test("FFP button, penalty badge and truncating labels", () => {
  const onFfp = jest.fn();
  renderWithI18n(<TabBarView role={Role.Guest} active="events" penaltyCount={2} onFfp={onFfp} onFame={noop} />);
  fireEvent.click(screen.getByRole("button", { name: "FFP calculator" }));
  expect(onFfp).toHaveBeenCalled();
  expect(screen.getByText("2")).toBeInTheDocument();
  expect(screen.getByText("Events")).toHaveClass("truncate");
});

test("no badge when nobody is penalized", () => {
  renderWithI18n(<TabBarView role={Role.Guest} active="events" penaltyCount={0} onFfp={noop} onFame={noop} />);
  expect(screen.queryByText("0")).toBeNull();
});
