import { useNavigate } from 'react-router-dom';

import {
  Box,
  Button,
  Container,
  Flex,
  Group,
  Image,
  Loader,
  Text,
} from '@mantine/core';
import { IconArrowBadgeRightFilled } from '@tabler/icons-react';

import './Home.css';
import { GoogleMapEmbed } from './GoogleMapEmbed';

function Home() {
  const navigate = useNavigate();

  return (
    <Container size="xl" mih="100vh" px="lg">
      <Flex h="100vh" align="center" justify="center" direction="column">
        <Text className="home-hero-text">Felrey</Text>
        <Text mb="xl" fw={900} size="5rem" c="darkGreen">
          Resort and Pavilion
        </Text>
        <Text mb="xl" size="3rem">
          Discover Great Deals Today!
        </Text>
        <Button
          fw="normal"
          rightSection={<IconArrowBadgeRightFilled />}
          w="100%"
          maw="400px"
          size="xl"
          color="#006400"
          onClick={() => navigate('/Reservation')}
        >
          Book Now
        </Button>
      </Flex>
      <Flex h="100vh" align="center" direction="column" pos="relative">
        <Text color="darkGreen" size="3rem" align="center" mb="lg">
          We are on Google Maps!
        </Text>

        <Box w="100%" pos="relative">
          <Flex
            direction="column"
            align="center"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: -1,
            }}
          >
            <Loader color="darkGreen" />
            <Text>Loading Google Maps...</Text>
          </Flex>

          <GoogleMapEmbed />
        </Box>

        <Text align="center" my="lg">
          Also available:
        </Text>

        <Flex w="100%" maw="700px" justify="space-between">
          <Flex
            w="100%"
            direction="column"
            align="center"
            p="md"
            mx="sm"
            style={{
              borderRadius: '30px',
              boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
            }}
          >
            <Image
              h="75px"
              w="75px"
              src="https://cdn.iconscout.com/icon/free/png-256/free-waze-1-722645.png"
            />
            <Text align="center">Waze</Text>
          </Flex>
          <Flex
            w="100%"
            direction="column"
            align="center"
            p="md"
            mx="sm"
            style={{
              borderRadius: '30px',
              boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
            }}
          >
            <Group align="center">
              <Image
                h="50"
                src="https://cdn.iconscout.com/icon/free/png-256/free-apple-881-722676.png"
              />
              <Text ml={-20} size="4rem">
                Maps
              </Text>
            </Group>
            <Text align="center">Apple Maps</Text>
          </Flex>
        </Flex>
      </Flex>
    </Container>
  );
}

export default Home;
