import { Flex, Loader, Text } from '@mantine/core';

function ComponentLoader({ message }) {
  return (
    <Flex
      pos="absolute"
      direction="column"
      justify="center"
      align="center"
      h="100%"
      w="100%"
    >
      <Loader color="darkgreen" type="dots" />
      <Text>{message ? message : 'Loading'}</Text>
    </Flex>
  );
}

export default ComponentLoader;
