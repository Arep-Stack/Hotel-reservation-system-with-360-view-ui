import { Box, Text } from '@mantine/core';
import { greet } from '../../utils/greet';

function AdminDashboard() {
  return (
    <Box>
      <Text size="xl">{greet()}</Text>
    </Box>
  );
}

export default AdminDashboard;
