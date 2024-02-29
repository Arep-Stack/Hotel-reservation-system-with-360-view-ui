import { Box, Flex, NumberFormatter, Table, Text } from '@mantine/core';
import moment from 'moment';
import { useContext } from 'react';

import { GlobalContext } from '../../App';
import {
  calculateDuration,
  getCountForDashboard,
  renderReservationDateStatus,
  renderReservationServiceType,
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
    allReservations,
    allReservationsError,
    allReservationsLoading,
    allServices,
  } = useContext(GlobalContext);

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
            {moment(reservation?.START_DATE).format('ll')} -{' '}
            {moment(reservation?.END_DATE).format('ll')}
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
