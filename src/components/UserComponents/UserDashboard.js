import {
  ActionIcon,
  Box,
  Flex,
  NumberFormatter,
  Table,
  Text,
} from '@mantine/core';
import { IconBrandPaypal } from '@tabler/icons-react';
import axios from 'axios';
import moment from 'moment';
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

  //function
  const handleOpenPaypal = (reservation) => {
    setSelectedReservation(reservation);
    setIsProcessingPayment(true);

    const paypalWindow = window.open(
      `${process.env.REACT_APP_BE_BASE_URL}/pay?id=${reservation?.ID}`,
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

  const handleProcessPayment = () => {
    selectedReservation?.PAYMENT_HISTORY.push({
      amount: selectedReservation?.BALANCE,
      dop: moment().format('ll'),
      method: 'PayPal',
    });

    const paymentHistory = selectedReservation?.PAYMENT_HISTORY;

    axios({
      method: 'PUT',
      url: `/reservations/${selectedReservation?.ID}`,
      data: {
        ...selectedReservation,
        BALANCE: 0,
        IS_DOWNPAYMENT_PAID: true,
        PAYMENT_HISTORY: paymentHistory,
        STATUS: 'Fully Paid',
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
            <ActionIcon
              loading={
                isProcessingPayment &&
                selectedReservation?.ID === reservation?.ID
              }
              disabled={
                reservation?.STATUS === 'Fully Paid' ||
                (isProcessingPayment &&
                  selectedReservation?.ID !== reservation?.ID)
              }
              variant="light"
              onClick={() => handleOpenPaypal(reservation)}
            >
              <IconBrandPaypal />
            </ActionIcon>
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
                  <Table.Th>Duration</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Balance</Table.Th>
                  <Table.Th>Payment</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>{renderTable()}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          {syncedData?.length > 0 && renderTableLength()}
        </>
      )}
    </Box>
  );
}

export default UserDashboard;
