import { useNavigate } from 'react-router-dom';

import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
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
      <Flex mih="100vh" align="center" justify="center" direction="column">
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
          onClick={() => navigate('/Services')}
        >
          Book Now
        </Button>
      </Flex>

      <Flex
        mt="lg"
        mih="100vh"
        align="center"
        direction="column"
        pos="relative"
      >
        <svg
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'absolute',
            top: '-5.5rem',
            zIndex: -1,
          }}
        >
          <path
            fill="#24A148"
            d="M57.1,-66.6C71.7,-55.7,79.8,-35.6,80.7,-16.3C81.6,3,75.4,21.4,65.1,36.2C54.9,50.9,40.7,61.9,24.6,68C8.4,74.1,-9.7,75.3,-27.5,70.8C-45.2,66.4,-62.5,56.2,-71.6,41.1C-80.7,25.9,-81.6,5.7,-77.8,-13.3C-74,-32.4,-65.5,-50.2,-51.8,-61.2C-38,-72.3,-19,-76.5,1.1,-77.8C21.2,-79.2,42.4,-77.5,57.1,-66.6Z"
            transform="translate(100 100)"
          />
        </svg>
        <Text color="darkGreen" size="3rem" align="center" mb="lg">
          Stay Cool, Stay Cozy, Stay with Us!
        </Text>

        <Flex maw="500px" w="100%" justify="center" my="lg">
          {serviceNumbers.map((s) => {
            return (
              <>
                <Box px="sm">
                  <Text size="4rem" color="white" align="center">
                    {s.quantity}
                  </Text>
                  <Text size="2.5rem" color="white" align="center">
                    {s.service}
                  </Text>
                </Box>
              </>
            );
          })}
        </Flex>

        <Grid my="xl">
          <Grid.Col span={6}>
            <Image
              style={{
                borderRadius: 30,
              }}
              mah="200px"
              src="https://scontent.fmnl4-6.fna.fbcdn.net/v/t39.30808-6/308624807_132445899537476_1747003690961335169_n.jpg?stp=cp6_dst-jpg&_nc_cat=108&ccb=1-7&_nc_sid=5f2048&_nc_eui2=AeHfgHn1GMh5yXPO34_boAUEetj0OsbQJ7R62PQ6xtAntDwex5yFe_ohIZyfZAQEDllEzsV42ShBKaisgdfOZWKf&_nc_ohc=Z6wLW212KqoAX9d3kQw&_nc_ht=scontent.fmnl4-6.fna&oh=00_AfBG3it8nYykgrZEgM0ZHRQNlDWYAjTwDxaCOXlI0yjESw&oe=654CB265"
            />
            <Image
              style={{
                borderRadius: 30,
              }}
              mah="200px"
              my="lg"
              src="https://scontent.fmnl4-4.fna.fbcdn.net/v/t39.30808-6/292546595_113775191387940_8649513159384488735_n.jpg?stp=cp6_dst-jpg&_nc_cat=109&ccb=1-7&_nc_sid=5f2048&_nc_eui2=AeGBZ5XGOf9_LBlUPC-1n7H2awu-8kG5Bf1rC77yQbkF_QZ2wfwuYCctkQACKAQSDV1pxcK5m18WUnsmEYafmU8O&_nc_ohc=7Abo2HpYWqIAX8E0AOp&_nc_ht=scontent.fmnl4-4.fna&oh=00_AfDK6bbgsIfCQ2pACPyZNt9p3xlew7YGSNXCn8mmM6no3A&oe=654B8406"
            />
            <Image
              style={{
                borderRadius: 30,
              }}
              mah="200px"
              src="https://scontent.fmnl4-2.fna.fbcdn.net/v/t39.30808-6/291806165_109402505158542_1266772049647795146_n.jpg?stp=cp6_dst-jpg&_nc_cat=105&ccb=1-7&_nc_sid=5f2048&_nc_eui2=AeF2yXZuxKcq2YCuZfz3UQ51iK-GZeMk73mIr4Zl4yTveZKe1c2GzOMbfeF4lRyQDtGyFJY6PMPOj0t0FfPpoa8Y&_nc_ohc=GmnvqWXZC1EAX-uJ6Q_&_nc_ht=scontent.fmnl4-2.fna&oh=00_AfDZAjwvU6Qio6EYrMCJRz48fiNfWQ5sGzn-2pByIjs-bw&oe=654B81F9"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Text size="2.5rem" color="white" mb="md">
              Perfect for Events!
            </Text>
            <Text fw="600" maw="400px" color="#1e1e1e">
              Elevate your event experience at Felrey's versatile event halls
              and pavilions, meticulously designed to accommodate a range of
              gatherings. Immerse yourself in a gastronomic fusion that
              intertwines the rich cultural tapestry of Amorita with a
              tantalizing array of global culinary delights, meticulously
              prepared to tantalize every palate. Embrace the spirit of
              celebration as our expert chefs craft an exquisite menu that
              seamlessly blends traditional Filipino favorites with
              international cuisines, catering to every discerning taste.
              Enhance the ambiance with our carefully curated selection of wines
              sourced from renowned vineyards, perfectly complementing the
              diverse flavors on offer. Imbibe in the artistry of our
              mixologists as they craft signature cocktails tailored to your
              event, infusing each sip with an air of sophistication and luxury.
              At Felrey, every event is transformed into a cherished and
              unforgettable experience, leaving a lasting impression on every
              guest.
            </Text>
          </Grid.Col>
        </Grid>
        <Button
          fw="normal"
          rightSection={<IconArrowBadgeRightFilled />}
          w="100%"
          maw="200px"
          mb="xl"
          size="lg"
          color="#006400"
          onClick={() => navigate('/Services')}
        >
          Explore More
        </Button>
      </Flex>

      <Flex
        mt="lg"
        mih="100vh"
        align="center"
        direction="column"
        pos="relative"
      >
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

const serviceNumbers = [
  {
    quantity: 18,
    service: 'ROOMS',
  },
  {
    quantity: 5,
    service: 'POOLS',
  },
  {
    quantity: 3,
    service: 'PAVILIONS',
  },
];
