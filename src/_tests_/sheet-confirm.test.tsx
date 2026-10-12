import { fireEvent, screen } from "@testing-library/react";
import { renderWithI18n } from "./test-utils";
import { ConfirmDialog } from "~/components/confirmation-dialog";
import { MoreMenu } from "~/components/ds/more-menu";

test("confirm dialog uses translated defaults", () => {
  renderWithI18n(<ConfirmDialog open onOpenChange={() => undefined} onConfirm={() => undefined} description="Gone forever" />);
  expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
});

test("more menu runs the chosen item", () => {
  const onReset = jest.fn();
  renderWithI18n(<MoreMenu label="More actions" items={[{ label: "Reset", onSelect: onReset, destructive: true }]} />);
  fireEvent.click(screen.getByRole("button", { name: "More actions" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Reset" }));
  expect(onReset).toHaveBeenCalled();
});
