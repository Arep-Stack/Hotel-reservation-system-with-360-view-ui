import { Box, Container, Flex, Image, Text } from '@mantine/core';
import React from 'react';

import about from './data.json';

function About() {
  return (
    <Container size="xl" mih="100vh" pt={90} px="lg">
      <Flex w="100%" mb="lg" justify="space-between" align="center">
        <Text size="5rem">{about.tagline}</Text>
        <Image
          h="350px"
          src="https://cdn3d.iconscout.com/3d/premium/thumb/coconut-drink-9061354-7342114.png"
        />
      </Flex>

      <Flex mb="lg">
        <Box
          w="100%"
          p="lg"
          mr="md"
          style={{
            borderRadius: '30px',
            boxShadow:
              '0px 0px 5px 1px rgba(85,179,111,1), 0px 1px 4px 0px rgba(0,0,0,0.11)',
          }}
        >
          <Text align="center" size="2rem" mb="md" fw={600}>
            Our Story
          </Text>
          <Text mb="md">{about.ourStory1}</Text>
          <Text>{about.ourStory2}</Text>
        </Box>
        <Flex direction="column" w="100%" ml="md">
          <Box
            h="100%"
            p="lg"
            mb="sm"
            style={{
              borderRadius: '30px',
              boxShadow:
                '0px 0px 5px 1px rgba(85,179,111,1), 0px 1px 4px 0px rgba(0,0,0,0.11)',
            }}
          >
            <Text align="center" size="2rem" mb="md" fw={600}>
              Our Mission
            </Text>
            <Text>{about.mission}</Text>
          </Box>
          <Box
            h="100%"
            p="lg"
            style={{
              borderRadius: '30px',
              boxShadow:
                '0px 0px 5px 1px rgba(85,179,111,1), 0px 1px 4px 0px rgba(0,0,0,0.11)',
            }}
          >
            <Text align="center" size="2rem" mb="md" fw={600}>
              Our Vision
            </Text>
            <Text>{about.vision}</Text>
          </Box>
        </Flex>
      </Flex>

      <Box
        pos="relative"
        p="lg"
        mb="lg"
        style={{
          borderRadius: '30px',
          boxShadow:
            '0px 0px 5px 1px rgba(85,179,111,1), 0px 1px 4px 0px rgba(0,0,0,0.11)',
        }}
      >
        <Image
          h="350px"
          w="350px"
          style={{
            position: 'absolute',
            zIndex: -1,
            right: 0,
            top: -150,
          }}
          src="https://cdn3d.iconscout.com/3d/premium/thumb/beach-cooler-9061355-7342115.png"
        />
        <Text size="2rem" mb="lg" fw={600}>
          It's you, who drives us
        </Text>
        <Text>{about.drives}</Text>
      </Box>

      <Flex></Flex>
    </Container>
  );
}

export default About;
