import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dropdown, DropdownOption } from '../../src/components/ui/Dropdown';

const mockOptions: DropdownOption[] = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

const defaultProps = {
  options: mockOptions,
  value: '',
  onChange: jest.fn(),
  placeholder: 'Select an option',
};

describe('Dropdown', () => {
  it('renders with placeholder when no value is selected', () => {
    render(<Dropdown {...defaultProps} />);
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('renders selected option label when value is provided', () => {
    render(<Dropdown {...defaultProps} value="option1" />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('shows dropdown options when clicked', () => {
    render(<Dropdown {...defaultProps} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('calls onChange when an option is selected', () => {
    const onChange = jest.fn();
    render(<Dropdown {...defaultProps} onChange={onChange} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const option1 = screen.getByText('Option 1');
    fireEvent.click(option1);
    
    expect(onChange).toHaveBeenCalledWith('option1');
  });

  it('closes dropdown after selection', () => {
    render(<Dropdown {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    
    const option1 = screen.getByText('Option 1');
    fireEvent.click(option1);
    
    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
  });

  it('renders with label when provided', () => {
    render(<Dropdown {...defaultProps} label="Test Label" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('applies disabled state correctly', () => {
    render(<Dropdown {...defaultProps} disabled />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('applies error state correctly', () => {
    render(<Dropdown {...defaultProps} error="Error message" />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});
