import { Box, Button, Flex, Group, Text } from '@mantine/core';
import { Icon360, IconBuildingSkyscraper } from '@tabler/icons-react';
import axios from 'axios';
import { useEffect, useState } from 'react';

import ServiceCard from '../ServiceCard/ServiceCard';
import ComponentError from '../utils/ComponentError';
import ComponentLoader from '../utils/ComponentLoader';
import NoRecords from '../utils/NoRecords';

function UserReservation() {
  //fetching services
  const [services, setServices] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  //useEffect
  useEffect(() => {
    setIsFetching(true);
    axios({
      method: 'GET',
      url: '/services',
    })
      .then(({ data }) => {
        !!data && setServices(data);
      })
      .catch(() => {
        setFetchError('An error occurred');
      })
      .finally(() => setIsFetching(false));
  }, []);

  return (
    <Box pos="relative" mih={200}>
      <Text size="xl">Reservation</Text>

      {isFetching && <ComponentLoader message="Fetching services" />}
      {!isFetching && fetchError && <ComponentError message={fetchError} />}
      {['Room', 'Pavilion', 'Pool'].map((s) => (
        <Flex
          pos="relative"
          align="center"
          justify="center"
          direction="column"
          gap="md"
          p="md"
          style={{ borderBottom: '2px solid gray' }}
        >
          <Text size="2rem" px="lg">
            {s}
          </Text>
          <Group w="100%" px="md" justify="center">
            {services?.filter((service) => service.TYPE === s).length > 0 ? (
              services
                ?.filter((service) => service.TYPE === s)
                .map((service) => (
                  <ServiceCard
                    key={service.ID}
                    amenities={service.AMENITIES}
                    image={service.IMAGE}
                    name={service.NAME}
                    persons={service.PERSONS}
                    price={service.PRICE}
                  >
                    <Flex align="center" gap={5}>
                      <Button
                        color="#006400"
                        fullWidth
                        leftSection={<IconBuildingSkyscraper />}
                      >
                        Book Now
                      </Button>
                      <Button
                        color="darkgreen"
                        fullWidth
                        rightSection={<Icon360 />}
                        variant="light"
                      >
                        View Room
                      </Button>
                    </Flex>
                  </ServiceCard>
                ))
            ) : (
              <NoRecords />
            )}
          </Group>
        </Flex>
      ))}
    </Box>
  );
}

export default UserReservation;
