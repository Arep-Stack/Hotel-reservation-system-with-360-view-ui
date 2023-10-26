import { Badge, Box, Button, Flex, Group, Image, Text } from '@mantine/core';
import { Icon360, IconBuildingSkyscraper } from '@tabler/icons-react';

import './AmenitiesCard.css';

function AmenitiesCard({ amenityData }) {
  const amenities = amenityData?.map((amenity) => {
    return (
      <div className="amenity-card" key={amenity.id}>
        <div className="amenity-card-img-section">
          <Image className="amenity-card-img" src={amenity.image} />
        </div>

        <div className="amenity-card-info-section">
          <Flex
            justify="space-between"
            align="center"
            py="md"
            style={{
              borderBottom: '2px solid #868e96',
            }}
          >
            <div>
              <Text size="xl" fw={900} c="blue">
                {amenity.type}
              </Text>
              <Text size="md" mt="-5" c="#868e96">
                Up to {amenity.persons} person
              </Text>
            </div>

            <div>
              <Badge
                size="lg"
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
              >
                {amenity.price}
              </Badge>
            </div>
          </Flex>

          <Box
            py="md"
            style={{
              borderBottom: '2px solid #868e96',
            }}
          >
            <Text>Amenities</Text>
            <Group gap={7} mt={5}>
              {amenity.amenities.map((a) => (
                <Badge variant="light" key={a}>
                  {a}
                </Badge>
              ))}
            </Group>
          </Box>

          <Flex py="md" align="center" gap={5}>
            <Button fullWidth leftSection={<IconBuildingSkyscraper />}>
              Book Now
            </Button>
            <Button fullWidth rightSection={<Icon360 />} variant="light">
              View Room
            </Button>
          </Flex>
        </div>
      </div>
    );
  });

  return <> {amenities} </>;
}

export default AmenitiesCard;
