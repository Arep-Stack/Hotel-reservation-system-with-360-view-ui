import './Login.css';
import {
  Box,
  Button,
  Container,
  Flex,
  PasswordInput,
  Text,
  TextInput,
} from '@mantine/core';
import { GoogleButton } from './GoogleButton/GoogleButton';

function Login() {
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
          Login
        </Text>

        <Text pt="md" py="lg">
          Hi, Welcome Back!
        </Text>

        <GoogleButton>Login with Google</GoogleButton>

        <Box my="xl" pos="relative">
          <Text className="login-with-email-text">or Login with Email</Text>
          <div className="login-with-email-line"></div>
        </Box>

        <Box>
          <Text component="label" htmlFor="email" size="sm" fw={500}>
            Email
          </Text>
          <TextInput placeholder="Email" id="emai" mb="sm" />

          <Text component="label" htmlFor="password" size="sm" fw={500}>
            Password
          </Text>

          <PasswordInput placeholder="Password" id="password" />

          <a
            href="/Login"
            onClick={(event) => event.preventDefault()}
            tabIndex={-1}
            style={{
              fontSize: '12px',
              marginLeft: 'auto',
            }}
          >
            Forgot your password?
          </a>
        </Box>

        <Button mt="lg" fullWidth color="themeColors">
          Login
        </Button>

        <Text mt="md" size="sm" ta="center">
          Not registered yet? <a href="/SignUp">Create an account</a>
        </Text>
      </Flex>
    </Container>
  );
}

export default Login;
