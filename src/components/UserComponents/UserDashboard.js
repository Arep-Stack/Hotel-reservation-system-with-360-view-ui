import {
  Box,
  Button,
  Card,
  Flex,
  NumberFormatter,
  Paper,
  Table,
  Text,
} from '@mantine/core';
import { IconBed, IconBuildingPavilion } from '@tabler/icons-react';
import { IconSwimming } from '@tabler/icons-react';
import axios from 'axios';
import moment from 'moment';
import { useEffect, useState } from 'react';

import {
  renderReservationDateStatus,
  renderReservationServiceType,
  sortReservations,
} from '../../utils/renderTableHelper';
import { getUser } from '../../utils/user';
import ComponentError from '../utils/ComponentError';
import ComponentLoader from '../utils/ComponentLoader';
import NoRecords from '../utils/NoRecords';

function UserDashboard() {
  //reservations
  const [userReservations, setUserReservations] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  //dashboard
  const [dashboardTotals, setDashboardTotals] = useState([]);

  //functions
  const getAllReservations = () => {
    setIsFetching(true);
    const user = JSON.parse(getUser());

    axios({
      method: 'GET',
      url: '/services',
    })
      .then((dataServices) => {
        if (!!dataServices.data)
          axios({
            method: 'GET',
            url: '/reservations',
          })
            .then((dataReservations) => {
              const userReservations = dataReservations?.data
                ?.filter((r) => r.USER_ID === user.ID)
                ?.map((el) => {
                  const { NAME, TYPE } = dataServices?.data?.find(
                    (s) => s.ID === el.SERVICE_ID,
                  );

                  return {
                    ...el,
                    SERVICE_NAME: NAME,
                    SERVICE_TYPE: TYPE,
                  };
                });

              const totals = ['Room', 'Pavilion', 'Pool'].map((service) => ({
                service,
                total: userReservations?.filter(
                  (r) => r.SERVICE_TYPE === service,
                )?.length,
                cancelled: userReservations?.filter(
                  (r) => r.SERVICE_TYPE === service && r.STATUS === 'Cancelled',
                )?.length,
              }));

              setDashboardTotals(totals);

              setUserReservations(sortReservations(userReservations));
            })
            .catch(() => setFetchError('An error occurred'))
            .finally(() => setIsFetching(false));
      })
      .catch(() => {
        setFetchError('An error occurred');
        setIsFetching(false);
      });
  };

  const renderTable = () => {
    return (
      <>
        {userReservations.length ? (
          userReservations?.map((reservation) => (
            <Table.Tr key={reservation?.ID}>
              <Table.Td>{renderReservationDateStatus(reservation)}</Table.Td>
              <Table.Td>{renderReservationServiceType(reservation)}</Table.Td>
              <Table.Td>
                {moment(reservation?.START_DATE).format('ll')} -{' '}
                {moment(reservation?.END_DATE).format('ll')}{' '}
              </Table.Td>
              <Table.Td>{`${Math.max(
                1,
                moment
                  .duration(
                    moment(reservation?.END_DATE).diff(
                      moment(reservation?.START_DATE),
                    ),
                  )
                  .asDays(),
              )} ${
                Math.max(
                  1,
                  moment
                    .duration(
                      moment(reservation?.END_DATE).diff(
                        moment(reservation?.START_DATE),
                      ),
                    )
                    .asDays(),
                ) === 1
                  ? 'day'
                  : 'days'
              }`}</Table.Td>

              <Table.Td>
                <Text
                  fw={700}
                  c={
                    reservation.STATUS === 'Unpaid' ||
                    reservation.STATUS === 'Cancelled'
                      ? '#8B0000'
                      : reservation?.STATUS === 'Paid - Partial'
                      ? '#6495ED'
                      : '#006400'
                  }
                >
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
                <Button
                  disabled={
                    !reservation?.BALANCE || reservation?.STATUS === 'Cancelled'
                  }
                >
                  Pay
                </Button>
              </Table.Td>
            </Table.Tr>
          ))
        ) : (
          <Table.Tr>
            <Table.Td colSpan={7}>
              <NoRecords message="No reservations" />
            </Table.Td>
          </Table.Tr>
        )}
      </>
    );
  };

  useEffect(() => {
    getAllReservations();
  }, []);

  return (
    <Box pos="relative" mih={200}>
      {isFetching && <ComponentLoader message="Fetching dashboard" />}
      {!isFetching && fetchError && <ComponentError message={fetchError} />}
      {!isFetching && !fetchError && (
        <>
          <Flex justify="space-between" mb="md" gap="md">
            {dashboardTotals.map(({ service, total, cancelled }) => (
              <Card key={service} withBorder flex={1} shadow="md">
                <Flex align="center">
                  <Paper
                    withBorder
                    pl="xs"
                    pr="xs"
                    pt="xs"
                    mr="sm"
                    bg="#006400"
                    c="white"
                  >
                    {service === 'Room' && <IconBed />}
                    {service === 'Pavilion' && <IconBuildingPavilion />}
                    {service === 'Pool' && <IconSwimming />}
                  </Paper>

                  <Flex direction="column">
                    <Text size="lg">
                      {total} {total > 0 ? `${service}s` : service}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {cancelled}{' '}
                      {cancelled !== 1 ? 'cancellations' : 'cancellation'}
                    </Text>
                  </Flex>
                </Flex>
              </Card>
            ))}
          </Flex>

          <Paper withBorder p="md">
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
                    <Table.Th></Table.Th>
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody>{renderTable()}</Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Paper>
        </>
      )}
    </Box>
  );
}

export default UserDashboard;
