import {
  ActionIcon,
  Anchor,
  Button,
  Container,
  Flex,
  Group,
  Modal,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowBarRight } from '@tabler/icons-react';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { GlobalContext } from '../../App';
import ServiceCard from '../../components/ServiceCard/ServiceCard';
import NoRecords from '../../components/utils/NoRecords';

function Rooms() {
  //context
  const { allServices } = useContext(GlobalContext);

  const [selectedRoom, setSelectedRoom] = useState(null);

  //navigate
  const navigator = useNavigate();

  //modal
  const [
    isBookingModalOpen,
    { open: openBookingModal, close: closeBookingModal },
  ] = useDisclosure(false);

  //function
  const handleOpenModal = (service) => {
    const src = `https://cdn.pannellum.org/2.5/pannellum.htm#panorama=${encodeURIComponent(
      service?.MAIN360,
    )}&autoLoad=true&autoRotate=-2`;

    setSelectedRoom({ ...service, MAIN360: src });

    openBookingModal();
  };

  //render
  const renderRooms = () => {
    const services = allServices?.filter(
      (service) => service?.TYPE === 'Room' && !service?.IS_DELETED,
    );

    services?.sort((a, b) => a.ID - b.ID);

    if (services?.length > 0) {
      return services.map((service) => (
        <ServiceCard
          key={service?.ID}
          amenities={service?.AMENITIES}
          image={service?.IMAGE}
          name={service?.NAME}
          persons={service?.PERSONS}
          price={service?.PRICE}
          type={service?.TYPE}
        >
          <Button
            fullWidth
            fw="normal"
            color="#006400"
            onClick={() => handleOpenModal(service)}
          >
            Book now
          </Button>
        </ServiceCard>
      ));
    } else {
      return <NoRecords message={'No available rooms'} />;
    }
  };

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
        {renderRooms()}
      </Flex>

      <Modal
        centered
        size="80%"
        title={selectedRoom?.NAME}
        shadow="xl"
        opened={isBookingModalOpen}
        onClose={closeBookingModal}
        closeButtonProps={{
          bg: 'crimson',
          radius: '50%',
          c: 'white',
        }}
        styles={{
          title: { color: 'darkgreen', fontSize: '1.7rem' },
          inner: { padding: 5 },
        }}
      >
        <Flex h={selectedRoom?.MAIN360 ? '70vh' : '100%'} direction="column">
          <Group mb="md" justify="center" align="center">
            <Title order={3} align="center" c="#006400">
              You need to login to book.
            </Title>

            <Anchor href="/login" size="xl" underline="always">
              Login here
            </Anchor>
          </Group>

          <Flex h="100%">
            <iframe
              title={selectedRoom?.MAIN360}
              width="100%"
              height="100%"
              allowFullScreen
              src={selectedRoom?.MAIN360}
            ></iframe>
          </Flex>
        </Flex>
      </Modal>
    </Container>
  );
}

export default Rooms;
