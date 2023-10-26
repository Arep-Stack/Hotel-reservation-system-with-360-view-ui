import { Button, Flex, Image, Paper, Text } from '@mantine/core';
import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import './Navbar.css';

const nav = ['Home', 'Reservation', 'About', 'Login', 'Sign Up'];

function Navbar() {
  const [activePage, setActivePage] = useState('Home');

  useEffect(() => {
    const url = window.location.pathname.split('/');
    const path = url[url.length - 1];

    setActivePage(path ? path : 'Home');
  }, []);

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

  const navMenu = nav.map((nav) => (
    <>
      {nav === 'Login' && <hr />}
      <Button
        key={nav}
        onClick={() => navigate(nav)}
        variant={activePage === nav ? 'filled' : 'outline'}
      >
        {nav}
      </Button>
    </>
  ));

  return (
    <Paper className="nav" shadow="md">
      <Flex align="center">
        <Image
          h="40px"
          mr="md"
          src="https://cdn-icons-png.flaticon.com/512/887/887345.png"
        />
        <Text size="lg">Felrey Resort and Pavilion</Text>
      </Flex>
      <Flex gap={10}>{navMenu}</Flex>
    </Paper>
  );
}

export default Navbar;
