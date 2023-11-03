import React, { useState } from 'react';

import './Reservation.css';

import ServiceCard from '../../components/ServiceCard/ServiceCard';

import { Box, Button, Container, Flex, Image, Text } from '@mantine/core';

import { IconSquareRoundedArrowRightFilled } from '@tabler/icons-react';

import serviceData from './data.json';

const Reservation = () => {
  console.log(serviceData);
  const [activeAmenity, setActiveAmenity] = useState('');

  const handleClickService = (service) => {
    setActiveAmenity(service);
  };

  return (
    <Container fluid pt={90} px="lg">
      <Flex
        w="100%"
        align="center"
        justify={activeAmenity ? 'space-between' : 'center'}
      >
        <Text
          align="center"
          tt="capitalize"
          size="3rem"
          py="md"
          color="themeColors"
        >
          {activeAmenity ? activeAmenity : 'Make a Reservation'}
        </Text>
        {activeAmenity && (
          <Button
            onClick={() => setActiveAmenity('')}
            rightSection={<IconSquareRoundedArrowRightFilled />}
            color="themeColors"
          >
            View other services
          </Button>
        )}
      </Flex>

      {activeAmenity === '' && (
        <Flex w="100%" justify="center" gap={50} align="center" wrap="wrap">
          <Box
            className="reservation-box"
            onClick={() => handleClickService('rooms')}
          >
            <Image
              className="reservation-box-img"
              src="https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg"
            />
            <Text className="label">ROOMS</Text>
          </Box>
          <Box className="reservation-box">
            <Image
              className="reservation-box-img"
              src="https://images.pexels.com/photos/1035665/pexels-photo-1035665.jpeg"
            />
            <Text className="label">PAVILIONS</Text>
          </Box>
          <Box className="reservation-box">
            <Image
              className="reservation-box-img"
              src="https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHBvb2x8ZW58MHx8MHx8fDA%3D"
            />
            <Text className="label">POOLS</Text>
          </Box>
        </Flex>
      )}

      {activeAmenity === 'rooms' && (
        <Box>
          <Flex gap={15} wrap="wrap" justify="center">
            <ServiceCard serviceCard={serviceData} />
          </Flex>
        </Box>
      )}
    </Container>
  );
};

export default Reservation;
