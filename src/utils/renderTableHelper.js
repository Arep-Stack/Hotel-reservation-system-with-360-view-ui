import { Badge, Group } from '@mantine/core';
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
      <Badge w="80%" variant="outline" color="#960018">
        Cancelled
      </Badge>
    );
  }

  if (currentDate.isBefore(start)) {
    return (
      <Badge w="80%" variant="outline" color="#5D8AA8">
        Upcoming
      </Badge>
    );
  } else if (currentDate.isSame(start, 'day')) {
    return (
      <Badge w="80%" variant="outline" color="#006400">
        Today
      </Badge>
    );
  } else if (currentDate.isBetween(start, end)) {
    return (
      <Badge w="80%" variant="outline" color="#007FFF">
        On going
      </Badge>
    );
  } else if (currentDate.isAfter(end)) {
    return (
      <Badge w="80%" variant="outline" color="#2A3439">
        Finished
      </Badge>
    );
  }
};

const renderReservationServiceType = (reservation) => {
  const serviceType = reservation?.SERVICE_TYPE;

  if (serviceType === 'Room') {
    return (
      <Group>
        <IconBed />
        {reservation?.SERVICE_NAME}
      </Group>
    );
  } else if (serviceType === 'Pavilion') {
    return (
      <Group>
        <IconBuildingPavilion />
        {reservation?.SERVICE_NAME}
      </Group>
    );
  } else if (serviceType === 'Pool') {
    return (
      <Group>
        <IconSwimming />
        {reservation?.SERVICE_NAME}
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
    } else {
      return reservations;
    }
  }
};

export {
  renderReservationDateStatus,
  renderReservationServiceType,
  sortReservations,
  filterReservationsByCriteria,
};
