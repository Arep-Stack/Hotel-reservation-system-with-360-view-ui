import {
  Anchor,
  Box,
  Button,
  Container,
  Flex,
  Paper,
  PasswordInput,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { postUser } from '../../utils/user';
import { GoogleButton } from './GoogleButton/GoogleButton';
import './Login.css';

function Login() {
  const navigator = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceStatus, setServiceStatus] = useState(null);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },

    validate: {
      email: (value) => (value ? null : 'Email cannot be empty'),
      password: (value) => (value ? null : 'Password cannot be empty'),
    },
  });

  const handleSubmit = ({ EMAIL, PASSWORD }) => {
    setIsSubmitting(true);
    setServiceStatus(null);

    axios({
      method: 'POST',
      url: '/users/login',
      data: {
        EMAIL,
        PASSWORD,
      },
    })
      .then(({ data }) => {
        if (data?.user) {
          postUser(data.user);
        }
        navigator('/User'); //Change when useContext is used
      })
      .catch(({ response }) => {
        setServiceStatus({
          message: response?.data?.error,
          status: response?.status || 400,
        });
      })
      .finally(() => setIsSubmitting(false));
  };
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

        <Paper
          withBorder
          display={serviceStatus ? 'block' : 'none'}
          p="sm"
          mb="lg"
          mih="50px"
          w="100%"
          style={{
            borderColor: String(serviceStatus?.status).startsWith('2')
              ? 'darkgreen'
              : 'crimson',
          }}
        >
          <Text
            c={
              String(serviceStatus?.status).startsWith('2')
                ? 'darkgreen'
                : 'red'
            }
          >
            {String(serviceStatus?.status).startsWith('2')
              ? 'Redirecting you to Login page...'
              : serviceStatus?.message || 'An error occurred.'}
          </Text>
        </Paper>

        <GoogleButton>Login with Google</GoogleButton>

        <Box my="xl" pos="relative">
          <Text className="login-with-email-text">or Login with Email</Text>
          <div className="login-with-email-line"></div>
        </Box>

        <form
          onSubmit={form.onSubmit((values) =>
            handleSubmit({
              EMAIL: values.email,
              PASSWORD: values.password,
            }),
          )}
        >
          <Box>
            <TextInput
              mb={5}
              label="Email"
              placeholder="Email"
              {...form.getInputProps('email')}
            />

            <PasswordInput
              label="Password"
              placeholder="Password"
              {...form.getInputProps('password')}
            />

            <Anchor
              href="/Login"
              onClick={(event) => event.preventDefault()}
              tabIndex={-1}
              underline="hover"
              style={{
                fontSize: '12px',
                marginLeft: 'auto',
              }}
            >
              Forgot your password?
            </Anchor>
          </Box>

          <Button
            fullWidth
            type="submit"
            mih="36px"
            mt="lg"
            color="#006400"
            loading={isSubmitting}
          >
            Login
          </Button>
        </form>

        <Text mt="md" size="sm" ta="center">
          Not registered yet?{' '}
          <Anchor href="/SignUp" underline="always">
            Create an account
          </Anchor>
        </Text>
      </Flex>
    </Container>
  );
}

export default Login;
