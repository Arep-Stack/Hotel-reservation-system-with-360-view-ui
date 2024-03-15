import {
  ActionIcon,
  Box,
  Button,
  Flex,
  Group,
  Modal,
  NumberFormatter,
  NumberInput,
  Table,
  Tabs,
  Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconBrandPaypal, IconCircleX, IconTrash } from '@tabler/icons-react';
import axios from 'axios';
import moment from 'moment';
import { nanoid } from 'nanoid';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { GlobalContext } from '../../App';
import {
  calculateDuration,
  getCountForDashboard,
  renderReservationDateStatus,
  renderReservationServiceType,
  renderTableDate,
  sortReservations,
  statusColorChanger,
} from '../../utils/renderTableHelper';
import { getUser } from '../../utils/user';
import DashboardCard from '../DashboardCard/DashboardCard';
import ComponentError from '../utils/ComponentError';
import ComponentLoader from '../utils/ComponentLoader';
import NoRecords from '../utils/NoRecords';

function UserDashboard() {
  //context
  const {
    getAllReservations,
    allReservations,
    allReservationsError,
    allReservationsLoading,
    allServices,
  } = useContext(GlobalContext);

  const [selectedReservation, setSelectedReservation] = useState({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isCancellingReservation, setIsCancellingReservation] = useState(false);

  const user = JSON.parse(getUser());

  const syncedData = allReservations
    ?.map((reservation) => {
      const {
        NAME: SERVICE_NAME,
        PERSONS,
        PRICE,
        TYPE,
        IS_DELETED,
      } = allServices?.find(
        (service) => service.ID === reservation?.SERVICE_ID,
      ) || {};

      return {
        ...reservation,
        SERVICE_NAME,
        PERSONS,
        PRICE,
        TYPE,
        IS_DELETED,
      };
    })
    ?.filter((r) => r?.USER_ID === user?.ID);

  //modal
  const [
    isPayPalModalOpen,
    { open: openPayPalModal, close: closePayPalModal },
  ] = useDisclosure(false);

  const [
    isCancellationModalOpen,
    { open: openCancelModal, close: closeCancelModal },
  ] = useDisclosure(false);

  //form
  let form = useForm({
    initialValues: {
      amount: 0,
    },

    validate: {
      amount: (value) =>
        value > 0
          ? value > selectedReservation.BALANCE
            ? 'Amount is greater than balance'
            : null
          : 'Please enter a valid amount',
    },
  });

  //function
  const handleOpenPaypalWindow = (amount) => {
    closePayPalModal();
    setIsProcessingPayment(true);

    const paypalWindow = window.open(
      `${process.env.REACT_APP_BE_BASE_URL}/pay?id=${selectedReservation?.ID}&amount=${amount}`,
      '_blank',
      'height=600 width=500 top=' +
        (window.outerHeight / 2 + window.screenY - 600 / 2) +
        ',left=' +
        (window.outerWidth / 2 + window.screenX - 500 / 2),
    );

    const checkPaypalWindow = setInterval(() => {
      if (paypalWindow.closed) {
        setIsProcessingPayment(false);
        clearInterval(checkPaypalWindow);
      }
    }, 500);

    return () => {
      clearInterval(checkPaypalWindow);
    };
  };

  const handleOpenPayPalModal = (reservation) => {
    form.reset();
    setSelectedReservation(reservation);
    openPayPalModal();
  };

  const handleProcessPayment = () => {
    selectedReservation?.PAYMENT_HISTORY.push({
      amount: form.values.amount,
      dop: moment().format('ll'),
      method: 'PayPal',
    });

    const paymentHistory = selectedReservation?.PAYMENT_HISTORY;

    const balance = selectedReservation?.BALANCE - form.values?.amount;

    const status = balance <= 0 ? 'Fully Paid' : 'Paid - Partial';

    const requiredDP = Math.floor(selectedReservation?.AMOUNT * 0.3);
    const totalAmountPaid = selectedReservation?.AMOUNT - balance;

    axios({
      method: 'PUT',
      url: `/reservations/${selectedReservation?.ID}`,
      data: {
        ...selectedReservation,
        BALANCE: balance,
        IS_DOWNPAYMENT_PAID: totalAmountPaid >= requiredDP,
        PAYMENT_HISTORY: paymentHistory,
        STATUS: status,
      },
    })
      .then(() => {
        getAllReservations();

        toast.success('Successfully paid', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1500,
        });
      })
      .catch(() =>
        toast.error('An error occurred', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1500,
        }),
      )
      .finally(() => setIsProcessingPayment(false));
  };

  const handleOpenCancellationModal = (reservation) => {
    setSelectedReservation(reservation);
    openCancelModal();
  };

  const handleCancelReservation = () => {
    setIsCancellingReservation(true);

    axios({
      method: 'PUT',
      url: `/reservations/${selectedReservation?.ID}`,
      data: {
        ...selectedReservation,
        STATUS: 'Cancelled',
      },
    })
      .then(() => {
        getAllReservations();

        closeCancelModal();

        toast.info('Reservation cancelled', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1500,
        });
      })
      .catch(() =>
        toast.error('An error occurred', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1500,
        }),
      )
      .finally(() => setIsCancellingReservation(false));
  };

  //render
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
    const sortedReservation = sortReservations(syncedData);

    if (sortedReservation?.length > 0) {
      return sortedReservation?.map((reservation) => (
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

          <Table.Td>{renderReservationServiceType(reservation)}</Table.Td>

          <Table.Td>
            {renderTableDate(
              reservation?.START_DATE,
              reservation?.END_DATE,
              reservation?.TYPE,
            )}
          </Table.Td>

          <Table.Td>{reservation?.PAX}</Table.Td>

          <Table.Td>
            {calculateDuration(
              reservation?.START_DATE,
              reservation?.END_DATE,
              reservation?.TYPE,
            )}
          </Table.Td>

          <Table.Td>
            <Text c={statusColorChanger(reservation)}>
              {reservation?.STATUS}
            </Text>
          </Table.Td>

          <Table.Td>
            <NumberFormatter
              thousandSeparator
              value={reservation?.AMOUNT}
              prefix="₱"
            />
          </Table.Td>
          <Table.Td>
            <NumberFormatter
              thousandSeparator
              value={reservation?.BALANCE}
              prefix="₱"
            />
          </Table.Td>

          <Table.Td>
            <Flex direction="row" gap="sm">
              <ActionIcon
                variant="light"
                loading={
                  isProcessingPayment &&
                  selectedReservation?.ID === reservation?.ID
                }
                disabled={
                  isProcessingPayment &&
                  selectedReservation?.ID !== reservation?.ID
                }
                onClick={() => handleOpenPayPalModal(reservation)}
              >
                <IconBrandPaypal />
              </ActionIcon>

              <ActionIcon
                variant="light"
                color="#FF0800"
                disabled={
                  reservation?.STATUS === 'Cancelled' ||
                  moment().isAfter(reservation?.END_DATE)
                }
                onClick={() => handleOpenCancellationModal(reservation)}
              >
                <IconCircleX />
              </ActionIcon>
            </Flex>
          </Table.Td>
        </Table.Tr>
      ));
    } else {
      return (
        <Table.Tr>
          <Table.Td colSpan={8}>
            <NoRecords />
          </Table.Td>
        </Table.Tr>
      );
    }
  };

  const renderTableLength = () => {
    return (
      syncedData?.length > 0 && (
        <Text
          mt="sm"
          mb="sm"
          c="gray"
          align="center"
        >{`${syncedData.length} Total Reservation`}</Text>
      )
    );
  };

  const renderPayPalModalAmountTab = () => {
    return (
      <>
        <Group mb="xs" justify="space-between">
          <Text>Service</Text>
          <div style={{ fontWeight: 700 }}>
            {renderReservationServiceType(selectedReservation)}
          </div>
        </Group>

        <Group fw={700} mb="xs" justify="space-between">
          <Text>Service Price</Text>
          <div>
            <NumberFormatter
              thousandSeparator
              prefix="₱"
              value={selectedReservation?.PRICE}
            />

            {selectedReservation?.TYPE === 'Room' ? '/night' : '/hour'}
          </div>
        </Group>

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

        {selectedReservation?.STATUS !== 'Cancelled' &&
        selectedReservation?.IS_DOWNPAYMENT_PAID ? (
          selectedReservation?.BALANCE > 0 && (
            <Text c="#006400" align="center">
              Down payment is paid
            </Text>
          )
        ) : (
          <Group fw={700} mb="xs" justify="space-between">
            <Text style={{ alignSelf: 'start' }}>Required Downpayment</Text>
            <Flex direction="column" align="end">
              <NumberFormatter
                thousandSeparator
                prefix="₱"
                value={Math.floor(selectedReservation?.AMOUNT * 0.3)}
              />
              <Text size="xs" mb="xs" mt="xs">
                (30% of {selectedReservation?.AMOUNT})
              </Text>
              {renderReservationDateStatus(selectedReservation)}
            </Flex>
          </Group>
        )}
      </>
    );
  };

  const renderPayPalModalHistoryTab = () => {
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

  const renderCancellationModalBody = () => {
    if (selectedReservation) {
      return (
        <>
          <Text align="center" my="md">
            Are you sure you want to cancel? All payments made are
            non-refundable.
          </Text>

          <Text size="xl" fw={900} align="center">
            {selectedReservation?.SERVICE_NAME}
          </Text>

          <Flex justify="center">
            {renderTableDate(
              selectedReservation?.START_DATE,
              selectedReservation?.END_DATE,
              selectedReservation?.TYPE,
            )}
          </Flex>

          <Button
            fullWidth
            mt="md"
            color="#FF0800"
            tt="uppercase"
            fw={400}
            leftSection={<IconTrash />}
            loading={isCancellingReservation}
            onClick={handleCancelReservation}
          >
            I understand
          </Button>
        </>
      );
    }
  };

  useEffect(() => {
    let isMessageHandled = false;
    const messageListener = (event) => {
      if (isMessageHandled) {
        return;
      }

      if (
        typeof event.data === 'string' &&
        event.data.startsWith('PAYPAL_SUCCESS')
      ) {
        handleProcessPayment();
      } else {
        setIsProcessingPayment(false);
      }

      isMessageHandled = true;
    };

    window.addEventListener('message', messageListener);

    return () => {
      window.removeEventListener('message', messageListener);
    };
  }, [selectedReservation?.ID, isProcessingPayment]);

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

          <Table.ScrollContainer
            minWidth={500}
            mah="calc(100vh - 24rem)"
            mih={0}
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
                  <Table.Th>Service</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Pax</Table.Th>
                  <Table.Th>Duration</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Balance</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>{renderTable()}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          {syncedData?.length > 0 && renderTableLength()}
        </>
      )}

      <Modal
        centered
        title="Payment Information"
        shadow="xl"
        opened={isPayPalModalOpen}
        onClose={closePayPalModal}
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
        <Flex direction="column">
          <Tabs defaultValue="amount" color="darkgreen" variant="default">
            <Tabs.List grow justify="space-between">
              <Tabs.Tab value="amount">Amount</Tabs.Tab>
              <Tabs.Tab value="history">Payment History</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="amount" pt="md">
              {renderPayPalModalAmountTab()}

              {selectedReservation?.STATUS !== 'Cancelled' &&
                selectedReservation?.BALANCE > 0 && (
                  <form
                    onSubmit={form.onSubmit(({ amount }) =>
                      handleOpenPaypalWindow(amount),
                    )}
                  >
                    <NumberInput
                      withAsterisk
                      mt="sm"
                      mb="xs"
                      label="Amount"
                      placeholder="0.00"
                      min={0}
                      styles={{
                        label: { fontWeight: 700 },
                      }}
                      {...form.getInputProps('amount')}
                    />

                    <Button
                      fullWidth
                      type="submit"
                      fw="normal"
                      color="#006400"
                      leftSection={<IconBrandPaypal />}
                    >
                      Pay with PayPal
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
              {renderPayPalModalHistoryTab()}
            </Tabs.Panel>
          </Tabs>
        </Flex>
      </Modal>

      <Modal
        centered
        title="Cancel Reservation"
        shadow="xl"
        opened={isCancellationModalOpen}
        onClose={closeCancelModal}
        closeButtonProps={{
          bg: 'crimson',
          radius: '50%',
          c: 'white',
        }}
        styles={{
          title: { color: '#FF0800', fontSize: '1.7rem' },
          inner: { padding: 5 },
        }}
        withCloseButton={!isCancellingReservation}
        closeOnClickOutside={!isCancellingReservation}
        closeOnEscape={!isCancellingReservation}
      >
        {renderCancellationModalBody()}
      </Modal>
    </Box>
  );
}

export default UserDashboard;
