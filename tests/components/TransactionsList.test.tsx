import { render, screen } from "@testing-library/react";
import { TransactionsList } from "../../src/components/TransactionsList";
import { Transaction } from "../../src/lib/api";

const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: "2024-01-10T10:30:00Z",
    description: "Online Purchase - Amazon",
    amount: -5000,
    type: "debit",
    balanceAfter: 150000.50,
    reference: "TXN001",
    category: "Shopping",
  },
  {
    id: "2",
    date: "2024-01-09T14:15:00Z",
    description: "Salary Credit",
    amount: 250000,
    type: "credit",
    balanceAfter: 155000.50,
    reference: "SAL001",
    category: "Income",
  },
];

describe("TransactionsList", () => {
  it("renders transaction list correctly", () => {
    render(
      <TransactionsList
        transactions={mockTransactions}
        isLoading={false}
        hasMore={false}
      />
    );

    expect(screen.getByText("Transaction History (2 transactions)")).toBeInTheDocument();
    expect(screen.getByText("Online Purchase - Amazon")).toBeInTheDocument();
    expect(screen.getByText("Salary Credit")).toBeInTheDocument();
  });

  it("shows loading state when isLoading is true", () => {
    render(
      <TransactionsList
        transactions={[]}
        isLoading={true}
        hasMore={false}
      />
    );

    expect(screen.getByText("Transaction History (0 transactions)")).toBeInTheDocument();
  });

  it("shows empty state when no transactions", () => {
    render(
      <TransactionsList
        transactions={[]}
        isLoading={false}
        hasMore={false}
      />
    );

    expect(screen.getByText("No transactions found")).toBeInTheDocument();
    expect(screen.getByText("No transactions match your current filters.")).toBeInTheDocument();
  });

  it("shows load more button when hasMore is true", () => {
    const mockLoadMore = jest.fn();
    
    render(
      <TransactionsList
        transactions={mockTransactions}
        isLoading={false}
        hasMore={true}
        onLoadMore={mockLoadMore}
      />
    );

    expect(screen.getByText("Load More Transactions")).toBeInTheDocument();
  });
});
