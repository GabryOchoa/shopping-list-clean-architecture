import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ListCard from '../../components/ListCard';

const mockList = {
  id: 'list-1',
  owner_id: 'user-1',
  name: 'Groceries',
  description: 'Weekly groceries',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const defaultProps = {
  list: mockList,
  onPress: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
};

describe('ListCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render list name and description', async () => {
    const { getByText } = await render(
      <ListCard {...defaultProps} role="owner" />,
    );

    expect(getByText('Groceries')).toBeTruthy();
    expect(getByText('Weekly groceries')).toBeTruthy();
  });

  it('should show role badge for non-owner', async () => {
    const { getByText } = await render(
      <ListCard {...defaultProps} role="editor" />,
    );

    expect(getByText('editor')).toBeTruthy();
  });

  it('should not show role badge for owner', async () => {
    const { queryByText } = await render(
      <ListCard {...defaultProps} role="owner" />,
    );

    expect(queryByText('owner')).toBeNull();
  });

  it('should show edit and delete buttons for owner', async () => {
    const { getByText } = await render(
      <ListCard {...defaultProps} role="owner" />,
    );

    expect(getByText('Edit')).toBeTruthy();
    expect(getByText('Delete')).toBeTruthy();
  });

  it('should not show edit and delete buttons for non-owner', async () => {
    const { queryByText } = await render(
      <ListCard {...defaultProps} role="editor" />,
    );

    expect(queryByText('Edit')).toBeNull();
    expect(queryByText('Delete')).toBeNull();
  });

  it('should call onPress when card is pressed', async () => {
    const { getByText } = await render(
      <ListCard {...defaultProps} role="owner" />,
    );

    fireEvent.press(getByText('Groceries'));

    expect(defaultProps.onPress).toHaveBeenCalledWith(mockList);
  });

  it('should call onEdit when edit button is pressed', async () => {
    const { getByText } = await render(
      <ListCard {...defaultProps} role="owner" />,
    );

    fireEvent.press(getByText('Edit'));

    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockList);
  });

  it('should have a delete button', async () => {
    const { getByText } = await render(
      <ListCard {...defaultProps} role="owner" />,
    );

    const deleteButton = getByText('Delete');
    expect(deleteButton).toBeTruthy();
  });

  it('should not show description when not provided', async () => {
    const listWithoutDescription = { ...mockList, description: null };
    const { queryByText } = await render(
      <ListCard {...defaultProps} list={listWithoutDescription} role="owner" />,
    );

    expect(queryByText('Weekly groceries')).toBeNull();
  });

  it('should render created date', async () => {
    const { getByText } = await render(
      <ListCard {...defaultProps} role="owner" />,
    );

    expect(
      getByText(new Date(mockList.created_at).toLocaleDateString()),
    ).toBeTruthy();
  });
});
