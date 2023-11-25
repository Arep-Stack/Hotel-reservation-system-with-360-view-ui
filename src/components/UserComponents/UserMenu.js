import Dashboard from './Dashboard';
import Profile from './Profile';
import Reservation from './Reservation';

import { Tabs } from '@mantine/core';
import {
  IconBookmarks,
  IconLayoutDashboard,
  IconUserCircle,
} from '@tabler/icons-react';

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
        <Dashboard />
      </Tabs.Panel>

      <Tabs.Panel value="reservation" pt="md">
        <Reservation />
      </Tabs.Panel>

      <Tabs.Panel value="profile" pt="md">
        <Profile />
      </Tabs.Panel>
    </Tabs>
  );
}

export default UserMenu;
