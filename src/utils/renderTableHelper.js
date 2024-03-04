import { Badge, Flex, Group, Text } from '@mantine/core';
import {
  IconBed,
  IconBuildingPavilion,
  IconSwimming,
} from '@tabler/icons-react';
import moment from 'moment';

const renderReservationDateStatus = (reservation) => {
  const currentDate = moment();
  const start = moment(reservation?.START_DATE);
  const end = moment(reservation?.END_DATE);

  if (reservation?.STATUS === 'Cancelled') {
    return (
      <Badge w="100%" maw={95} variant="outline" color="#960018">
        Cancelled
      </Badge>
    );
  }

  if (reservation?.PAYMENT_HISTORY?.length) {
    const requiredDP = Math.floor(reservation?.AMOUNT * 0.3);
    const totalAmountPaid = reservation?.AMOUNT - reservation?.BALANCE;

    if (totalAmountPaid < requiredDP) {
      return (
        <Badge w="100%" maw={95} variant="filled" color="#960018">
          Insufficient
        </Badge>
      );
    }
  }

  if (!reservation?.IS_DOWNPAYMENT_PAID) {
    return (
      <Badge w="100%" maw={95} variant="filled" color="#960018">
        NO DEPOSIT
      </Badge>
    );
  }

  if (currentDate.isBefore(start)) {
    return (
      <Badge w="100%" maw={95} variant="outline" color="#006400">
        Upcoming
      </Badge>
    );
  } else if (currentDate.isSame(start, 'day')) {
    return (
      <Badge w="100%" maw={95} variant="outline" color="#6F00FF">
        Today
      </Badge>
    );
  } else if (currentDate.isBetween(start, end)) {
    return (
      <Badge w="100%" maw={95} variant="outline" color="#007FFF">
        On going
      </Badge>
    );
  } else if (currentDate.isAfter(end)) {
    return (
      <Badge w="100%" maw={95} variant="outline" color="#2A3439">
        Finished
      </Badge>
    );
  }
};

const renderReservationServiceType = (reservation) => {
  const serviceType = reservation?.TYPE;

  if (serviceType === 'Room') {
    return (
      <Group>
        <IconBed size={20} />
        <Text td={reservation?.IS_DELETED ? 'line-through' : ''}>
          {reservation?.SERVICE_NAME}
        </Text>
      </Group>
    );
  } else if (serviceType === 'Pavilion') {
    return (
      <Group>
        <IconBuildingPavilion size={20} />
        <Text td={reservation?.IS_DELETED ? 'line-through' : ''}>
          {reservation?.SERVICE_NAME}
        </Text>
      </Group>
    );
  } else if (serviceType === 'Pool') {
    return (
      <Group>
        <IconSwimming size={20} />
        <Text td={reservation?.IS_DELETED ? 'line-through' : ''}>
          {reservation?.SERVICE_NAME}
        </Text>
      </Group>
    );
  }
};

const sortReservations = (reservations) => {
  return reservations?.sort(
    (a, b) => new Date(b.START_DATE) - new Date(a.START_DATE),
  );
};

const filterReservationsByCriteria = (criteria, reservations) => {
  const currentDate = moment();

  if (criteria === 'Cancelled') {
    return reservations?.filter((r) => r.STATUS === 'Cancelled');
  } else {
    if (criteria === 'Today') {
      return reservations?.filter((r) =>
        moment(r?.START_DATE).isSame(currentDate, 'day'),
      );
    } else if (criteria === 'Upcoming') {
      return reservations?.filter((r) =>
        moment(r.START_DATE).isAfter(currentDate, 'day'),
      );
    } else if (criteria === 'On-going') {
      return reservations?.filter(
        (r) =>
          moment(r?.START_DATE).isBefore(currentDate, 'day') &&
          moment(r?.END_DATE).isAfter(currentDate, 'day'),
      );
    } else if (criteria === 'Finished') {
      return reservations?.filter((r) =>
        moment(r?.END_DATE).isBefore(currentDate, 'day'),
      );
    } else if (criteria === 'All') {
      return reservations;
    }
  }
};

const calculateDuration = (start, end, type) => {
  const a = moment(start);
  const b = moment(end);

  if (type === 'Room') {
    const durationInDays = Math.floor(moment.duration(b.diff(a)).asDays());

    const formattedDays = Math.max(1, durationInDays + 1);
    const formattedNights = Math.max(0, durationInDays);

    return `${formattedDays}D, ${formattedNights}N`;
  } else {
    const hourDiff = b.diff(a, 'hours');
    return `${hourDiff} ${hourDiff !== 1 ? 'hours' : 'hour'}`;
  }
};

const statusColorChanger = (reservation) => {
  switch (reservation?.STATUS?.toLowerCase()) {
    case 'unpaid':
    case 'cancelled':
      return '#B31B1B';

    case 'fully paid':
      return '#006400';

    case 'paid - partial':
      return '#4997D0';

    default:
      return '#000';
  }
};

const getCountForDashboard = (reservations, type) => {
  const total = reservations?.filter(
    (reservation) => reservation?.TYPE === type,
  )?.length;

  const cancelled = reservations?.filter(
    (reservation) =>
      reservation?.TYPE === type && reservation?.STATUS === 'Cancelled',
  )?.length;

  return { total, cancelled, service: type };
};

const capitalize = (str) => {
  return str?.charAt(0).toUpperCase() + str?.slice(1);
};

const renderTableDate = (start, end, type) => {
  if (type === 'Room') {
    return (
      <Flex gap={6} align="center">
        <Flex direction="column">
          <Text size="sm">{moment.utc(start).format('ll')}</Text>
          <Text size="xs" align="left">
            2:00 pm
          </Text>
        </Flex>

        <Text size="xs">-</Text>

        <Flex direction="column">
          <Text size="sm">{moment.utc(end).format('ll')}</Text>
          <Text size="xs" align="left">
            12:00 pm
          </Text>
        </Flex>
      </Flex>
    );
  } else {
    return (
      <Flex gap={6} align="center">
        {[start, end].map((date, index) => (
          <>
            {index > 0 && <Text size="xs">-</Text>}
            <div key={index}>
              <Flex key={index} direction="column">
                <Text size="sm">{moment.utc(date).format('ll')}</Text>
                <Text size="xs" align={index === 1 ? 'right' : 'left'}>
                  {moment.utc(date).format('h:mm a')}
                </Text>
              </Flex>
            </div>
          </>
        ))}
      </Flex>
    );
  }
};

export {
  renderReservationDateStatus,
  renderReservationServiceType,
  sortReservations,
  filterReservationsByCriteria,
  calculateDuration,
  statusColorChanger,
  getCountForDashboard,
  capitalize,
  renderTableDate,
};
