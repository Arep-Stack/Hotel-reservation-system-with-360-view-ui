import { Box, Card, Flex, Group, Text } from '@mantine/core';
import {
  IconMail,
  IconMapPin,
  IconPhone,
  IconUsers,
} from '@tabler/icons-react';
import moment from 'moment';
import { useEffect, useState } from 'react';

import { getUser } from '../../utils/user';

function UserProfile() {
  //fetching user
  const [user, setUser] = useState(null);

  //functions
  useEffect(() => {
    const userData = getUser();

    if (!!userData) setUser(JSON.parse(userData));
  }, []);

  return (
    <Box w="100%">
      <Card withBorder w={400} shadow="sm" radius="md" ml="auto" mr="auto">
        <Card.Section withBorder p="sm" bg="#006400">
          <Group justify="space-between">
            <Text fw={700} pt="md" pb="md" size="2rem" c="white">
              {user?.FIRSTNAME + ' ' + user?.LASTNAME}
            </Text>
          </Group>
        </Card.Section>

        <Flex pt="md" pb="md" direction="column" gap="md">
          <Group>
            <IconMail />
            <Text>{user?.EMAIL}</Text>
          </Group>

          <Group>
            <IconPhone />
            <Text>{user?.PHONE_NUMBER}</Text>
          </Group>

          <Group>
            <IconMapPin />
            <Text>{user?.ADDRESS}</Text>
          </Group>

          <Group>
            <IconUsers />
            <Text>Member since {moment(user?.DATE_ADDED).format('LL')}</Text>
          </Group>
        </Flex>
      </Card>
    </Box>
  );
}

export default UserProfile;
