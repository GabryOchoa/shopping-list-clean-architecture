import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MemberRow from '../../components/MemberRow';
import { useAuth } from '../../context/AuthContext';

jest.mock('../../context/AuthContext');

const mockMember = {
  id: 'member-1',
  list_id: 'list-1',
  user_id: 'user-1',
  role: 'viewer' as const,
  joined_at: '2024-01-01T00:00:00Z',
  profile: {
    id: 'user-1',
    email: 'user@example.com',
    display_name: 'Test User',
    avatar_url: null,
  },
};

const defaultProps = {
  member: mockMember,
  isOwner: false,
  onChangeRole: jest.fn(),
  onRemove: jest.fn(),
};

describe('MemberRow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'current-user' },
    });
  });

  it('should render member name and email', async () => {
    const { getByText } = await render(<MemberRow {...defaultProps} />);

    expect(getByText('Test User')).toBeTruthy();
    expect(getByText('user@example.com')).toBeTruthy();
  });

  it('should render display name or email fallback', async () => {
    const memberWithoutName = {
      ...mockMember,
      profile: { ...mockMember.profile, display_name: null },
    };
    const { getByText } = await render(
      <MemberRow {...defaultProps} member={memberWithoutName} />,
    );

    expect(getByText('—')).toBeTruthy();
  });

  it('should show role badge', async () => {
    const { getByText } = await render(<MemberRow {...defaultProps} />);

    expect(getByText('viewer')).toBeTruthy();
  });

  it('should show role toggle for owner viewing other members', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'current-user' },
    });

    const { getByText } = await render(
      <MemberRow {...defaultProps} isOwner={true} />,
    );

    expect(getByText('viewer')).toBeTruthy();
  });

  it('should not show role toggle for non-owner', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'current-user' },
    });

    const { getByText } = await render(
      <MemberRow {...defaultProps} isOwner={false} />,
    );

    expect(getByText('viewer')).toBeTruthy();
  });

  it('should call onChangeRole when role badge is pressed by owner', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'current-user' },
    });

    const { getByText } = await render(
      <MemberRow {...defaultProps} isOwner={true} />,
    );

    fireEvent.press(getByText('viewer'));

    expect(defaultProps.onChangeRole).toHaveBeenCalledWith(
      'member-1',
      'editor',
    );
  });

  it('should show remove button for owner removing other members', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'current-user' },
    });

    const { getByText } = await render(
      <MemberRow {...defaultProps} isOwner={true} />,
    );

    expect(getByText('Remove')).toBeTruthy();
  });

  it('should show leave button for current user', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
    });

    const { getByText } = await render(<MemberRow {...defaultProps} />);

    expect(getByText('Leave')).toBeTruthy();
  });

  it('should show (you) for current user', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
    });

    const { getByText } = await render(<MemberRow {...defaultProps} />);

    expect(getByText('(you)')).toBeTruthy();
  });

  it('should not show remove button for non-owner viewing other members', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'current-user' },
    });

    const { queryByText } = await render(
      <MemberRow {...defaultProps} isOwner={false} />,
    );

    expect(queryByText('Remove')).toBeNull();
  });

  it('should calculate initials from display_name', async () => {
    const { getByText } = await render(<MemberRow {...defaultProps} />);

    expect(getByText('TE')).toBeTruthy();
  });

  it('should calculate initials from email when display_name is null', async () => {
    const memberWithoutName = {
      ...mockMember,
      profile: { ...mockMember.profile, display_name: null },
    };
    const { getByText } = await render(
      <MemberRow {...defaultProps} member={memberWithoutName} />,
    );

    expect(getByText('US')).toBeTruthy();
  });
});
