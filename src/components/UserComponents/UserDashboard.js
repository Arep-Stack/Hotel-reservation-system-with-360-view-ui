import { Box, Text } from '@mantine/core';
import { greet } from '../../utils/greet';

function UserDashboard() {
  return (
    <Box>
      <Text size="xl">{greet()}</Text>
    </Box>
  );
}

export default UserDashboard;
