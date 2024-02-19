import {
  ActionIcon,
  Box,
  Button,
  Flex,
  Group,
  Modal,
  NumberInput,
  Table,
  Tabs,
  Text,
  TextInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconCash } from '@tabler/icons-react';
import axios from 'axios';
import moment from 'moment';
import { nanoid } from 'nanoid';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import ComponentError from '../utils/ComponentError';
import ComponentLoader from '../utils/ComponentLoader';
import NoRecords from '../utils/NoRecords';

function AdminDashboard() {
  //fetching reservation
  const [reservations, setReservations] = useState([]);
  const [reservationsUnfiltered, setReservationsUnfiltered] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  //processing payment
  const [selectedReservation, setSelectedReservation] = useState({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  //form
  let form = useForm({
    initialValues: {
      amount: 0,
      method: '',
      dop: new Date(),
    },

    validate: {
      amount: (value) =>
        value > 0
          ? value > selectedReservation.BALANCE
            ? 'Amount is greater than balance'
            : null
          : 'Please enter a valid amount',
      method: (value) =>
        value && value.trim() !== '' ? null : 'Please enter mode of payment',
    },
  });

  //filter
  const [sortingCriteria, setSortingCriteria] = useState('Today');

  //modal
  const [
    isProcessPaymentModalOpen,
    { open: openProcessPaymentModal, close: closeProcessPaymentModal },
  ] = useDisclosure(false);

  //functions
  const getReservations = () => {
    setIsFetching(true);
    axios({
      method: 'GET',
      url: '/users',
    })
      .then((dataUsers) => {
        //get Services
        axios({
          method: 'GET',
          url: '/services',
        })
          .then((dataServices) => {
            //get Reservations
            axios({
              method: 'GET',
              url: '/reservations',
            })
              .then((dataReservations) => {
                if (!!dataReservations.data) {
                  setReservationsUnfiltered(dataReservations.data);

                  const newReservations = dataReservations.data.map(
                    (reservation) => {
                      const { FIRSTNAME, LASTNAME, EMAIL, PHONE_NUMBER } =
                        dataUsers.data.find(
                          (user) => user.ID === reservation.USER_ID,
                        ) || {};
                      const USER = `${FIRSTNAME} ${LASTNAME}`;

                      const { NAME, TYPE } =
                        dataServices.data.find(
                          (service) => service.ID === reservation.SERVICE_ID,
                        ) || {};

                      return {
                        ...reservation,
                        NAME: USER,
                        EMAIL,
                        PHONE_NUMBER,
                        SERVICE_NAME: NAME,
                        SERVICE_TYPE: TYPE,
                      };
                    },
                  );

                  newReservations.sort(
                    (a, b) => new Date(b.END_DATE) - new Date(a.END_DATE),
                  );

                  setReservations(newReservations);
                }
              })
              .catch(() => setFetchError('An error occurred'))
              .finally(() => setIsFetching(false));
          })
          .catch(() => {
            setFetchError('An error occurred');
            setIsFetching(false);
          });
      })
      .catch(() => {
        setFetchError('An error occurred');
        setIsFetching(false);
      });
  };

  const filterReservations = () => {
    switch (sortingCriteria) {
      case 'Today':
        return reservations.filter((reservation) =>
          moment(reservation.START_DATE).isSame(moment(), 'day'),
        );
      case 'Upcoming':
        return reservations.filter((reservation) =>
          moment(reservation.START_DATE).isAfter(moment(), 'day'),
        );
      case 'All':
      default:
        return reservations;
    }
  };

  const handleProcessPayment = ({ amount, method, dop }) => {
    setIsProcessingPayment(true);

    const data = reservationsUnfiltered?.find(
      (r) => r.ID === selectedReservation.ID,
    );

    data.BALANCE = data.BALANCE - amount;

    data.PAYMENT_HISTORY.push({
      amount,
      dop: moment(dop).format('ll'),
      method,
    });

    data.STATUS = data.BALANCE === 0 ? 'Fully Paid' : 'Paid - Partial';

    axios({
      method: 'PUT',
      url: `/reservations/${data.ID}`,
      data: data,
    })
      .then(() => {
        getReservations();
        toast.success('Successfully processed payment', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1500,
        });

        closeProcessPaymentModal();
        form.reset();
      })
      .catch(() => {
        toast.error('An error occurred', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1500,
        });
      })
      .finally(() => setIsProcessingPayment(false));
  };

  const renderTable = (filteredReservations) => {
    return (
      <>
        {filteredReservations?.length ? (
          filteredReservations.map((reservation) => (
            <Table.Tr key={reservation.ID}>
              <Table.Td>
                <ActionIcon
                  onClick={() => {
                    setSelectedReservation(reservation);
                    openProcessPaymentModal();
                  }}
                  variant="light"
                  color="darkgreen"
                >
                  <IconCash />
                </ActionIcon>
              </Table.Td>
              <Table.Td>{reservation.NAME}</Table.Td>
              <Table.Td>{reservation.EMAIL}</Table.Td>
              <Table.Td>{reservation.PHONE_NUMBER}</Table.Td>
              <Table.Td>{reservation.SERVICE_NAME}</Table.Td>
              <Table.Td>{reservation.SERVICE_TYPE}</Table.Td>
              <Table.Td>{moment(reservation.START_DATE).format('ll')}</Table.Td>
              <Table.Td>{moment(reservation.END_DATE).format('ll')}</Table.Td>
              <Table.Td>{reservation.STATUS}</Table.Td>
              <Table.Td>₱{reservation.BALANCE}</Table.Td>
              <Table.Td>
                {`${Math.max(
                  1,
                  moment
                    .duration(
                      moment(reservation.END_DATE).diff(
                        moment(reservation.START_DATE),
                      ),
                    )
                    .asDays(),
                )} ${
                  Math.max(
                    1,
                    moment
                      .duration(
                        moment(reservation.END_DATE).diff(
                          moment(reservation.START_DATE),
                        ),
                      )
                      .asDays(),
                  ) === 1
                    ? 'day'
                    : 'days'
                }`}
              </Table.Td>
            </Table.Tr>
          ))
        ) : (
          <Table.Tr>
            <Table.Td colSpan={11}>
              <NoRecords
                message={
                  sortingCriteria === 'Today'
                    ? 'No reservations today'
                    : sortingCriteria === 'Upcoming'
                    ? 'No upcoming reservations'
                    : 'No reservations'
                }
              />
            </Table.Td>
          </Table.Tr>
        )}
      </>
    );
  };

  const renderInfoTab = () => {
    return (
      <>
        <Group justify="space-between">
          <Text>Name</Text>
          <Text fw={700}>{selectedReservation.NAME}</Text>
        </Group>

        <Group mt="xs" justify="space-between">
          <Text>Email</Text>
          <Text fw={700}>{selectedReservation.EMAIL}</Text>
        </Group>

        <Group mt="xs" mb="xs" justify="space-between">
          <Text>Phone</Text>
          <Text fw={700}>{selectedReservation.PHONE_NUMBER}</Text>
        </Group>

        <hr />

        <Group mt="xs" justify="space-between">
          <Text>Service</Text>
          <Text fw={700}>
            {selectedReservation.SERVICE_TYPE} -{' '}
            {selectedReservation.SERVICE_NAME}
          </Text>
        </Group>

        <Group mt="xs" justify="space-between">
          <Text>Start Date</Text>
          <Text fw={700}>
            {moment(selectedReservation.START_DATE).format('ll')}
          </Text>
        </Group>

        <Group mt="xs" mb="xs" justify="space-between">
          <Text>End Date</Text>
          <Text fw={700}>
            {moment(selectedReservation.END_DATE).format('ll')}
          </Text>
        </Group>
      </>
    );
  };

  const renderPaymentHistoryTab = () => {
    return (
      <Box key={nanoid()} mb="sm">
        {selectedReservation?.PAYMENT_HISTORY ? (
          selectedReservation.PAYMENT_HISTORY.sort(
            (a, b) =>
              moment(a.dop, 'MMM DD, YYYY') - moment(b.dop, 'MMM DD, YYYY'),
          ).map((history) => (
            <Group justify="space-between" key={nanoid()} p="xs" style={{}}>
              <Text fw={700}>₱{history.amount}</Text>
              <Text>{history.method}</Text>
              <Text>{history.dop}</Text>
            </Group>
          ))
        ) : (
          <NoRecords message="No payment history" />
        )}
      </Box>
    );
  };

  useEffect(() => {
    getReservations();
  }, []);

  return (
    <Box pos="relative" mih={200}>
      <Group mb="sm" align="center" justify="space-between">
        <Text size="xl">Reservations - {sortingCriteria}</Text>

        <Group>
          {['Today', 'Upcoming', 'All'].map((f) => (
            <div key={f}>
              <Button
                color="#006400"
                variant={sortingCriteria.includes(f) ? 'filled' : 'outline'}
                disabled={isFetching}
                onClick={() => setSortingCriteria(f)}
              >
                {f}
              </Button>
            </div>
          ))}
        </Group>
      </Group>
      {isFetching && <ComponentLoader message="Fetching reservations" />}
      {!isFetching && fetchError && <ComponentError message={fetchError} />}
      {!isFetching && !fetchError && (
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
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Phone</Table.Th>
                  <Table.Th>Service Name</Table.Th>
                  <Table.Th>Service Type</Table.Th>
                  <Table.Th>Start Date</Table.Th>
                  <Table.Th>End Date</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Balance</Table.Th>
                  <Table.Th>Duration</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{renderTable(filterReservations())}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>
          <Group justify="center" mt="md" c="gray">
            <Text c="darkgreen">{`${sortingCriteria}: ${
              filterReservations().length
            }`}</Text>
          </Group>
        </>
      )}

      <Modal
        centered
        title="Process Payment"
        shadow="xl"
        opened={isProcessPaymentModalOpen}
        onClose={() => closeProcessPaymentModal()}
        closeButtonProps={{
          bg: 'crimson',
          radius: '50%',
          c: 'white',
        }}
        styles={{
          title: { color: 'darkgreen', fontSize: '1.7rem' },
          inner: { padding: 5 },
        }}
        withCloseButton={!isProcessingPayment}
        closeOnClickOutside={!isProcessingPayment}
        closeOnEscape={!isProcessingPayment}
      >
        <Flex direction="column" w="100%">
          <Tabs defaultValue="info" color="darkgreen" variant="default">
            <Tabs.List grow justify="space-between">
              <Tabs.Tab value="info">Information</Tabs.Tab>
              <Tabs.Tab value="history">Payment History</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="info" pt="md">
              {renderInfoTab()}

              <hr />

              <Group mt="xs" justify="space-between">
                <Text>Total Amount</Text>
                <Text fw={700}>₱{selectedReservation.AMOUNT}</Text>
              </Group>
              <Group mt="xs" justify="space-between">
                <Text>Balance</Text>
                <Text fw={700}>₱{selectedReservation.BALANCE}</Text>
              </Group>

              {selectedReservation.BALANCE > 0 ? (
                <form
                  onSubmit={form.onSubmit((values) => {
                    handleProcessPayment(values);
                  })}
                >
                  <Flex mt="xs">
                    <DateInput
                      label="Date of Payment"
                      placeholder="Date of Payment"
                      maxDate={new Date()}
                      styles={{
                        label: { fontWeight: 700 },
                      }}
                      {...form.getInputProps('dop')}
                    />

                    <TextInput
                      withAsterisk
                      label="Mode of Payment"
                      placeholder="Cash"
                      ml="sm"
                      styles={{
                        label: { fontWeight: 700 },
                      }}
                      {...form.getInputProps('method')}
                    />
                  </Flex>
                  <NumberInput
                    withAsterisk
                    label="Amount"
                    placeholder="0.00"
                    mb="sm"
                    min={0}
                    styles={{
                      label: { fontWeight: 700 },
                    }}
                    {...form.getInputProps('amount')}
                  />

                  <Button
                    fullWidth
                    type="submit"
                    color="#006400"
                    loading={isProcessingPayment}
                  >
                    Pay
                  </Button>
                </form>
              ) : (
                <Text mt="sm" c="darkgreen" align="center" fw={700}>
                  This reservation is fully paid
                </Text>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="history" pt="md">
              {renderPaymentHistoryTab()}
            </Tabs.Panel>
          </Tabs>
        </Flex>
      </Modal>
    </Box>
  );
}

export default AdminDashboard;
