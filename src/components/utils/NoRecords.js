import { Text } from '@mantine/core';

function NoRecords({ message }) {
  return (
    <Text size="xl" c="crimson" align="center">
      {message ? message : 'No Records'}
    </Text>
  );
}

export default NoRecords;
