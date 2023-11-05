import { useNavigate } from 'react-router-dom';

import ServiceChoice from '../../components/ServiceChoices/ServiceChoice';

import { Container, Flex, Text } from '@mantine/core';

function Services() {
  const navigator = useNavigate();
  return (
    <Container size="xl" mih="100vh" pt={90} px="lg">
      <Text align="center" size="5rem" my="lg">
        Services
      </Text>

      <Flex mt="md">
        {data.map((s) => {
          return (
            <ServiceChoice
              key={s.serviceName}
              bg={s.bg}
              serviceName={s.serviceName}
              handleClick={() => navigator(`/Services/${s.serviceName}`)}
            />
          );
        })}
      </Flex>
    </Container>
  );
}

export default Services;

const data = [
  {
    serviceName: 'Rooms',
    bg: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
  },
  {
    serviceName: 'Pavilions',
    bg: 'https://images.pexels.com/photos/1035665/pexels-photo-1035665.jpeg',
  },
  {
    serviceName: 'Pools',
    bg: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHBvb2x8ZW58MHx8MHx8fDA%3D',
  },
];
