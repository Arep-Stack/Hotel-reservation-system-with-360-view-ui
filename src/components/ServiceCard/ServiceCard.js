import {
  Badge,
  Box,
  Button,
  Flex,
  Group,
  Image,
  Paper,
  Text,
} from '@mantine/core';

import {
  Icon360,
  IconBuildingSkyscraper,
  IconUsers,
} from '@tabler/icons-react';

function ServiceCard({ image, type, persons, price, amenities }) {
  return (
    <Paper maw="350px" radius="8px" withBorder>
      <Box h="200px" w="100%">
        <Image src={image} w="100%" h="100%" style={{ borderRadius: '8px' }} />
      </Box>

      <Box px="lg">
        <Flex
          justify="space-between"
          align="center"
          py="md"
          style={{
            borderBottom: '2px solid #868e96',
          }}
        >
          <div>
            <Text size="xl" fw={900} c="#006400">
              {type}
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
          <Text color="darkGreen">Amenities</Text>
          <Group gap={7} mt={5}>
            {amenities.map((a) => (
              <Badge color="dark" variant="light" key={a}>
                {a}
              </Badge>
            ))}
          </Group>
        </Box>

        <Flex py="md" align="center" gap={5}>
          <Button
            color="#006400"
            fullWidth
            leftSection={<IconBuildingSkyscraper />}
          >
            Book Now
          </Button>
          <Button
            color="darkGreen"
            fullWidth
            rightSection={<Icon360 />}
            variant="light"
          >
            View Room
          </Button>
        </Flex>
      </Box>
    </Paper>
  );
}

export default ServiceCard;
