import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ItemRow from '../../components/ItemRow';

const mockItem = {
  id: 'item-1',
  list_id: 'list-1',
  name: 'Milk',
  quantity: 2,
  is_checked: false,
  created_at: '2024-01-01T00:00:00Z',
};

const defaultProps = {
  item: mockItem,
  onToggle: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
};

describe('ItemRow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render item name and quantity', async () => {
    const { getByText } = await render(
      <ItemRow {...defaultProps} role="owner" />,
    );

    expect(getByText('Milk')).toBeTruthy();
    expect(getByText('Qty: 2')).toBeTruthy();
  });

  it('should not show quantity when quantity is 1', async () => {
    const itemWithQuantity1 = { ...mockItem, quantity: 1 };
    const { queryByText } = await render(
      <ItemRow {...defaultProps} item={itemWithQuantity1} role="owner" />,
    );

    expect(queryByText('Qty: 1')).toBeNull();
  });

  it('should show edit and delete buttons for owner', async () => {
    const { getByText } = await render(
      <ItemRow {...defaultProps} role="owner" />,
    );

    expect(getByText('Edit')).toBeTruthy();
    expect(getByText('Delete')).toBeTruthy();
  });

  it('should show edit and delete buttons for editor', async () => {
    const { getByText } = await render(
      <ItemRow {...defaultProps} role="editor" />,
    );

    expect(getByText('Edit')).toBeTruthy();
    expect(getByText('Delete')).toBeTruthy();
  });

  it('should not show edit and delete buttons for viewer', async () => {
    const { queryByText } = await render(
      <ItemRow {...defaultProps} role="viewer" />,
    );

    expect(queryByText('Edit')).toBeNull();
    expect(queryByText('Delete')).toBeNull();
  });

  it('should call onToggle when checkbox is pressed', async () => {
    const { getByTestId } = await render(
      <ItemRow {...defaultProps} role="owner" />,
    );

    fireEvent.press(getByTestId('checkbox'));

    expect(defaultProps.onToggle).toHaveBeenCalledWith('item-1', true);
  });

  it('should call onEdit when edit button is pressed', async () => {
    const { getByText } = await render(
      <ItemRow {...defaultProps} role="owner" />,
    );

    fireEvent.press(getByText('Edit'));

    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockItem);
  });

  it('should render checked item name', async () => {
    const checkedItem = { ...mockItem, is_checked: true };
    const { getByText } = await render(
      <ItemRow {...defaultProps} item={checkedItem} role="owner" />,
    );

    expect(getByText('Milk')).toBeTruthy();
  });
});
