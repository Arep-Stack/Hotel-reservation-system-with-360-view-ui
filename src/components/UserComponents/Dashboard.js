import { Box, Text } from '@mantine/core';
import { greet } from '../../utils/greet';

function Dashboard() {
  return (
    <Box>
      <Text size="xl">{greet()}</Text>
    </Box>
  );
}

export default Dashboard;
