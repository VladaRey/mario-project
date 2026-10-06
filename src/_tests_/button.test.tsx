import { render, screen } from "@testing-library/react";
import { Button } from "~/components/ui/button";
import { CARD_TYPE_STYLE, getCardTypeColor } from "~/utils/getCardTypeColor";

test("accent button uses coral with ink text", () => {
  render(<Button variant="accent">Add</Button>);
  const b = screen.getByRole("button", { name: "Add" });
  const tokens = b.className.split(/\s+/);
  expect(tokens).toContain("bg-coral");
  expect(tokens).toContain("text-ink");
  expect(tokens).not.toContain("text-white");
});

test("card type colours expose soft, ink and dot classes", () => {
  expect(CARD_TYPE_STYLE.Medicover.soft).toBe("bg-[#E0ECFF]");
  expect(getCardTypeColor("No card")).toBe("bg-[#F1F5F9] text-[#475569]");
});
