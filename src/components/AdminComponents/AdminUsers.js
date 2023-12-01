import {
  ActionIcon,
  Box,
  Button,
  Group,
  Input,
  Modal,
  Table,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch, IconTrashFilled } from '@tabler/icons-react';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import ComponentError from '../utils/ComponentError';
import ComponentLoader from '../utils/ComponentLoader';
import NoRecords from '../utils/NoRecords';

function AdminUsers() {
  //fetching user
  const [users, setUsers] = useState([]);
  const [usersFilter, setUsersFilter] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  //deleting user
  const [selectedUser, setSelectedUser] = useState({});
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const searchBar = useRef();

  //modal
  const [
    isDeleteModalOpen,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);

  //functions
  const getUsers = () => {
    closeDeleteModal();
    setIsFetching(true);
    axios({
      method: 'GET',
      url: '/users',
    })
      .then(({ data }) => {
        if (!!data) {
          setUsers(data);
          setUsersFilter(data);
        }
      })
      .catch(() => {
        setFetchError('An error occurred');
      })
      .finally(() => setIsFetching(false));
  };

  const handleSearch = () => {
    const filteredData = users?.filter((item) => {
      const searchValue = searchBar.current.value.toLowerCase();
      return (
        item.FIRSTNAME.toLowerCase().includes(searchValue) ||
        item.LASTNAME.toLowerCase().includes(searchValue) ||
        item.EMAIL.toLowerCase().includes(searchValue) ||
        item.PHONE_NUMBER.toLowerCase().includes(searchValue) ||
        item.ADDRESS.toLowerCase().includes(searchValue)
      );
    });
    setUsersFilter(filteredData);
  };

  const handleDelete = () => {
    setIsDeletingUser(true);
    axios({
      method: 'DELETE',
      url: `/users/${selectedUser?.ID}`,
    })
      .then(() => {
        toast.success('User has been deleted', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1500,
        });
      })
      .catch(({ response }) => {
        toast.error(response?.data?.error || 'An error occurred', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1500,
        });
      })
      .finally(() => setIsDeletingUser(false));
  };

  const dataRows = usersFilter
    ?.filter((user) => !user?.IS_ADMIN)
    .map((user) => (
      <Table.Tr key={user.ID}>
        <Table.Td>
          <ActionIcon
            onClick={() => {
              setSelectedUser(user);
              openDeleteModal();
            }}
            variant="light"
            color="red"
          >
            <IconTrashFilled />
          </ActionIcon>
        </Table.Td>
        <Table.Td>{user.FIRSTNAME}</Table.Td>
        <Table.Td>{user.LASTNAME}</Table.Td>
        <Table.Td c={user.IS_ACTIVE ? 'darkgreen' : 'crimson'}>
          {user.EMAIL}
        </Table.Td>
        <Table.Td>{user.PHONE_NUMBER}</Table.Td>
        <Table.Td>{user.ADDRESS}</Table.Td>
      </Table.Tr>
    ));

  //UseEffect
  useEffect(() => {
    getUsers();
  }, []);

  return (
    <Box pos="relative" mih={200}>
      <Group mb="sm" justify="space-between" align="center">
        <Text size="xl">Users</Text>
        <Input
          ref={searchBar}
          onChange={handleSearch}
          type="search"
          placeholder="Search users"
          leftSection={<IconSearch />}
        />
      </Group>

      {isFetching && <ComponentLoader message="Fetching users" />}
      {!isFetching && fetchError && <ComponentError message={fetchError} />}
      {!isFetching && !fetchError && dataRows.length < 1 && <NoRecords />}
      {!isFetching && !fetchError && dataRows.length > 0 && (
        <>
          <Table.ScrollContainer
            minWidth={500}
            mah="calc(100vh - 20rem)"
            mih={350}
            h="100%"
            type="native"
          >
            <Table stickyHeader>
              <Table.Thead
                bg="white"
                style={{
                  zIndex: 2,
                  boxShadow: 'rgba(0, 0, 0, .24) 0px 3px 8px',
                }}
              >
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
          <Group justify="center" mt="md" c="gray">
            <Text>Total Users: {users.filter((u) => !u.IS_ADMIN).length}</Text>
            <Text>Total Admin: {users.filter((u) => u.IS_ADMIN).length}</Text>
          </Group>
        </>
      )}

      <Modal
        centered
        title="Delete User"
        shadow="xl"
        closeButtonProps={{
          bg: 'crimson',
          radius: '50%',
          c: 'white',
        }}
        styles={{
          title: { color: 'crimson', fontSize: '1.7rem' },
          inner: { padding: 5 },
        }}
        opened={isDeleteModalOpen}
        onClose={() => {
          closeDeleteModal();
        }}
        withCloseButton={!isDeletingUser}
        closeOnClickOutside={!isDeletingUser}
        closeOnEscape={!isDeletingUser}
      >
        <Text align="center" my="md">
          Are you sure you want to delete? This action cannot be undone.
        </Text>
        <Text size="xl" fw={900} align="center">
          {selectedUser.FIRSTNAME + ' ' + selectedUser.LASTNAME}{' '}
        </Text>

        <Button
          fullWidth
          mt="md"
          color="red"
          tt="uppercase"
          fw={400}
          leftSection={<IconTrashFilled />}
          loading={isDeletingUser}
          onClick={handleDelete}
        >
          I understand
        </Button>
      </Modal>
    </Box>
  );
}

export default AdminUsers;
