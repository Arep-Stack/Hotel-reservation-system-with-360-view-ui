import { Text } from '@mantine/core';

function NoRecords({ message }) {
  return (
    <Text size="xl" c="crimson" align="center" mt="md" mb="md">
      {message ? message : 'No Records'}
    </Text>
  );
}

export default NoRecords;
