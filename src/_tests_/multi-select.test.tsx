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

describe("desktop keyboard", () => {
  const original = window.matchMedia;
  beforeEach(() => {
    window.matchMedia = ((query: string) => ({
      matches: true, media: query, onchange: null,
      addEventListener: () => undefined, removeEventListener: () => undefined,
      addListener: () => undefined, removeListener: () => undefined, dispatchEvent: () => false,
    })) as typeof window.matchMedia;
    const noop = () => undefined;
    window.ResizeObserver ??= class { observe = noop; unobserve = noop; disconnect = noop; } as unknown as typeof ResizeObserver;
  });
  afterEach(() => { window.matchMedia = original; });

  test("arrows from the search field move the highlight, Enter toggles, disabled options are skipped", () => {
    const onChange = jest.fn();
    renderWithI18n(<MultiSelect options={options} selected={[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("combobox"));
    const search = screen.getByRole("searchbox");
    const iga = screen.getByRole("option", { name: /Iga Woźniak/ });
    const anna = screen.getByRole("option", { name: /Anna Kowalska/ });

    fireEvent.keyDown(search, { key: "ArrowDown" });
    expect(search).toHaveAttribute("aria-activedescendant", anna.id);
    fireEvent.keyDown(search, { key: "ArrowDown" });
    expect(search).toHaveAttribute("aria-activedescendant", iga.id);
    fireEvent.keyDown(search, { key: "ArrowDown" }); // Ewa is disabled: highlight stays on Iga
    expect(search).toHaveAttribute("aria-activedescendant", iga.id);
    fireEvent.keyDown(search, { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith(["p9"]);

    fireEvent.keyDown(search, { key: "ArrowUp" });
    expect(search).toHaveAttribute("aria-activedescendant", anna.id);
    fireEvent.keyDown(search, { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith(["p1"]);
  });

  test("typing resets the highlight to the first match", () => {
    renderWithI18n(<MultiSelect options={options} selected={[]} onChange={() => undefined} />);
    fireEvent.click(screen.getByRole("combobox"));
    const search = screen.getByRole("searchbox");
    fireEvent.keyDown(search, { key: "ArrowDown" });
    fireEvent.keyDown(search, { key: "ArrowDown" });
    fireEvent.change(search, { target: { value: "anna" } });
    expect(search).not.toHaveAttribute("aria-activedescendant");
    fireEvent.keyDown(search, { key: "ArrowDown" });
    expect(search).toHaveAttribute("aria-activedescendant", screen.getByRole("option", { name: /Anna Kowalska/ }).id);
  });
});
