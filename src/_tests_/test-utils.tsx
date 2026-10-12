import { render, type RenderOptions } from "@testing-library/react";
import { I18nProvider } from "~/i18n/i18n-provider";

export function renderWithI18n(ui: React.ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: ({ children }) => <I18nProvider>{children}</I18nProvider>, ...options });
}
