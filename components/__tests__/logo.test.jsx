import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Logo } from "../logo";

describe("Logo", () => {
  it("renders the default brand name", () => {
    render(<Logo />);
    expect(screen.getByText("DM")).toBeInTheDocument();
    expect(screen.getByText("Forge")).toBeInTheDocument();
  });

  it("renders the white-label brand name when provided", () => {
    render(<Logo whiteLabel={{ brandName: "Agency X" }} />);
    expect(screen.getByText("Agency X")).toBeInTheDocument();
  });

  it("renders the 'by DMForge' text when hideParentBranding is false", () => {
    render(<Logo whiteLabel={{ brandName: "Agency X", hideParentBranding: false }} />);
    expect(screen.getByText("by DMForge")).toBeInTheDocument();
  });

  it("hides the 'by DMForge' text when hideParentBranding is true", () => {
    render(<Logo whiteLabel={{ brandName: "Agency X", hideParentBranding: true }} />);
    expect(screen.queryByText("by DMForge")).not.toBeInTheDocument();
  });
});
