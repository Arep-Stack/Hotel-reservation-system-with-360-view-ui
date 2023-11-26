import { ActionIcon, Container, Flex, Text } from '@mantine/core';
import { IconArrowBarRight } from '@tabler/icons-react';
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
        'https://gist.githubusercontent.com/arepstack/d2807756a10925ddb64ed074a38674dd/raw/3e78d6b3600fbd170b511f86bee733388efccc8f/rooms.json',
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
              image={room.image}
              persons={room.persons}
              price={room.price}
              type={room.type}
              amenities={room.amenities}
            />
          );
        })}
      </Flex>
    </Container>
  );
}

export default Rooms;
