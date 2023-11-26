import {
  ActionIcon,
  Box,
  Button,
  Flex,
  Group,
  Input,
  Modal,
  Table,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconCircleFilled,
  IconEdit,
  IconSearch,
  IconTrashFilled,
} from '@tabler/icons-react';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import ComponentError from '../utils/ComponentError';
import ComponentLoader from '../utils/ComponentLoader';
import TableNoRecords from '../utils/TableNoRecords';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [usersFilter, setUsersFilter] = useState([]);
  const [selectedUser, setSelectedUser] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [error, setError] = useState(null);

  const searchBar = useRef();

  const [isInfoModalOpen, { open: openInfoModal, close: closeInfoModal }] =
    useDisclosure(false);

  const [
    isDeleteModalOpen,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);

  const getUsers = () => {
    setIsLoading(true);
    axios({
      method: 'GET',
      url: '/users',
    })
      .then(({ data }) => {
        !!data && setUsers(data);
        !!data && setUsersFilter(data);
      })
      .catch(() => {
        setError('Error while getting users');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    getUsers();
  }, []);

  const handleDeleteUser = () => {
    setIsDeletingUser(true);
    axios({
      method: 'DELETE',
      url: `/users/${selectedUser.ID}`,
    })
      .then(() => {
        toast.success('User Deleted', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1500,
        });
        closeDeleteModal();
        closeInfoModal();
        getUsers();
      })
      .catch(({ response }) => {
        toast.error(response?.data?.error || 'An error occurred', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1500,
        });
      })
      .finally(() => setIsDeletingUser(false));
  };

  const handleOpenInfoModal = (user) => {
    openInfoModal();
    !!user && setSelectedUser(user);
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

  const dataRows = usersFilter
    ?.filter((user) => !user?.IS_ADMIN)
    .map((data) => (
      <Table.Tr key={data.ID}>
        <Table.Td>
          <ActionIcon
            onClick={() => handleOpenInfoModal(data)}
            variant="light"
            color="yellow"
          >
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

      {isLoading && <ComponentLoader message="Loading users" />}
      {error && <ComponentError message={error} />}
      {dataRows.length < 1 && !error && !isLoading && <TableNoRecords />}
      {dataRows.length > 0 && !error && !isLoading && (
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
        shadow="xl"
        opened={isInfoModalOpen}
        onClose={closeInfoModal}
        title={'User #' + selectedUser.ID}
        closeButtonProps={{
          bg: 'crimson',
          radius: '50%',
          c: 'white',
        }}
        styles={{
          title: { color: 'darkgreen', fontSize: '1.7rem' },
          inner: { padding: 5 },
        }}
      >
        <Flex
          align="center"
          style={{
            borderBottom: '1px solid gray',
          }}
        >
          <IconCircleFilled
            style={{
              color: selectedUser.IS_ACTIVE ? 'green' : 'red',
            }}
          />
          <Text size="xl" ml="xs">
            Personal Information
          </Text>
        </Flex>

        <Flex direction="column" py="lg">
          <Group justify="space-between" mb="sm">
            <Text>First name</Text>
            <Text fw={900}>{selectedUser.FIRSTNAME}</Text>
          </Group>

          <Group justify="space-between" mb="sm">
            <Text>Last name</Text>
            <Text fw={900}>{selectedUser.LASTNAME}</Text>
          </Group>

          <Group justify="space-between" mb="sm">
            <Text>Email</Text>
            <Text fw={900}>{selectedUser.EMAIL}</Text>
          </Group>

          <Group justify="space-between" mb="sm">
            <Text>Phone</Text>
            <Text fw={900}>{selectedUser.PHONE_NUMBER}</Text>
          </Group>

          <Group justify="space-between" mb="sm">
            <Text>Address</Text>
            <Text fw={900}>{selectedUser.ADDRESS}</Text>
          </Group>
        </Flex>

        <Button
          color="red"
          fullWidth
          fw={400}
          leftSection={<IconTrashFilled />}
          onClick={() => {
            closeInfoModal();
            openDeleteModal();
          }}
        >
          Delete User
        </Button>
      </Modal>

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
          openInfoModal();
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
          onClick={handleDeleteUser}
        >
          I understand
        </Button>
      </Modal>
    </Box>
  );
}

export default AdminUsers;
