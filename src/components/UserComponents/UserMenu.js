import { Tabs } from '@mantine/core';
import {
  IconBookmarks,
  IconLayoutDashboard,
  IconUserCircle,
} from '@tabler/icons-react';

import UserDashboard from './UserDashboard';
import UserProfile from './UserProfile';
import UserReservation from './UserReservation';

function UserMenu() {
  return (
    <Tabs defaultValue="dashboard" color="darkgreen" variant="default">
      <Tabs.List grow justify="space-between">
        <Tabs.Tab value="dashboard" leftSection={<IconLayoutDashboard />}>
          Dashboard
        </Tabs.Tab>
        <Tabs.Tab value="reservation" leftSection={<IconBookmarks />}>
          Reservation
        </Tabs.Tab>
        <Tabs.Tab value="profile" leftSection={<IconUserCircle />}>
          Profile
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="dashboard" pt="md">
        <UserDashboard />
      </Tabs.Panel>

      <Tabs.Panel value="reservation" pt="md">
        <UserReservation />
      </Tabs.Panel>

      <Tabs.Panel value="profile" pt="md">
        <UserProfile />
      </Tabs.Panel>
    </Tabs>
  );
}

export default UserMenu;
