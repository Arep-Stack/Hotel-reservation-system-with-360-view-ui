import { useNavigate } from 'react-router-dom';

import heroBgImg from '../../assets/home/heroImg.png';
import './Home.css';

import { Box, Button, Container, Flex, Image, Text } from '@mantine/core';
import { IconArrowBadgeRightFilled } from '@tabler/icons-react';

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Image className="home-img" src={heroBgImg} />
      <Container fluid h="100vh" pt={90} px="lg">
        <Flex
          c="white"
          h="100%"
          w="100%"
          direction="column"
          justify="center"
          align="center"
        >
          <Box>
            <Text
              className="home-hero-text"
              size="3.5rem"
              tt="uppercase"
              lts="10px"
              mb="md"
            >
              Welcome to
            </Text>

            <Text
              className="home-hero-text title"
              size="5.5rem"
              lts="5px"
              mt="md"
            >
              Felrey Resort and Pavilion
            </Text>
          </Box>

          <Button
            onClick={() => navigate('/Reservation')}
            tt="uppercase"
            size="lg"
            color="themeColors"
            variant="filled"
            lts="5px"
            mt="3rem"
            style={{ wordSpacing: '10px' }}
            rightSection={<IconArrowBadgeRightFilled />}
          >
            Book now
          </Button>
        </Flex>
      </Container>
    </div>
  );
}

export default Home;
