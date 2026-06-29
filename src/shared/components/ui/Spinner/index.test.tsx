import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Spinner } from "./index";

describe("Spinner", () => {
  it("renders an accessible loading status", () => {
    render(<Spinner size="lg" />);

    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });
});
