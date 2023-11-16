import { useEffect, useState } from 'react';

import { Box, Group, Text } from '@mantine/core';
import { getUser } from '../../utils/user';

function Profile() {
  const [user, setUser] = useState(null); // Change when useContext is used

  useEffect(() => {
    const userData = getUser('__USER__DATA');

    if (userData) setUser(JSON.parse(userData));
  }, []);

  const renderUserDetails = () => {
    if (user) {
      return Object.keys(user).map((key) => (
        <Group
          key={key}
          my="md"
          justify="space-between"
          style={{
            borderBottom: '1px solid gray',
          }}
        >
          <Text>{key}</Text>
          <Text>
            {typeof user[key] === 'boolean'
              ? user[key]
                ? 'TRUE'
                : 'FALSE'
              : user[key]}
          </Text>
        </Group>
      ));
    }
  };

  return (
    <Box>
      <Text size="xl">Profile</Text>
      {renderUserDetails()}
    </Box>
  );
}

export default Profile;
