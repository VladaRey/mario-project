import { fireEvent, screen } from "@testing-library/react";
import { renderWithI18n } from "./test-utils";
import { initials } from "~/components/ds/player-avatar";
import { Stepper } from "~/components/ds/stepper";
import { Segmented } from "~/components/ds/segmented";
import { PenaltyBadge } from "~/components/penalty-badge";

test("initials", () => {
  expect(initials("Ewa Kamińska")).toBe("EK");
  expect(initials("  anna  ")).toBe("A");
});

test("stepper respects min and max", () => {
  const onChange = jest.fn();
  renderWithI18n(<Stepper value={1} min={1} max={2} onChange={onChange} label="Courts" />);
  expect(screen.getByRole("button", { name: /Decrease/ })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: /Increase/ }));
  expect(onChange).toHaveBeenCalledWith(2);
});

test("stepper keeps decimal steps exact", () => {
  const onChange = jest.fn();
  renderWithI18n(<Stepper value={1.5} min={1} max={4} step={0.5} onChange={onChange} label="Hours" />);
  fireEvent.click(screen.getByRole("button", { name: /Increase/ }));
  expect(onChange).toHaveBeenCalledWith(2);
});

test("segmented exposes tabs with aria-selected", () => {
  const onChange = jest.fn();
  renderWithI18n(<Segmented ariaLabel="Filter" value="all" onChange={onChange}
    options={[{ value: "all", label: "All" }, { value: "paid", label: "Paid" }]} />);
  expect(screen.getByRole("tab", { name: "All" })).toHaveAttribute("aria-selected", "true");
  fireEvent.click(screen.getByRole("tab", { name: "Paid" }));
  expect(onChange).toHaveBeenCalledWith("paid");
});

test("penalty badge only for penalized", () => {
  const { rerender } = renderWithI18n(<PenaltyBadge player={{ penalty_since: null }} />);
  expect(screen.queryByText("Penalty")).toBeNull();
  rerender(<PenaltyBadge player={{ penalty_since: "2026-10-01" }} />);
  expect(screen.getByText("Penalty")).toBeInTheDocument();
});
