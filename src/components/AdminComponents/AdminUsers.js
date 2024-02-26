import {
  ActionIcon,
  Box,
  Button,
  Group,
  Modal,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch, IconTrash, IconTrashFilled } from '@tabler/icons-react';
import axios from 'axios';
import { useContext, useState } from 'react';
import { toast } from 'react-toastify';

import { GlobalContext } from '../../App';
import ComponentError from '../utils/ComponentError';
import ComponentLoader from '../utils/ComponentLoader';
import NoRecords from '../utils/NoRecords';

function AdminUsers() {
  //context
  const { getAllUsers, allUsers, allUsersError, allUsersLoading } =
    useContext(GlobalContext);

  //deleting user
  const [selectedUser, setSelectedUser] = useState({});
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  //modal
  const [
    isDeleteModalOpen,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);

  //functions
  const handleSearch = (e) => {
    setSearchValue(e?.target?.value?.toLowerCase());
  };

  const handleOpenDeleteModal = (user) => {
    setSelectedUser(user);
    openDeleteModal();
  };

  const handleDelete = () => {
    setIsDeletingUser(true);
    axios({
      method: 'DELETE',
      url: `/users/${selectedUser?.ID}`,
    })
      .then(() => {
        getAllUsers();
        closeDeleteModal();
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

  //render
  const userTable = allUsers
    ?.filter((user) => !user.IS_ADMIN)
    ?.filter((user) =>
      ['FIRSTNAME', 'LASTNAME', 'EMAIL', 'PHONE_NUMBER', 'ADDRESS'].some(
        (key) => user[key].toLowerCase().includes(searchValue),
      ),
    )
    ?.map((u) => (
      <Table.Tr key={u.ID}>
        <Table.Td>
          <ActionIcon variant="transparent">
            <IconTrash
              color="#FF0800"
              onClick={() => handleOpenDeleteModal(u)}
            />
          </ActionIcon>
        </Table.Td>
        <Table.Td>{u.FIRSTNAME}</Table.Td>
        <Table.Td>{u.LASTNAME}</Table.Td>
        <Table.Td>{u.EMAIL}</Table.Td>
        <Table.Td>{u.PHONE_NUMBER}</Table.Td>
        <Table.Td>{u.ADDRESS}</Table.Td>
      </Table.Tr>
    ));

  return (
    <Box pos="relative" mih={200}>
      <Group mb="sm" justify="space-between" align="center">
        <Text size="xl">Users</Text>
        <TextInput
          onChange={(e) => handleSearch(e)}
          disabled={allUsersError || allUsersLoading}
          type="search"
          placeholder="Search users"
          leftSection={<IconSearch />}
        />
      </Group>

      {allUsersLoading && <ComponentLoader message="Fetching users" />}
      {!allUsersLoading && allUsersError && (
        <ComponentError message={allUsersError} />
      )}
      {!allUsersLoading && !allUsersError && userTable.length < 1 && (
        <NoRecords />
      )}
      {!allUsersLoading && !allUsersError && userTable.length > 0 && (
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
              <Table.Tbody>{userTable}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>
          <Group justify="center" mt="md" c="gray">
            <Text>
              Total Users: {allUsers.filter((u) => !u.IS_ADMIN).length}
            </Text>
            <Text>
              Total Admin: {allUsers.filter((u) => u.IS_ADMIN).length}
            </Text>
          </Group>
        </>
      )}

      <Modal
        centered
        title="Delete User"
        shadow="xl"
        opened={isDeleteModalOpen}
        onClose={() => closeDeleteModal()}
        closeButtonProps={{
          bg: 'crimson',
          radius: '50%',
          c: 'white',
        }}
        styles={{
          title: { color: 'crimson', fontSize: '1.7rem' },
          inner: { padding: 5 },
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
          color="#FF0800"
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
