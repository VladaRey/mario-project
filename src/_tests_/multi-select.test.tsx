import { fireEvent, screen } from "@testing-library/react";
import { renderWithI18n } from "./test-utils";
import { MultiSelect } from "~/components/multi-select";

const options = [
  { value: "p9", label: "Iga Woźniak", cardType: "No card" as const },
  { value: "p5", label: "Ewa Kamińska", cardType: "Medicover Light" as const, disabled: true, hint: "Penalty" },
  { value: "p1", label: "Anna Kowalska", cardType: "Medicover" as const },
];

test("search ignores diacritics and disabled options cannot be picked", () => {
  const onChange = jest.fn();
  renderWithI18n(<MultiSelect options={options} selected={[]} onChange={onChange} />);
  fireEvent.click(screen.getByRole("combobox"));
  const search = screen.getByRole("searchbox");
  fireEvent.change(search, { target: { value: "wozniak" } });
  expect(screen.getByRole("option", { name: /Iga Woźniak/ })).toBeInTheDocument();
  expect(screen.queryByRole("option", { name: /Anna Kowalska/ })).toBeNull();

  fireEvent.change(search, { target: { value: "" } });
  fireEvent.click(screen.getByRole("option", { name: /Ewa Kamińska/ }));
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("option", { name: /Anna Kowalska/ }));
  expect(onChange).toHaveBeenCalledWith(["p1"]);
});

test("trigger shows selected names", () => {
  renderWithI18n(<MultiSelect options={options} selected={["p1"]} onChange={() => undefined} />);
  expect(screen.getByRole("combobox")).toHaveTextContent("Anna Kowalska");
});

test('mode="add" shows a single Done button and no Clear', () => {
  renderWithI18n(<MultiSelect options={options} selected={[]} onChange={() => undefined} mode="add" />);
  fireEvent.click(screen.getByRole("combobox"));
  expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
  expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();
});
