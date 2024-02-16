import { ActionIcon, Button, Container, Flex, Text } from '@mantine/core';
import { IconArrowBarRight, IconBuildingSkyscraper } from '@tabler/icons-react';
import { Icon360 } from '@tabler/icons-react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ServiceCard from '../../components/ServiceCard/ServiceCard';
import ComponentError from '../../components/utils/ComponentError';
import ComponentLoader from '../../components/utils/ComponentLoader';
import NoRecords from '../../components/utils/NoRecords';

function Rooms() {
  //fetching rooms
  const [rooms, setRooms] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  //navigate
  const navigator = useNavigate();

  //useEffect
  useEffect(() => {
    setIsFetching(true);
    axios({
      method: 'GET',
      url: '/services',
    })
      .then(({ data }) => {
        !!data && setRooms(data.filter((s) => s.TYPE === 'Room'));
      })
      .catch(() => {
        setFetchError('An error occurred');
      })
      .finally(() => setIsFetching(false));
  }, []);

  return (
    <Container size="xl" mih="100vh" pt={90} px="lg">
      <Flex
        w="100%"
        align="center"
        justify="space-between"
        style={{
          borderBottom: '1px solid gray',
        }}
      >
        <Text size="3rem">Rooms</Text>
        <ActionIcon
          onClick={() => navigator('/Services')}
          size="xl"
          color="#006400"
          variant="light"
        >
          <IconArrowBarRight />
        </ActionIcon>
      </Flex>

      <Flex py="lg" wrap="wrap" gap={10} justify="center" mih={200}>
        {isFetching && <ComponentLoader message="Fetching rooms" />}
        {!isFetching && fetchError && <ComponentError message={fetchError} />}
        {!isFetching && !fetchError && !rooms.length && <NoRecords />}
        {!isFetching &&
          !fetchError &&
          rooms &&
          rooms.map((room) => {
            return (
              <ServiceCard
                key={room.ID}
                amenities={room.AMENITIES}
                image={room.IMAGE}
                name={room.NAME}
                persons={room.PERSONS}
                price={room.PRICE}
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
            );
          })}
      </Flex>
    </Container>
  );
}

export default Rooms;
