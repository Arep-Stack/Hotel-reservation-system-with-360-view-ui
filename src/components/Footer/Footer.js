import {
  ActionIcon,
  Badge,
  Box,
  Container,
  Flex,
  Group,
  Text,
} from '@mantine/core';

import {
  IconBellRinging,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTwitter,
  IconDeviceMobile,
  IconMail,
  IconMapPin,
} from '@tabler/icons-react';

function Footer() {
  return (
    <Container fluid w="100%" mt="md" p="lg" bg="#CEFAD0">
      <Flex
        mx="auto"
        maw={1280}
        w="100%"
        align="center"
        justify="space-between"
      >
        {footerElements.map((el) => {
          return (
            <Box key={el} p="md" w="100%" maw="400px" h="200px">
              {el()}
            </Box>
          );
        })}
      </Flex>
    </Container>
  );
}

export default Footer;

const reservationOffice = () => {
  return (
    <>
      <Text size="xl" mb="md" fw={600}>
        Reservation Office
      </Text>
      <Group>
        <IconMapPin />
        MCV2+C85, Camiling, Tarlac
      </Group>
      <Group my="sm">
        <IconDeviceMobile /> +63 909 1234 567
      </Group>
      <Group my="sm">
        <IconMail /> felrey.resort@gmail.com
      </Group>
    </>
  );
};

const officeHours = () => {
  return (
    <>
      <Text size="xl" mb="md" fw={600}>
        Office Hours
      </Text>
      <Text>Monday to Friday</Text>
      <Text mb="md">9:00am to 6:00pm</Text>

      <Text>Saturday</Text>
      <Text>9:00am to 12:00nn</Text>
    </>
  );
};

const getSocial = () => {
  return (
    <>
      <Text size="xl" mb="md" fw={600}>
        Get Social
      </Text>
      <Group>
        <ActionIcon size="xl" color="#3b5998">
          <IconBrandFacebook />
        </ActionIcon>
        <ActionIcon size="xl" color="#1d9bf0">
          <IconBrandTwitter />
        </ActionIcon>
        <ActionIcon
          size="xl"
          variant="gradient"
          gradient={{
            from: '#8134af',
            to: '#dd27ab',
            deg: 90,
          }}
        >
          <IconBrandInstagram />
        </ActionIcon>
      </Group>
      <Badge
        leftSection={<IconBellRinging />}
        color="darkGreen"
        mt="lg"
        size="xl"
      >
        Tag us in your photos!
      </Badge>
    </>
  );
};

const footerElements = [reservationOffice, officeHours, getSocial];
