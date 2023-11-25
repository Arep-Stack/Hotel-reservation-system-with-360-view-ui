import { useNavigate } from 'react-router-dom';

import { logOut } from '../../utils/user';

import { Avatar, Button, Flex, Paper } from '@mantine/core';

import { IconLogout } from '@tabler/icons-react';

function NavbarUser({ firstName }) {
  const navigator = useNavigate();
  const avatarLetter = firstName ? firstName[0] : '';
  return (
    <Paper w="100%" p="md" mb="md" withBorder radius={18}>
      <Flex w="100%" align="center" justify="space-between">
        <Avatar radius="xl" variant="filled" mr="lg" color="darkgreen">
          {avatarLetter}
        </Avatar>
        <Button
          onClick={() => {
            logOut();
            navigator('/Login'); // Change when useContext is used
          }}
          rightSection={<IconLogout />}
          color="#006400"
          fw="normal"
        >
          Log out
        </Button>
      </Flex>
    </Paper>
  );
}

export default NavbarUser;
