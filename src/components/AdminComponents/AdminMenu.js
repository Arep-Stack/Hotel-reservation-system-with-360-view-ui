import { Tabs } from '@mantine/core';
import {
  IconBuildingStore,
  IconLayoutDashboard,
  IconUsers,
} from '@tabler/icons-react';

import AdminDashboard from './AdminDashboard';
import AdminService from './AdminService';
import AdminUsers from './AdminUsers';

function AdminMenu() {
  return (
    <Tabs defaultValue="users" color="darkgreen" variant="default">
      <Tabs.List grow justify="space-between">
        <Tabs.Tab value="dashboard" leftSection={<IconLayoutDashboard />}>
          Dashboard
        </Tabs.Tab>
        <Tabs.Tab value="users" leftSection={<IconUsers />}>
          Users
        </Tabs.Tab>
        <Tabs.Tab value="services" leftSection={<IconBuildingStore />}>
          Services
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="dashboard" pt="md">
        <AdminDashboard />
      </Tabs.Panel>
      <Tabs.Panel value="users" pt="md">
        <AdminUsers />
      </Tabs.Panel>
      <Tabs.Panel value="services" pt="md">
        <AdminService />
      </Tabs.Panel>
    </Tabs>
  );
}

export default AdminMenu;
