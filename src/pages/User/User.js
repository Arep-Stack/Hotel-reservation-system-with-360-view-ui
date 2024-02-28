import { Container, Paper } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminMenu from '../../components/AdminComponents/AdminMenu';
import NavbarUser from '../../components/Navbar/NavbarUser';
import UserMenu from '../../components/UserComponents/UserMenu';
import { getUser } from '../../utils/user';

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
    <Container size="xl" mih="100vh" p="md">
      <NavbarUser firstName={user?.FIRSTNAME} />
      <Paper
        withBorder
        p="md"
        radius={18}
        style={{
          borderColor: 'darkgreen',
        }}
      >
        {user?.IS_ADMIN ? <AdminMenu /> : <UserMenu />}
      </Paper>
    </Container>
  );
}

export default User;
