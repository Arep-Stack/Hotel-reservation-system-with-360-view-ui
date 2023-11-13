import camelCase from 'camelcase';

import {
  Box,
  Button,
  Container,
  Flex,
  PasswordInput,
  Text,
  TextInput,
} from '@mantine/core';

const signInInputs = [
  'First name',
  'Last name',
  'Phone',
  'Address',
  'Email',
  'Password',
  'Confirm Password',
];

function SignUp() {
  return (
    <Container
      size="xl"
      mih="100vh"
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
          {signInInputs.map((input) => {
            const c = camelCase(input);
            return (
              <div key={c}>
                <Text component="label" htmlFor={c} size="sm" fw={500}>
                  {input}
                </Text>
                {c.toLowerCase().includes('password') ? (
                  <PasswordInput placeholder={input} id={c} mb="2px" />
                ) : (
                  <TextInput placeholder={input} id={c} mb="2px" />
                )}
              </div>
            );
          })}
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
