import { Card, Flex, Paper, Text } from '@mantine/core';
import {
  IconBed,
  IconBuildingPavilion,
  IconSwimming,
} from '@tabler/icons-react';

function DashboardCard({ service, total, cancelled }) {
  return (
    <Card withBorder flex={1} shadow="sm">
      <Flex align="center">
        <Paper
          withBorder
          pl="xs"
          pr="xs"
          pt="xs"
          mr="sm"
          bg="#006400"
          c="white"
        >
          {service === 'Room' && <IconBed />}
          {service === 'Pavilion' && <IconBuildingPavilion />}
          {service === 'Pool' && <IconSwimming />}
        </Paper>

        <Flex direction="column">
          <Text size="lg">
            {total} {total > 0 ? `${service}s` : service}
          </Text>
          <Text size="sm" c="dimmed">
            {cancelled} {cancelled !== 1 ? 'cancellations' : 'cancellation'}
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
}

export default DashboardCard;
