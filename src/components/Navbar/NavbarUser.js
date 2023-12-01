import { Avatar, Button, Flex, Paper } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

import { logOut } from '../../utils/user';

function NavbarUser({ firstName }) {
  const navigator = useNavigate();
  const avatarLetter = firstName ? firstName[0] : '';
  return (
    <Paper
      w="100%"
      p="md"
      mb="md"
      withBorder
      radius={18}
      style={{
        borderColor: 'darkgreen',
      }}
    >
      <Flex w="100%" align="center" justify="space-between">
        <Avatar radius="xl" variant="filled" mr="lg" color="darkgreen">
          {avatarLetter}
        </Avatar>
        <Button
          color="#006400"
          variant="outline"
          fw={400}
          rightSection={<IconLogout />}
          onClick={() => {
            logOut();
            navigator('/Login'); // Change when useContext is used
          }}
        >
          Log out
        </Button>
      </Flex>
    </Paper>
  );
}

export default NavbarUser;
