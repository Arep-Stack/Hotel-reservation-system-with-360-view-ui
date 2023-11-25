import { useEffect, useState } from 'react';

import ComponentLoader from '../utils/ComponentLoader';
import TableNoRecords from '../utils/TableNoRecords';
import ComponentError from '../utils/ComponentError';

import axios from 'axios';

import { ActionIcon, Box, Group, Input, Table, Text } from '@mantine/core';

import { IconEdit, IconSearch } from '@tabler/icons-react';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios({
      method: 'GET',
      url: '/users',
    })
      .then(({ data }) => {
        setUsers(data);
      })
      .catch(() => {
        setError('Error while getting users');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const dataRows = users?.map((data) => (
    <Table.Tr key={data.ID}>
      <Table.Td>
        <ActionIcon variant="light" color="yellow">
          <IconEdit />
        </ActionIcon>
      </Table.Td>
      <Table.Td>{data.FIRSTNAME}</Table.Td>
      <Table.Td>{data.LASTNAME}</Table.Td>
      <Table.Td c={data.IS_ACTIVE ? 'darkgreen' : 'crimson'}>
        {data.EMAIL}
      </Table.Td>
      <Table.Td>{data.PHONE_NUMBER}</Table.Td>
      <Table.Td>{data.ADDRESS}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Box pos="relative" mih={200}>
      {isLoading && <ComponentLoader message="Loading users" />}
      {error && <ComponentError message={error} />}
      {dataRows.length < 1 && !error && <TableNoRecords />}
      {dataRows.length > 0 && !error && (
        <>
          <Group mb="sm" justify="space-between" align="center">
            <Text size="xl">Users</Text>
            <Input
              type="search"
              placeholder="Search users"
              leftSection={<IconSearch />}
            />
          </Group>
          <Table.ScrollContainer minWidth={500} type="native">
            <Table withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th></Table.Th>
                  <Table.Th>First Name</Table.Th>
                  <Table.Th>Last Name</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Phone Number</Table.Th>
                  <Table.Th>Address</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{dataRows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </>
      )}
    </Box>
  );
}

export default AdminUsers;
