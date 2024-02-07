import { Box, Button, Group, Table, Text } from '@mantine/core';
import axios from 'axios';
import moment from 'moment';
import { useEffect, useState } from 'react';

import ComponentError from '../utils/ComponentError';
import ComponentLoader from '../utils/ComponentLoader';
import NoRecords from '../utils/NoRecords';

function AdminDashboard() {
  //fetching reservation
  const [reservations, setReservations] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  //filter
  const [sortingCriteria, setSortingCriteria] = useState('Today');

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
                if (!!dataReservations) {
                  const newReservations = dataReservations.data.map(
                    (reservation) => {
                      const { FIRSTNAME, LASTNAME, EMAIL } =
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

  const renderTable = (filteredReservations) => {
    return (
      <>
        {filteredReservations?.length ? (
          filteredReservations.map((reservation) => (
            <Table.Tr key={reservation.ID}>
              <Table.Td>{reservation.NAME}</Table.Td>
              <Table.Td>{reservation.EMAIL}</Table.Td>
              <Table.Td>{reservation.SERVICE_NAME}</Table.Td>
              <Table.Td>{reservation.SERVICE_TYPE}</Table.Td>
              <Table.Td>{moment(reservation.START_DATE).format('LL')}</Table.Td>
              <Table.Td>{moment(reservation.END_DATE).format('LL')}</Table.Td>
              <Table.Td>{reservation.STATUS}</Table.Td>
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
            <Table.Td colSpan={8}>
              <NoRecords
                message={
                  sortingCriteria === 'Today'
                    ? 'No reservations today'
                    : sortingCriteria === 'Upcoming'
                    ? 'No upcoming reservations'
                    : 'No Records'
                }
              />
            </Table.Td>
          </Table.Tr>
        )}
      </>
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
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Service Name</Table.Th>
                  <Table.Th>Service Type</Table.Th>
                  <Table.Th>Start Date</Table.Th>
                  <Table.Th>End Date</Table.Th>
                  <Table.Th>Status</Table.Th>
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
    </Box>
  );
}

export default AdminDashboard;
