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
import camelCase from 'camelcase';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const signInInputs = [
  {
    name: 'First name',
    required: true,
  },
  {
    name: 'Last name',
    required: true,
  },
  {
    name: 'Phone',
  },
  {
    name: 'Address',
  },
  {
    name: 'Email',
    required: true,
  },
  {
    name: 'Password',
    required: true,
  },
  {
    name: 'Confirm Password',
    required: true,
  },
];

function SignUp() {
  const navigator = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceStatus, setServiceStatus] = useState(null);

  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      email: '',
      password: '',
      confirmPassword: '',
    },

    validate: {
      firstName: (value) =>
        value && value.trim() !== '' ? null : 'First name is required',
      lastName: (value) =>
        value && value.trim() !== '' ? null : 'Last name is required',
      email: (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Invalid email',
      password: (value) =>
        value.length > 7 ? null : 'Password must be at least 8 characters',
      confirmPassword: (value, values) =>
        value === values.password ? null : 'Passwords did not match',
    },
  });

  const handleSubmit = ({
    FIRSTNAME,
    LASTNAME,
    PHONE_NUMBER,
    ADDRESS,
    EMAIL,
    PASSWORD,
  }) => {
    setIsSubmitting(true);
    setServiceStatus(null);

    axios({
      method: 'POST',
      url: '/users/register',
      data: {
        FIRSTNAME,
        LASTNAME,
        PHONE_NUMBER,
        ADDRESS,
        EMAIL,
        PASSWORD,
        IS_ADMIN: false,
      },
    })
      .then(({ data, status }) => {
        setServiceStatus({
          message: data?.message,
          status,
        });

        toast.success(data?.message, {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1500,
        });

        setTimeout(() => {
          navigator('/Login');
        }, 2000);
      })
      .catch(({ response }) => {
        setServiceStatus({
          message: response?.data?.message || 'An error',
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
          Sign Up
        </Text>

        <Text pt="md" py="lg">
          Hello there! Let's get started.
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
              : serviceStatus?.message}
          </Text>
        </Paper>

        <form
          onSubmit={form.onSubmit((values) =>
            handleSubmit({
              FIRSTNAME: values.firstName,
              LASTNAME: values.lastName,
              PHONE_NUMBER:
                values?.phone[0] === '0' ? values.phone.slice(1) : values.phone,
              ADDRESS: values.address,
              EMAIL: values.email,
              PASSWORD: values.password,
            }),
          )}
        >
          <Box mb="sm">
            {signInInputs.map((input) => {
              const c = camelCase(input.name);
              return (
                <div key={c} style={{ marginBottom: 5 }}>
                  {c.toLowerCase().includes('password') ? (
                    <PasswordInput
                      withAsterisk={input.required}
                      label={input.name}
                      placeholder={input.name}
                      {...form.getInputProps(c.trim())}
                    />
                  ) : (
                    <TextInput
                      withAsterisk={input.required}
                      label={input.name}
                      placeholder={input.name}
                      leftSection={
                        input.name === 'Phone' && (
                          <Text
                            w="100%"
                            align="center"
                            size={12}
                            pl={4}
                            c="black"
                          >
                            (+63)
                          </Text>
                        )
                      }
                      styles={{
                        input: {
                          paddingLeft: input.name === 'Phone' && '40px',
                        },
                      }}
                      {...form.getInputProps(c.trim())}
                    />
                  )}
                </div>
              );
            })}
          </Box>

          <Button
            fullWidth
            loading={isSubmitting}
            type="submit"
            mt="lg"
            mih="36px"
            color="#006400"
          >
            Sign Up
          </Button>
        </form>

        <Text mt="md" size="sm" ta="center">
          Have an account already?{' '}
          <Anchor href="/Login" underline="always" c="green">
            Login
          </Anchor>
        </Text>
      </Flex>
    </Container>
  );
}

export default SignUp;
