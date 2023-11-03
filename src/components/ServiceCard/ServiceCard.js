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
import { Icon360, IconBuildingSkyscraper } from '@tabler/icons-react';

function ServiceCard({ serviceCard }) {
  const services = serviceCard?.map((service) => {
    return (
      <Paper key={service.id} maw="350px" radius="8px" withBorder>
        <Box h="200px" w="100%">
          <Image
            src={service.image}
            w="100%"
            h="100%"
            style={{ borderRadius: '8px' }}
          />
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
              <Text size="xl" fw={900} c="themeColors">
                {service.type}
              </Text>
              <Text size="md" mt="-3">
                Up to {service.persons} person
              </Text>
            </div>

            <div>
              <Badge size="lg" variant="light" c="themeColors">
                {service.price}
              </Badge>
            </div>
          </Flex>

          <Box
            py="md"
            style={{
              borderBottom: '2px solid #868e96',
            }}
          >
            <Text color="darkGreen">Amenities</Text>
            <Group gap={7} mt={5}>
              {service.amenities.map((a) => (
                <Badge color="dark" variant="light" key={a}>
                  {a}
                </Badge>
              ))}
            </Group>
          </Box>

          <Flex py="md" align="center" gap={5}>
            <Button
              color="themeColors"
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
  });

  return <> {services} </>;
}

export default ServiceCard;
