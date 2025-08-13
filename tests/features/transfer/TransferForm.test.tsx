import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransferForm } from '../../../src/features/transfer/components/TransferForm';
import { Account } from '../../../src/lib/api-client';

jest.mock('../../../src/lib/mock-api', () => ({
  validateAccountNumber: jest.fn(async () => ({ isValid: true, accountHolderName: 'Test User', bankName: 'Interswitch Bank' }))
}));

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
    render(<TransferForm accounts={mockAccounts} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByText("Transfer Funds");
    fireEvent.click(submitButton);

    await waitFor(() => {
      const btn = screen.getByText(/from account/i).closest('div')?.querySelector('button');
      expect(btn).toHaveClass('border-red-500');
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
    render(<TransferForm accounts={mockAccounts} onSubmit={mockOnSubmit} />);

    const sourceDropdown = screen.getByText(/from account/i).closest('div')?.querySelector('button');
    fireEvent.click(sourceDropdown!);
    
    const firstOption = screen.getByText(/Savings - \*\*\*\*7890/);
    fireEvent.click(firstOption);

    const amountInput = screen.getByLabelText(/amount/i);
    fireEvent.change(amountInput, { target: { value: '200000' } });

    fireEvent.blur(amountInput);

    await waitFor(() => {
      expect(
        screen.getByText(/amount exceeds available balance/i),
      ).toBeInTheDocument();
    });

    const submitButton = screen.getByText("Transfer Funds");
    expect(submitButton).toBeDisabled();
  });

  it("enables submit with valid data (no validation errors)", async () => {
    render(<TransferForm accounts={mockAccounts} onSubmit={mockOnSubmit} />);

    const sourceDropdown = screen.getByText(/from account/i).closest('div')?.querySelector('button');
    fireEvent.click(sourceDropdown!);
    const firstOption = screen.getByText(/Savings - \*\*\*\*7890/);
    fireEvent.click(firstOption);

    const acctInput = screen.getByLabelText(/to account number/i) as HTMLInputElement;
    fireEvent.change(acctInput, { target: { value: '1111111111' } });

    const amountInput = screen.getByLabelText(/amount/i) as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '5000' } });

    const descInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
    fireEvent.change(descInput, { target: { value: 'Test transfer' } });

    const pinInput = screen.getByLabelText(/transaction pin/i) as HTMLInputElement;
    fireEvent.change(pinInput, { target: { value: '1234' } });

    const submitButton = screen.getByText('Transfer Funds');
    expect(submitButton).not.toBeDisabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
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
