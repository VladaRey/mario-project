import { screen } from "@testing-library/react";
import { renderWithI18n } from "./test-utils";
import RulesPage from "~/app/(app)/rules/page";
import { activeTab } from "~/components/shell/bottom-tab-bar";
import { resetMockDb } from "~/lib/db.mock";

jest.mock("next/navigation", () => ({ usePathname: () => "/rules", useRouter: () => ({ push: jest.fn() }) }));

test("shows general rules and every card type", async () => {
  resetMockDb();
  renderWithI18n(<RulesPage />);
  expect(screen.getAllByText("Card rules").length).toBeGreaterThan(0);
  expect(await screen.findByText(/takes 15 zł off/)).toBeInTheDocument();
  for (const name of ["Medicover", "Medicover Light", "Multisport", "Classic", "No card"]) {
    expect(screen.getByRole("heading", { name })).toBeInTheDocument();
  }
});

test("rules route is an active nav item", () => {
  expect(activeTab("/rules")).toBe("rules");
});
