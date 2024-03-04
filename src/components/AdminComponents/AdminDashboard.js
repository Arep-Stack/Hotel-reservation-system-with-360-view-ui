import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Modal,
  NumberFormatter,
  NumberInput,
  Paper,
  Table,
  Tabs,
  Text,
  TextInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconWallet } from '@tabler/icons-react';
import axios from 'axios';
import moment from 'moment';
import { nanoid } from 'nanoid';
import { useContext, useState } from 'react';
import { toast } from 'react-toastify';

import { GlobalContext } from '../../App';
import {
  calculateDuration,
  capitalize,
  filterReservationsByCriteria,
  getCountForDashboard,
  renderReservationDateStatus,
  renderReservationServiceType,
  renderTableDate,
  sortReservations,
  statusColorChanger,
} from '../../utils/renderTableHelper';
import DashboardCard from '../DashboardCard/DashboardCard';
import ComponentError from '../utils/ComponentError';
import ComponentLoader from '../utils/ComponentLoader';
import NoRecords from '../utils/NoRecords';

function AdminDashboard() {
  //context
  const {
    getAllReservations,
    allReservations,
    allReservationsError,
    allReservationsLoading,
    allUsers,
    allServices,
  } = useContext(GlobalContext);

  const syncedData = allReservations?.map((reservation) => {
    //USER
    const { FIRSTNAME, LASTNAME, EMAIL, PHONE_NUMBER } =
      allUsers?.find((user) => user.ID === reservation?.USER_ID) || {};

    //SERVICE
    const {
      NAME: SERVICE_NAME,
      PERSONS,
      PRICE,
      TYPE,
      IS_DELETED,
    } = allServices?.find(
      (service) => service.ID === reservation?.SERVICE_ID,
    ) || {};

    //Return
    return {
      ...reservation,
      FIRSTNAME,
      LASTNAME,
      EMAIL,
      PHONE_NUMBER,
      SERVICE_NAME,
      PERSONS,
      PRICE,
      TYPE,
      IS_DELETED,
    };
  });

  //processing payment
  const [selectedReservation, setSelectedReservation] = useState(null);
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

  // modal
  const [
    isProcessPaymentModalOpen,
    { open: openProcessPaymentModal, close: closeProcessPaymentModal },
  ] = useDisclosure(false);

  //functions
  const handleOpenModal = (reservation) => {
    setSelectedReservation(reservation);
    openProcessPaymentModal();
  };

  const handleProcessPayment = ({ amount, method, dop }) => {
    setIsProcessingPayment(true);

    const data = allReservations?.find((r) => r.ID === selectedReservation.ID);

    data.BALANCE = data.BALANCE - amount;

    const requiredDP = Math.floor(data.AMOUNT * 0.3);
    const totalAmountPaid = data.AMOUNT - data.BALANCE;
    if (totalAmountPaid >= requiredDP) data.IS_DOWNPAYMENT_PAID = true;

    data.STATUS = data.BALANCE === 0 ? 'Fully Paid' : 'Paid - Partial';

    data.PAYMENT_HISTORY.push({
      amount,
      dop: moment(dop).format('ll'),
      method,
    });

    axios({
      method: 'PUT',
      url: `/reservations/${data.ID}`,
      data: data,
    })
      .then(() => {
        getAllReservations();
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

  //renders
  const renderDashboardTotals = () => {
    const dashboardTotals = [
      getCountForDashboard(syncedData, 'Room'),
      getCountForDashboard(syncedData, 'Pavilion'),
      getCountForDashboard(syncedData, 'Pool'),
    ];

    return dashboardTotals?.map(({ service, total, cancelled }) => (
      <DashboardCard
        key={service}
        service={service}
        total={total}
        cancelled={cancelled}
      />
    ));
  };

  const renderTable = () => {
    const filteredReservations = sortReservations(
      filterReservationsByCriteria(sortingCriteria, syncedData),
    );

    if (filteredReservations?.length > 0) {
      return filteredReservations?.map((reservation) => (
        <Table.Tr
          key={reservation?.ID}
          bg={
            reservation?.STATUS !== 'Cancelled' &&
            !reservation?.IS_DOWNPAYMENT_PAID
              ? '#FFCDD2'
              : ''
          }
        >
          <Table.Td>{renderReservationDateStatus(reservation)}</Table.Td>

          <Table.Td>
            <Flex direction="column">
              <Text>
                {capitalize(reservation?.FIRSTNAME) +
                  ' ' +
                  capitalize(reservation?.LASTNAME)}
              </Text>
              <Text size="xs" c="dimmed">
                {reservation?.EMAIL}
              </Text>
            </Flex>
          </Table.Td>

          <Table.Td>
            <Text size="sm">{reservation?.PHONE_NUMBER}</Text>
          </Table.Td>

          <Table.Td>{renderReservationServiceType(reservation)}</Table.Td>

          <Table.Td>
            {renderTableDate(
              reservation?.START_DATE,
              reservation?.END_DATE,
              reservation?.TYPE,
            )}
          </Table.Td>

          <Table.Td>
            {calculateDuration(reservation?.START_DATE, reservation?.END_DATE)}
          </Table.Td>

          <Table.Td>
            <Text c={statusColorChanger(reservation)}>
              {reservation?.STATUS}
            </Text>
          </Table.Td>

          <Table.Td>
            <NumberFormatter
              thousandSeparator
              prefix="₱"
              value={reservation?.BALANCE}
            />
          </Table.Td>

          <Table.Td>
            <ActionIcon
              variant="transparent"
              onClick={() => handleOpenModal(reservation)}
            >
              <IconWallet color="#027802" />
            </ActionIcon>
          </Table.Td>
        </Table.Tr>
      ));
    } else {
      return (
        <Table.Tr>
          <Table.Td colSpan={9}>
            <NoRecords />
          </Table.Td>
        </Table.Tr>
      );
    }
  };

  const renderInfoTab = () => {
    return (
      <>
        <Group mb="xs" justify="space-between">
          <Text>Name</Text>
          <Text fw={700}>
            {selectedReservation?.FIRSTNAME +
              ' ' +
              selectedReservation?.LASTNAME}
          </Text>
        </Group>

        <Group mb="xs" justify="space-between">
          <Text>Email</Text>
          <Text fw={700}>{selectedReservation?.EMAIL}</Text>
        </Group>

        <Group mb="xs" justify="space-between">
          <Text>Phone</Text>
          <Text fw={700}>{selectedReservation?.PHONE_NUMBER}</Text>
        </Group>

        <Divider mb="xs" />

        <Group mb="xs" justify="space-between">
          <Text>Service</Text>
          <div style={{ fontWeight: 700 }}>
            {renderReservationServiceType(selectedReservation)}
          </div>
        </Group>

        <Group mb="xs" justify="space-between">
          <Text>Start Date</Text>
          <Text fw={700}>
            {moment(selectedReservation?.START_DATE).format('ll')}
          </Text>
        </Group>

        <Group mb="xs" justify="space-between">
          <Text>End Date</Text>
          <Text fw={700}>
            {moment(selectedReservation?.END_DATE).format('ll')}
          </Text>
        </Group>
      </>
    );
  };

  const renderPaymentHistoryTab = () => {
    return (
      <Box mb="sm">
        {selectedReservation?.PAYMENT_HISTORY?.length > 0 ? (
          selectedReservation.PAYMENT_HISTORY.sort(
            (a, b) =>
              moment(a.dop, 'MMM DD, YYYY') - moment(b.dop, 'MMM DD, YYYY'),
          ).map((history) => (
            <Group
              fw={700}
              justify="space-between"
              key={nanoid()}
              p="xs"
              style={{}}
            >
              <NumberFormatter
                thousandSeparator
                prefix="₱"
                value={history.amount}
              />
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

  const renderTableLength = () => {
    const filteredReservations = filterReservationsByCriteria(
      sortingCriteria,
      allReservations,
    );

    return (
      <Text
        mt="sm"
        mb="sm"
        c="gray"
        align="center"
      >{`${sortingCriteria}: ${filteredReservations.length}`}</Text>
    );
  };

  return (
    <Box pos="relative" mih={200}>
      {allReservationsLoading && (
        <ComponentLoader message="Fetching dashboard" />
      )}

      {!allReservationsLoading && allReservationsError && (
        <ComponentError message={allReservationsError} />
      )}

      {!allReservationsLoading && !allReservationsError && (
        <>
          <Flex justify="space-between" mb="md" gap="md">
            {renderDashboardTotals()}
          </Flex>

          <Paper withBorder pt="sm">
            <Group mb="sm" align="center" justify="center">
              {[
                'Today',
                'Upcoming',
                'On-going',
                'Finished',
                'All',
                'Cancelled',
              ].map((f) => (
                <div key={f}>
                  <Button
                    size="xs"
                    color="#2F6C2F"
                    disabled={allReservationsLoading || allReservationsError}
                    variant={sortingCriteria.includes(f) ? 'filled' : 'light'}
                    onClick={() => setSortingCriteria(f)}
                  >
                    {f}
                  </Button>
                </div>
              ))}
            </Group>

            <Table.ScrollContainer
              minWidth={500}
              mah="calc(100vh - 26.5rem)"
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
                    <Table.Th>Phone</Table.Th>
                    <Table.Th>Service</Table.Th>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Duration</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Balance</Table.Th>
                    <Table.Th>Payment</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{renderTable()}</Table.Tbody>
              </Table>
            </Table.ScrollContainer>

            {renderTableLength()}
          </Paper>
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

              <Divider mb="xs" />

              <Group mb="xs" justify="space-between">
                <Text>Duration</Text>
                <Text fw={700}>
                  {calculateDuration(
                    selectedReservation?.START_DATE,
                    selectedReservation?.END_DATE,
                  )}
                </Text>
              </Group>

              <Group fw={700} mb="xs" justify="space-between">
                <Text>Service Price</Text>
                <NumberFormatter
                  thousandSeparator
                  prefix="₱"
                  value={selectedReservation?.PRICE}
                />
              </Group>

              <Divider mb="xs" />

              <Group fw={700} mb="xs" justify="space-between">
                <Text>Total Amount</Text>
                <NumberFormatter
                  thousandSeparator
                  prefix="₱"
                  value={selectedReservation?.AMOUNT}
                />
              </Group>

              <Group fw={700} mb="xs" justify="space-between">
                <Text>Balance</Text>
                <NumberFormatter
                  thousandSeparator
                  prefix="₱"
                  value={selectedReservation?.BALANCE}
                />
              </Group>

              {!selectedReservation?.IS_DOWNPAYMENT_PAID && (
                <Group fw={700} mb="xs" justify="space-between">
                  <Text>Required Downpayment</Text>
                  <Flex direction="row" align="center" gap="sm">
                    <Text size="sm">
                      (30% of ₱{selectedReservation?.AMOUNT})
                    </Text>
                    <NumberFormatter
                      thousandSeparator
                      value={Math.floor(selectedReservation?.AMOUNT * 0.3)}
                      prefix="₱"
                    />
                  </Flex>
                </Group>
              )}

              {selectedReservation?.STATUS !== 'Cancelled' &&
                selectedReservation?.BALANCE > 0 && (
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
                )}

              {selectedReservation?.STATUS !== 'Cancelled' &&
                selectedReservation?.BALANCE === 0 && (
                  <Text mt="sm" c="darkgreen" align="center" fw={700}>
                    This reservation is fully paid
                  </Text>
                )}

              {selectedReservation?.STATUS === 'Cancelled' && (
                <Text mt="sm" c="#FF0800" align="center" fw={700}>
                  This reservation is cancelled
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
