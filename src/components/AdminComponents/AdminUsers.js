import { useEffect, useState } from 'react';

import axios from 'axios';

import { ActionIcon, Box, Table } from '@mantine/core';

import { IconEdit } from '@tabler/icons-react';

function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios({
      method: 'GET',
      url: '/users',
    })
      .then(({ data }) => {
        setUsers(data);
      })
      .catch((err) => {
        console.log(err);
      });
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
    <Box pos="relative">
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
    </Box>
  );
}

export default AdminUsers;
