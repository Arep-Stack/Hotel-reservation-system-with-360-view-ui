import { Flex, Text } from '@mantine/core';

function TableNoRecords() {
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
        No Records
      </Text>
    </Flex>
  );
}

export default TableNoRecords;
