import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatsSection } from "../index";

describe("StatsSection", () => {
  it("renders loading state and then dashboard metrics", async () => {
    render(<StatsSection />);

    expect(screen.getByText(/loading stats/i)).toBeInTheDocument();
    expect(await screen.findByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("1284")).toBeInTheDocument();
    expect(screen.getByText("$48250")).toBeInTheDocument();
  });
});
