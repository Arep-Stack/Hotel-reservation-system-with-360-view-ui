import {
  Box,
  Container,
  Flex,
  Group,
  Image,
  Loader,
  Text,
} from '@mantine/core';

import { GoogleMapEmbed } from './GoogleMapEmbed';
import './Home.css';

function Home() {
  return (
    <Container size="xl" mih="100vh" px="lg">
      <Flex
        mih="100vh"
        w="100%"
        align="center"
        justify="center"
        direction="column"
      >
        <Text className="home-hero-text">Felrey</Text>

        <Flex direction="column" w="100%" mt={-25}>
          <Text color="darkgreen" size="3rem" align="center" mb="lg">
            Go on a tour!
          </Text>
          <Flex direction="row" gap="md" w="100%">
            <iframe
              title="360 Tour"
              width="100%"
              allowFullScreen
              style={{
                flex: 1,
                minHeight: '500px',
                height: 'calc(100vh - 28rem)',
                border: 0,
                boxShadow:
                  '0px 0px 5px 1px rgba(85,179,111,1), 0px 1px 4px 0px rgba(0,0,0,0.11)',
              }}
              src="https://cdn.pannellum.org/2.5/pannellum.htm#config=https://gist.githubusercontent.com/arepstack/d43a7bbac2285211e57acf8939ab5c7e/raw/a46d5ee5e800b3ab3cffb66fb4c8ac28aa3636e0/tour-360.json"
            ></iframe>
          </Flex>
        </Flex>
      </Flex>

      <Flex
        mt="lg"
        mih="100vh"
        align="center"
        direction="column"
        pos="relative"
      >
        <Text color="darkgreen" size="3rem" align="center" mb="lg">
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
            <Loader color="darkgreen" />
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
            <Text align="center" mt="auto">
              Waze
            </Text>
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
            <Text align="center" mt="auto">
              Apple Maps
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Container>
  );
}

export default Home;
