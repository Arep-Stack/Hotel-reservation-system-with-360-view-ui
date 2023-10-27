import {
  Box,
  Button,
  Container,
  Flex,
  PasswordInput,
  Text,
  TextInput,
} from '@mantine/core';

function SignUp() {
  return (
    <Container
      fluid
      h="100vh"
      pt={90}
      px="lg"
      style={{ display: 'Grid', placeItems: 'center' }}
    >
      <Flex direction="column" justify="center" maw="350px" w="100%" h="80%">
        <Text ta="left" size="2rem" lts={2} fw={600}>
          Sign Up
        </Text>

        <Text pt="md" py="lg">
          Hello there! Let's get started.
        </Text>

        <Box mb="sm">
          <Text component="label" htmlFor="firstName" size="sm" fw={500}>
            First name
          </Text>
          <TextInput placeholder="First name" id="firstName" mb="2px" />

          <Text component="label" htmlFor="lastName" size="sm" fw={500}>
            Last name
          </Text>
          <TextInput placeholder="Last Name" id="lastName" mb="2px" />

          <Text component="label" htmlFor="phone" size="sm" fw={500}>
            Phone
          </Text>
          <TextInput placeholder="Phone" id="phone" mb="2px" />

          <Text component="label" htmlFor="address" size="sm" fw={500}>
            Address
          </Text>
          <TextInput placeholder="Address" id="address" mb="2px" />

          <Text component="label" htmlFor="email" size="sm" fw={500}>
            Email
          </Text>
          <TextInput placeholder="Email" id="emai" mb="2px" />

          <Text component="label" htmlFor="password" size="sm" fw={500}>
            Password
          </Text>
          <PasswordInput placeholder="Password" id="password" mb="2px" />

          <Text component="label" htmlFor="confirmPassword" size="sm" fw={500}>
            Confirm Password
          </Text>
          <PasswordInput placeholder="Confirm Password" id="confimPassword" />
        </Box>

        <Button mt="lg" fullWidth color="themeColors">
          Sign Up
        </Button>

        <Text mt="md" size="sm" ta="center">
          Have an account already? <a href="/Login">Login</a>
        </Text>
      </Flex>
    </Container>
  );
}

export default SignUp;
