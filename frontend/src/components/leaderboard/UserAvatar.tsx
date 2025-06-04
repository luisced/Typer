import React from 'react';
import { Avatar, AvatarBadge } from '@chakra-ui/react';
import type { LeaderboardUser } from '../../utils/api';

interface UserAvatarProps {
  user: LeaderboardUser;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user }) => {
  return (
    <Avatar
      size="sm"
      name={user.name}
      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
    >
      {user.badges.includes('mythical') && (
        <AvatarBadge
          boxSize="1em"
          bg="purple.500"
          borderColor="purple.500"
        />
      )}
    </Avatar>
  );
}; 