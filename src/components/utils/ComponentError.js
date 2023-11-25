import { Flex, Text } from '@mantine/core';

function ComponentError({ message }) {
  return (
    <Flex
      pos="absolute"
      direction="column"
      justify="center"
      align="center"
      h="100%"
      w="100%"
    >
      <Text size="xl" c="crimson">
        {message ? message : 'An error occurred'}
      </Text>
    </Flex>
  );
}

export default ComponentError;
