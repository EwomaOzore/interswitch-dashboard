import React from "react";
import { Account } from "../lib/api-client";
import { formatCurrency, maskAccountNumber } from "../lib/utils";
import { format } from "date-fns";

interface AccountCardProps {
  account: Account;
  onClick?: (account: Account) => void;
  showBalance?: boolean;
}

export function AccountCard({
  account,
  onClick,
  showBalance = true,
}: Readonly<AccountCardProps>) {
  const [isBalanceVisible, setIsBalanceVisible] = React.useState(false);

  const handleToggleBalance = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBalanceVisible(!isBalanceVisible);
  };

  const getAccountTypeColor = (type: Account["accountType"]) => {
    switch (type) {
      case "Savings":
        return "bg-success text-white";
      case "Current":
        return "bg-interswitch-primary text-white";
      case "Loan":
        return "bg-danger text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  return (
    <button
      type="button"
      className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer w-full text-left"
      onClick={() => onClick?.(account)}
      aria-label={`${account.accountType} account ending in ${account.accountNumber.slice(-4)}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getAccountTypeColor(
              account.accountType,
            )}`}
          >
            {account.accountType}
          </span>
          <span className="text-gray-600 font-mono text-sm">
            {maskAccountNumber(account.accountNumber)}
          </span>
        </div>
        <div
          className={`w-3 h-3 rounded-full ${
            account.status === "active" ? "bg-success" : "bg-danger"
          }`}
          aria-label={`Account status: ${account.status}`}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 text-sm">Current Balance</span>
          {showBalance && (
            <button
              onClick={handleToggleBalance}
              className="text-interswitch-primary hover:text-interswitch-dark text-sm"
              aria-label={isBalanceVisible ? "Hide balance" : "Show balance"}
            >
              {isBalanceVisible ? "Hide" : "Show"}
            </button>
          )}
        </div>
        <div className="text-2xl font-bold text-gray-800">
          {showBalance && isBalanceVisible
            ? formatCurrency(account.balance, account.currency)
            : "••••••"}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Last Transaction</span>
          <span>
            {format(new Date(account.lastTransactionDate), "MMM dd, yyyy")}
          </span>
        </div>
      </div>
    </button>
  );
}
