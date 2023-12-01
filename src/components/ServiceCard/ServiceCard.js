import { Badge, Box, Flex, Group, Image, Paper, Text } from '@mantine/core';
import { IconUsers } from '@tabler/icons-react';

function ServiceCard({ name, image, price, persons, amenities, children }) {
  return (
    <Paper withBorder maw="350px" miw="300px" h="100%" radius="8px">
      <Box h="200px" w="100%">
        <Image
          src={
            image
              ? image
              : 'https://www.thespruce.com/thmb/2_Q52GK3rayV1wnqm6vyBvgI3Ew=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/put-together-a-perfect-guest-room-1976987-hero-223e3e8f697e4b13b62ad4fe898d492d.jpg'
          }
          w="100%"
          h="100%"
          style={{ borderRadius: '8px' }}
        />
      </Box>

      <Box px="lg" pb="sm">
        <Flex
          justify="space-between"
          align="center"
          py="md"
          gap={10}
          style={{
            borderBottom: '2px solid #868e96',
          }}
        >
          <div>
            <Text size="xl" fw={900} c="#006400">
              {name}
            </Text>
            <Flex align="center">
              <IconUsers color="#006400" size="16px" />
              <Text size="md" mt="-3" ml={3}>
                Up to {persons} person{persons > 1 ? 's' : ''}
              </Text>
            </Flex>
          </div>

          <Badge size="lg" variant="light" color="#006400">
            ₱ {price}
          </Badge>
        </Flex>

        <Box
          py="md"
          style={{
            borderBottom: '2px solid #868e96',
          }}
        >
          <Text color="darkgreen">Amenities</Text>
          <Group gap={7} mt={5}>
            {amenities?.map((a) => (
              <Badge color="dark" variant="light" key={a}>
                {a}
              </Badge>
            ))}
          </Group>
        </Box>

        <Box py="md">{children}</Box>
      </Box>
    </Paper>
  );
}

export default ServiceCard;
