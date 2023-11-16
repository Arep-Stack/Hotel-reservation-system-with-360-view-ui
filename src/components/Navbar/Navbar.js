import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import { Button, Flex, Image, Paper, Text } from '@mantine/core';

const nav = ['Home', 'Services', 'About', 'Login', 'SignUp'];

function Navbar() {
  const [activePage, setActivePage] = useState('Home');

  const navigator = useNavigate();
  const navigate = (page) => {
    if (page === '') {
      navigator('/');
      setActivePage('Home');
    } else {
      navigator(`/${page}`);
      setActivePage(page);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const url = window.location.pathname.split('/');

    const path = url.length > 2 ? url[url.length - 2] : url[url.length - 1];

    setActivePage(path ? path : 'Home');
  }, [navigator]);

  const navMenu = nav.map((nav) => (
    <div key={nav}>
      <Button
        onClick={() => navigate(nav)}
        color="themeColors"
        variant={activePage.includes(nav) ? 'filled' : 'outline'}
      >
        {nav === 'SignUp' ? 'Sign Up' : nav}
      </Button>
    </div>
  ));

  return (
    <Paper
      withBorder
      display={activePage === 'User' ? 'none' : 'block'}
      w="100%"
      h="80px"
      px="xl"
      py="lg"
      pos="fixed"
      top={0}
      shadow="md"
      style={{
        boxShadow: '0 16px 30px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(0.8px)',
        WebkitBackdropFilter: 'blur(0.8px)',
        zIndex: 1000,
      }}
    >
      <Flex align="center" justify="space-between">
        <Flex align="center">
          <Image
            h="40px"
            mr="md"
            src="https://cdn-icons-png.flaticon.com/512/887/887345.png"
          />
          <Text color="themeColors" size="xl" fw="bold">
            Felrey Resort and Pavilion
          </Text>
        </Flex>
        <Flex gap={10}>{navMenu}</Flex>
      </Flex>
    </Paper>
  );
}

export default Navbar;
