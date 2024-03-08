import {
  Badge,
  Box,
  Flex,
  Group,
  Image,
  NumberFormatter,
  Paper,
  Text,
} from '@mantine/core';
import { IconUsers } from '@tabler/icons-react';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { useEffect, useState } from 'react';

function ServiceCard({
  name,
  image,
  price,
  persons,
  amenities,
  children,
  type,
  addons,
}) {
  const [imagePath, setImagePath] = useState(null);

  useEffect(() => {
    const getImage = () => {
      if (image)
        axios({
          method: 'GET',
          url: `/image/${image}`,
        })
          .then(({ data }) => {
            setImagePath(data?.PATH);
          })
          .catch((err) => {
            console.log(err);
          });
    };

    getImage();
  }, [image]);

  return (
    <Paper
      withBorder
      maw={350}
      w={350}
      mih={450}
      radius={8}
      display="flex"
      style={{ flexDirection: 'column' }}
    >
      <Box mih={200} h={200} w="100%">
        <Image
          src={imagePath}
          w="100%"
          h="100%"
          fallbackSrc="https://placehold.co/350x200/EEE/31343C?font=source-sans-pro&text=Error%20while%20loading%20picture"
          style={{ borderRadius: '8px' }}
        />
      </Box>

      <Flex justify="space-between" direction="column" px="sm" pb="sm" h="100%">
        <Box>
          <Flex
            justify="space-between"
            align="center"
            py="md"
            gap={10}
            style={{
              borderBottom: '2px solid #868e96',
            }}
          >
            <div>
              <Text size="xl" fw={900} c="#006400">
                {name}
              </Text>
              <Flex align="center">
                <IconUsers color="#006400" size="16px" />
                <Text size="md" mt="-3" ml={3}>
                  Up to {persons} person{persons > 1 ? 's' : ''}
                </Text>
              </Flex>
            </div>

            <Badge size="lg" variant="light" color="#006400" tt="lowercase">
              <NumberFormatter prefix="₱" value={price} thousandSeparator />
              {type === 'Room' && '/night'}
              {type === 'Pavilion' && '/6hours'}
              {type === 'Pool' && '/24hours'}
            </Badge>
          </Flex>

          <Box py="md">
            <Text c="darkgreen">Amenities</Text>
            <Group gap={7} mt={5}>
              {amenities?.map((a) => (
                <Badge color="dark" variant="light" key={a}>
                  {a}
                </Badge>
              ))}
            </Group>
          </Box>

          <Box py="md">
            {addons && addons.length > 0 ? (
              <>
                <Text c="darkgreen">Add-ons:</Text>
                <Group gap={7} mt={5}>
                  {addons.map((a) => (
                    <Badge color="dark" variant="light" key={nanoid()}>
                      ₱{a.price} - {a.name}
                    </Badge>
                  ))}
                </Group>
              </>
            ) : (
              <Text c="crimson">No add-ons available</Text>
            )}
          </Box>
        </Box>

        <Box
          py="md"
          mt="auto"
          style={{
            borderTop: '2px solid #868e96',
          }}
        >
          {children}
        </Box>
      </Flex>
    </Paper>
  );
}

export default ServiceCard;
