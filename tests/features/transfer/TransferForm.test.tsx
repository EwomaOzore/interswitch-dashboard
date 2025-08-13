import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransferForm } from '../../../src/features/transfer/components/TransferForm';
import { Account } from '../../../src/lib/api';

const mockAccounts: Account[] = [
  {
    id: "1",
    accountNumber: "1234567890",
    accountType: "Savings",
    balance: 150000,
    currency: "NGN",
    lastTransactionDate: "2024-01-10T10:30:00Z",
    status: "active",
  },
  {
    id: "2",
    accountNumber: "0987654321",
    accountType: "Current",
    balance: 75000,
    currency: "NGN",
    lastTransactionDate: "2024-01-09T14:15:00Z",
    status: "active",
  },
];

describe("TransferForm", () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all form fields", () => {
    render(<TransferForm accounts={mockAccounts} onSubmit={mockOnSubmit} />);

    expect(screen.getByText(/from account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/to account number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/transaction pin/i)).toBeInTheDocument();
  });

  it("displays available balance when source account is selected", async () => {
    const user = userEvent.setup();
    render(<TransferForm accounts={mockAccounts} onSubmit={mockOnSubmit} />);

    const sourceDropdown = screen.getByText(/from account/i).closest('div')?.querySelector('button');
    expect(sourceDropdown).toBeInTheDocument();
    
    await user.click(sourceDropdown!);
    
    const firstOption = screen.getByText(/Savings - \*\*\*\*7890/);
    await user.click(firstOption);

    expect(screen.getByText(/available balance/i)).toBeInTheDocument();
    const balanceElements = screen.getAllByText(/₦150,000.00/);
    expect(balanceElements).toHaveLength(2);
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();
    render(<TransferForm accounts={mockAccounts} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByText("Transfer Funds");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/please select a source account/i),
      ).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("validates account number format", async () => {
    const user = userEvent.setup();
    render(<TransferForm accounts={mockAccounts} onSubmit={mockOnSubmit} />);

    const accountInput = screen.getByLabelText(/to account number/i);
    await user.type(accountInput, "123");

    fireEvent.blur(accountInput);

    await waitFor(() => {
      expect(
        screen.getByText(/account number must be at least 10 digits/i),
      ).toBeInTheDocument();
    });
  });

  it("prevents transfer when amount exceeds balance", async () => {
    const user = userEvent.setup();
    render(<TransferForm accounts={mockAccounts} onSubmit={mockOnSubmit} />);

    const sourceDropdown = screen.getByText(/from account/i).closest('div')?.querySelector('button');
    await user.click(sourceDropdown!);
    
    const firstOption = screen.getByText(/Savings - \*\*\*\*7890/);
    await user.click(firstOption);

    const amountInput = screen.getByLabelText(/amount/i);
    await user.type(amountInput, "200000");

    fireEvent.blur(amountInput);

    await waitFor(() => {
      expect(
        screen.getByText(/amount exceeds available balance/i),
      ).toBeInTheDocument();
    });

    const submitButton = screen.getByText("Transfer Funds");
    expect(submitButton).toBeDisabled();
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    render(<TransferForm accounts={mockAccounts} onSubmit={mockOnSubmit} />);

    // Select source account
    const sourceDropdown = screen.getByText(/from account/i).closest('div')?.querySelector('button');
    await user.click(sourceDropdown!);
    const firstOption = screen.getByText(/Savings - \*\*\*\*7890/);
    await user.click(firstOption);
    
    await user.type(screen.getByLabelText(/to account number/i), "1111111111");
    await user.type(screen.getByLabelText(/amount/i), "5000");
    await user.type(screen.getByLabelText(/description/i), "Test transfer");
    await user.type(screen.getByLabelText(/transaction pin/i), "1234");

    await user.click(screen.getByText("Transfer Funds"));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        sourceAccountId: "1",
        beneficiaryAccountNumber: "1111111111",
        amount: 5000,
        description: "Test transfer",
        pin: "1234",
      });
    });
  });

  it("toggles PIN visibility", async () => {
    const user = userEvent.setup();
    render(<TransferForm accounts={mockAccounts} onSubmit={mockOnSubmit} />);

    const pinInput = screen.getByLabelText(/transaction pin/i);
    const toggleButton = screen.getByLabelText(/show pin/i);

    expect(pinInput).toHaveAttribute("type", "password");

    await user.click(toggleButton);
    expect(pinInput).toHaveAttribute("type", "text");

    await user.click(toggleButton);
    expect(pinInput).toHaveAttribute("type", "password");
  });
});
