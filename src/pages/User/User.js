import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import NavbarUser from '../../components/Navbar/NavbarUser';
import UserMenu from '../../components/UserComponents/UserMenu';

import { getUser } from '../../utils/user';

import { Container, Paper } from '@mantine/core';

function User() {
  const navigator = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = getUser();

    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigator('/Login'); // Change when useContext is used
    }
  }, [navigator]);

  return (
    <Container size="xl" mih="100vh" p="lg">
      <NavbarUser firstName={user?.FIRSTNAME} />
      <Paper withBorder p="md" radius={18}>
        <UserMenu />
      </Paper>
    </Container>
  );
}

export default User;
