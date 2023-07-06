import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "../components/Header";

describe("Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the header with correct title", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    const titleElement = screen.getByText("Drip Multi-Wallet Dashboard");
    expect(titleElement).toBeInTheDocument();
  });

  test("renders the link to the homepage", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    const linkElement = screen.getByRole("link", {
      name: /Drip Multi-Wallet Dashboard/i,
    });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.getAttribute("href")).toBe("/");
  });

  test("renders the hide prices toggle button", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    const toggleButton = screen.getByText("-");
    expect(toggleButton).toBeInTheDocument();

    // Simulate click on toggle button
    toggleButton.click();

    // Check if toggle button updates to "-"
    expect(toggleButton.textContent).toBe("+");
  });

  // Add more tests as needed for other functionality in the Header component
});
