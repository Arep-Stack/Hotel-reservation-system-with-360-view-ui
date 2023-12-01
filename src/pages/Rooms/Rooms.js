import { ActionIcon, Button, Container, Flex, Text } from '@mantine/core';
import { IconArrowBarRight, IconBuildingSkyscraper } from '@tabler/icons-react';
import { Icon360 } from '@tabler/icons-react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ServiceCard from '../../components/ServiceCard/ServiceCard';

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const navigator = useNavigate();

  useEffect(() => {
    axios
      .get(
        'https://gist.githubusercontent.com/arepstack/d2807756a10925ddb64ed074a38674dd/raw/e11479b7eb3c5ebd8f2eb7e346d54255534215b1/rooms.json',
      )
      .then(({ data }) => {
        setRooms(data.rooms);
      }); //Add catch Statement
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
      <Flex py="lg" wrap="wrap" gap={10} justify="center">
        {rooms.map((room) => {
          return (
            <ServiceCard
              amenities={room.amenities}
              image={room.image}
              name={room.name}
              persons={room.persons}
              price={room.price}
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
