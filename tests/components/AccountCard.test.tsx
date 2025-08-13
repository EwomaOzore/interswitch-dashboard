import { render, screen, fireEvent } from "@testing-library/react";
import { AccountCard } from "../../src/components/AccountCard";
import { Account } from "../../src/lib/api-client";

const mockAccount: Account = {
  id: "1",
  accountNumber: "1234567890",
  accountType: "Savings",
  balance: 150000.5,
  currency: "NGN",
  lastTransactionDate: "2024-01-10T10:30:00Z",
  status: "active",
};

describe("AccountCard", () => {
  it("renders account information correctly", () => {
    render(<AccountCard account={mockAccount} />);

    expect(screen.getByText("Savings")).toBeInTheDocument();
    expect(screen.getByText("******7890")).toBeInTheDocument();
    expect(screen.getByText("Jan 10, 2024")).toBeInTheDocument();
  });

  it("masks balance by default", () => {
    render(<AccountCard account={mockAccount} showBalance={true} />);

    expect(screen.getByText("••••••")).toBeInTheDocument();
    expect(screen.queryByText("₦150,000.50")).not.toBeInTheDocument();
  });

  it("shows balance when Show button is clicked", () => {
    render(<AccountCard account={mockAccount} showBalance={true} />);

    const showButton = screen.getByText("Show");
    fireEvent.click(showButton);

    expect(screen.getByText(/₦150,000.50/)).toBeInTheDocument();
    expect(screen.getByText("Hide")).toBeInTheDocument();
  });

  it("calls onClick when card is clicked", () => {
    const mockOnClick = jest.fn();
    render(<AccountCard account={mockAccount} onClick={mockOnClick} />);

    const card = screen.getByRole("button");
    fireEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledWith(mockAccount);
  });

  it("displays correct account type styling", () => {
    const { rerender } = render(<AccountCard account={mockAccount} />);

    expect(screen.getByText("Savings")).toHaveClass("bg-success");

    const currentAccount = { ...mockAccount, accountType: "Current" as const };
    rerender(<AccountCard account={currentAccount} />);

    expect(screen.getByText("Current")).toHaveClass("bg-interswitch-primary");
  });

  it("is accessible with keyboard navigation", () => {
    const mockOnClick = jest.fn();
    render(<AccountCard account={mockAccount} onClick={mockOnClick} />);

    const card = screen.getAllByRole("button")[0];
    fireEvent.keyDown(card, { key: "Enter", code: "Enter" });

    expect(mockOnClick).toHaveBeenCalledWith(mockAccount);
  });
});
