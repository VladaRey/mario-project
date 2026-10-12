import { screen } from "@testing-library/react";
import { renderWithI18n } from "./test-utils";
import PenaltiesPage from "~/app/(app)/penalties/page";
import { resetMockDb } from "~/lib/db.mock";

jest.mock("next/navigation", () => ({ usePathname: () => "/penalties", useRouter: () => ({ push: jest.fn() }) }));

test("lists penalized players with explanation and no Manage for guests", async () => {
  resetMockDb();
  renderWithI18n(<PenaltiesPage />);
  expect(await screen.findByText("Ewa Kamińska")).toBeInTheDocument();
  expect(screen.getByText("Ula Wieczorek")).toBeInTheDocument();
  expect(screen.getAllByText(/administrative fee/).length).toBeGreaterThan(0);
  expect(screen.queryByRole("link", { name: /Manage/ })).toBeNull();
});
