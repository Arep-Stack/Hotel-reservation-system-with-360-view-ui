import React, { useState } from 'react';

import './Reservation.css';

import AmenitiesCard from '../../components/AmenitiesCard/AmenitiesCard';

import { Box, Button, Container, Flex, Image, Text } from '@mantine/core';

import { IconSquareRoundedArrowRightFilled } from '@tabler/icons-react';

const amenityData = [
  {
    id: 1,
    type: 'Standard Room',
    price: '$100.00',
    persons: '2',
    amenities: ['own bathroom', 'veranda', 'aircon', 'heater', 'beer'],
    image:
      'https://www.usatoday.com/gcdn/-mm-/05b227ad5b8ad4e9dcb53af4f31d7fbdb7fa901b/c=0-64-2119-1259/local/-/media/USATODAY/USATODAY/2014/08/13/1407953244000-177513283.jpg?width=660&height=373&fit=crop&format=pjpg&auto=webp',
  },
  {
    id: 2,
    type: 'Deluxe Room',
    price: '$150.00',
    persons: '3',
    amenities: ['own bathroom', 'veranda', 'aircon', 'heater', 'beer'],
    image:
      'https://cf.bstatic.com/xdata/images/hotel/max1024x768/463156637.jpg?k=5d913fb55963d82c13fe5960117723b5d57007e15e813be871395bf090418f2f&o=&hp=1',
  },
  {
    id: 3,
    type: "Queen's Room",
    price: '$200.00',
    persons: '4',
    amenities: ['own bathroom', 'veranda', 'aircon', 'heater', 'beer'],
    image:
      'https://cf.bstatic.com/xdata/images/hotel/max1024x768/350221564.jpg?k=3774292ba5fc25ba8bfb1cef7ef90c3309a8294f44762bfd876f005519bfad84&o=&hp=1',
  },
  {
    id: 4,
    type: "King's Room",
    price: '$250.00',
    persons: '5',
    amenities: ['own bathroom', 'veranda', 'aircon', 'heater', 'beer'],
    image:
      'https://www.kabayanhotel.com.ph/wp-content/uploads/2022/12/Suite-1-jpg.webp',
  },
  {
    id: 5,
    type: 'Presedential Suite',
    price: '$300.00',
    persons: '6',
    amenities: ['own bathroom', 'veranda', 'aircon', 'heater', 'beer'],
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShZ1EV0KKacHtZlGe03ANzb3scVhpa8PFoUg&usqp=CAU',
  },
];

const Reservation = () => {
  const [activeAmenity, setActiveAmenity] = useState('');

  const handleClick = (amenity) => {
    setActiveAmenity(amenity);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Container fluid h="100vh" pt={80} px="lg">
        <Flex
          align="center"
          justify={activeAmenity ? 'space-between' : 'center'}
        >
          <Text align="center" tt="capitalize" size="3rem" py="md">
            {activeAmenity ? activeAmenity : 'Make a Reservation'}
          </Text>
          {activeAmenity && (
            <Button
              rightSection={<IconSquareRoundedArrowRightFilled />}
              onClick={() => setActiveAmenity('')}
            >
              View other services
            </Button>
          )}
        </Flex>

        {activeAmenity === '' && (
          <Flex justify="center" gap={50} align="center" wrap="wrap">
            <Box
              className="reservation-box"
              onClick={() => handleClick('rooms')}
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
              <Text className="label">EVENT HALLS</Text>
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
            <Flex gap={15} wrap="wrap" justify="space-between">
              <AmenitiesCard amenityData={amenityData} />
            </Flex>
          </Box>
        )}
      </Container>
    </div>
  );
};

export default Reservation;
