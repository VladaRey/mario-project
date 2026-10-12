import { fireEvent, screen } from "@testing-library/react";
import { renderWithI18n } from "./test-utils";
import { GuardedLink, NavigationGuardProvider, useLeaveGuard } from "~/components/shell/navigation-guard";

jest.mock("next/navigation", () => ({ usePathname: () => "/", useRouter: () => ({ push: jest.fn() }) }));

function Page({ dirty, onClick }: { dirty: boolean; onClick?: React.MouseEventHandler<HTMLAnchorElement> }) {
  useLeaveGuard(dirty);
  return <GuardedLink href="/admin/events" onClick={onClick}>Events</GuardedLink>;
}

const renderPage = (dirty: boolean, onClick?: React.MouseEventHandler<HTMLAnchorElement>) =>
  renderWithI18n(<NavigationGuardProvider><Page dirty={dirty} onClick={onClick} /></NavigationGuardProvider>);

let confirmSpy: jest.SpyInstance;
beforeEach(() => { confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false); });
afterEach(() => confirmSpy.mockRestore());

test("dirty page asks before leaving and blocks navigation when declined", () => {
  const onClick = jest.fn();
  renderPage(true, onClick);
  const link = screen.getByRole("link", { name: "Events" });
  expect(fireEvent.click(link)).toBe(false); // default prevented
  expect(confirmSpy).toHaveBeenCalledTimes(1);
  expect(onClick).not.toHaveBeenCalled();
  fireEvent.click(link);
  expect(confirmSpy).toHaveBeenCalledTimes(2);
});

test("page stays guarded after the user confirms leaving", () => {
  confirmSpy.mockReturnValue(true);
  const onClick = jest.fn((e: React.MouseEvent) => e.preventDefault());
  renderPage(true, onClick);
  const link = screen.getByRole("link", { name: "Events" });
  fireEvent.click(link);
  fireEvent.click(link);
  expect(confirmSpy).toHaveBeenCalledTimes(2);
  expect(onClick).toHaveBeenCalledTimes(2);
});

test("clean page navigates without asking", () => {
  const onClick = jest.fn((e: React.MouseEvent) => e.preventDefault());
  renderPage(false, onClick);
  fireEvent.click(screen.getByRole("link", { name: "Events" }));
  expect(confirmSpy).not.toHaveBeenCalled();
  expect(onClick).toHaveBeenCalledTimes(1);
});
