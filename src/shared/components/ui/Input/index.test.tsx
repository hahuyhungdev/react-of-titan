import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "./index";

describe("Input", () => {
  it("uses unique ids and connects validation errors to the control", () => {
    const { container } = render(
      <>
        <Input label="Email" error="Email is required" />
        <Input label="Email" />
      </>,
    );

    const inputs = Array.from(container.querySelectorAll("input"));
    const error = screen.getByRole("alert");

    expect(inputs).toHaveLength(2);
    expect(inputs[0].id).not.toBe(inputs[1].id);
    expect(inputs[0]).toHaveAttribute("aria-invalid", "true");
    expect(inputs[0]).toHaveAttribute("aria-describedby", error.id);
  });
});
