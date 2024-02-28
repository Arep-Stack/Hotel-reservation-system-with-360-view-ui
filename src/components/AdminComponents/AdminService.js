import {
  Box,
  Button,
  Divider,
  FileButton,
  Flex,
  Group,
  Image,
  Modal,
  NumberInput,
  TagsInput,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import {
  IconCirclePlus,
  IconCurrencyPeso,
  IconDeviceFloppy,
  IconPencil,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react';
import axios from 'axios';
import { useContext, useState } from 'react';
import { toast } from 'react-toastify';

import { GlobalContext } from '../../App';
import ServiceCard from '../ServiceCard/ServiceCard';
import ComponentError from '../utils/ComponentError';
import ComponentLoader from '../utils/ComponentLoader';
import NoRecords from '../utils/NoRecords';

function AdminService() {
  //context
  const { getAllServices, allServices, allServicesError, allServicesLoading } =
    useContext(GlobalContext);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [imageDisplay, setImageDisplay] = useState(
    'https://placehold.co/400x200/green/white',
  );
  const [image, setImage] = useState(null);

  //form
  let form = useForm({
    initialValues: {
      AMENITIES: [],
      IMAGE: '',
      NAME: '',
      PERSONS: 0,
      PRICE: 0,
      TYPE: '',
    },

    validate: {
      NAME: (value) =>
        upsertMode.includes('Delete') || (value && value.trim() !== '')
          ? null
          : 'Name is required',
      PERSONS: (value) =>
        upsertMode.includes('Delete') || (value && value > 0)
          ? null
          : 'Person capacity must be at least 1',
      PRICE: (value) =>
        upsertMode.includes('Delete') || (value && value > 0)
          ? null
          : 'Price must be at least 0',
      AMENITIES: (value) =>
        upsertMode.includes('Delete') || value.length > 0
          ? null
          : 'Add at least 1 amenity',
    },
  });

  //filter
  const [sortingCriteria, setSortingCriteria] = useState('Room');

  //modal
  const [upsertMode, setUpsertMode] = useState(null);
  const [
    isUpsertModalOpen,
    { open: openUpsertModal, close: closeUpsertModal },
  ] = useDisclosure(false);

  //function

  const handleSubmit = ({ AMENITIES, NAME, PERSONS, PRICE, IMAGE }) => {
    setIsSubmitting(true);

    const upsert = (id) => {
      axios({
        method: upsertMode === 'Create' ? 'POST' : 'PUT',
        url: `/services${
          upsertMode === 'Create' ? '' : '/' + selectedService?.ID
        }`,
        data: {
          IMAGE: id,
          AMENITIES,
          NAME,
          PERSONS,
          PRICE,
          QUANTITY: 1,
          TYPE: sortingCriteria,
        },
      })
        .then(({ data }) => {
          getAllServices();

          closeUpsertModal();

          toast.success(data?.message || 'Successfully updated service', {
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
        .finally(() => setIsSubmitting(false));
    };

    if (upsertMode === 'Delete') {
    } else {
      if (image) {
        const formData = new FormData();
        formData.append('image', image);

        axios({
          method: 'POST',
          url: '/image/upload',
          data: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
        })
          .then(({ data }) => {
            upsert(data?.ID);
          })
          .catch(() =>
            toast.error('An error occurred', {
              position: toast.POSITION.TOP_RIGHT,
              autoClose: 1500,
            }),
          );
      } else {
        //walang image
        if (upsertMode === 'Create') {
          upsert('');
        } else {
          upsert(IMAGE);
        }
      }
    }
  };

  const handleOpenModal = (mode, service) => {
    if (mode === 'Update') {
      axios({
        method: 'GET',
        url: `/image/${service.IMAGE}`,
      })
        .then(({ data }) => setImageDisplay(data?.PATH))
        .catch(() =>
          setImageDisplay(
            'https://placehold.co/350x200/EEE/31343C?font=source-sans-pro&text=Error%20while%20loading%20picture',
          ),
        );
    } else {
      setImageDisplay('https://placehold.co/400x200/green/white');
      setImage(null);
    }

    if (mode === 'Update') form.setValues(service);
    else form.reset();

    setUpsertMode(mode);
    setSelectedService(service);
    openUpsertModal();
  };

  const handleUploadImage = (e) => {
    setImage(e);
    if (e) {
      const fileReader = new FileReader();

      fileReader.onloadend = () => {
        setImageDisplay(fileReader.result);
      };

      fileReader.readAsDataURL(e);
    }
  };

  //render
  const renderServices = () => {
    const serviceButtons = (service) => (
      <Flex gap="xs" align="center">
        <Button
          fullWidth
          leftSection={<IconPencil />}
          onClick={() => handleOpenModal('Update', service)}
          fw="normal"
          color="#006400"
        >
          Edit
        </Button>
        <Button variant="light" color="#FF0800">
          <IconTrash />
        </Button>
      </Flex>
    );

    const services = allServices?.filter(
      (service) => service?.TYPE === sortingCriteria,
    );

    services?.sort((a, b) => a.ID - b.ID);

    if (services?.length > 0) {
      return services?.map(({ AMENITIES, ID, IMAGE, NAME, PERSONS, PRICE }) => (
        <ServiceCard
          key={ID}
          amenities={AMENITIES}
          image={IMAGE}
          name={NAME}
          persons={PERSONS}
          price={PRICE}
        >
          {serviceButtons({ AMENITIES, ID, IMAGE, NAME, PERSONS, PRICE })}
        </ServiceCard>
      ));
    } else {
      return (
        <NoRecords
          message={'No available ' + sortingCriteria.toLocaleLowerCase()}
        />
      );
    }
  };

  const renderUpsertModal = () => {
    return (
      <form
        style={{ width: '100%' }}
        onSubmit={form.onSubmit((values) => {
          handleSubmit(values);
        })}
      >
        <Image
          w="100%"
          h={200}
          src={imageDisplay}
          mb="sm"
          fallbackSrc="https://placehold.co/400x200/green/white"
        />

        <FileButton
          onChange={(e) => handleUploadImage(e)}
          accept="image/png,image/jpeg"
        >
          {(props) => (
            <Button
              fullWidth
              {...props}
              mb="sm"
              color="#006400"
              leftSection={<IconUpload />}
            >
              Upload image
            </Button>
          )}
        </FileButton>

        <Divider mt="sm" mb="sm" />

        <TextInput
          withAsterisk
          label="Name"
          placeholder="Name"
          {...form.getInputProps('NAME')}
        />

        <NumberInput
          withAsterisk
          label="Price"
          placeholder="0.00"
          min={0}
          leftSection={<IconCurrencyPeso />}
          {...form.getInputProps('PRICE')}
        />

        <NumberInput
          withAsterisk
          label="Person Capacity"
          placeholder="2"
          min={0}
          {...form.getInputProps('PERSONS')}
        />

        <TagsInput
          withAsterisk
          label="Amenities"
          description="Add at least 1"
          placeholder="Enter here"
          {...form.getInputProps('AMENITIES')}
          data={['WIFI', 'Aircon', 'Fan', 'TV', 'Own Bathroom']}
          min={1}
          styles={{
            pill: { background: 'darkgreen', color: 'white' },
            dropdown: { border: '1px solid gray' },
          }}
        />

        <Button
          fullWidth
          loading={isSubmitting}
          leftSection={<IconDeviceFloppy />}
          mt="md"
          type="submit"
          color="#006400"
        >
          Save
        </Button>
      </form>
    );
  };

  const renderServiceLength = () => {
    const services = allServices?.filter(
      (service) => service?.TYPE === sortingCriteria,
    );

    return (
      services?.length > 0 && (
        <Text
          mt="sm"
          c="gray"
          align="center"
        >{`Total ${sortingCriteria}: ${services.length}`}</Text>
      )
    );
  };

  return (
    <Box pos="relative" mih={200}>
      {allServicesLoading && <ComponentLoader message="Fetching services" />}

      {!allServicesLoading && allServicesError && (
        <ComponentError message={allServicesError} />
      )}

      {!allServicesLoading && !allServicesError && (
        <>
          <Group mb="md" align="center" justify="space-between">
            <Text size="xl">Services</Text>

            <Group>
              {['Room', 'Pavilion', 'Pool'].map((f) => (
                <div key={f}>
                  <Button
                    size="xs"
                    color="#2F6C2F"
                    disabled={allServicesLoading || allServicesError}
                    variant={sortingCriteria.includes(f) ? 'filled' : 'light'}
                    onClick={() => setSortingCriteria(f)}
                  >
                    {f}
                  </Button>
                </div>
              ))}
            </Group>

            <Button
              disabled={allServicesError || allServicesLoading}
              rightSection={<IconCirclePlus />}
              variant="filled"
              size="xs"
              color="#006400"
              onClick={() => handleOpenModal('Create', {})}
            >
              Create {sortingCriteria}
            </Button>
          </Group>

          <Flex w="100%" justify="center" gap="md" wrap="wrap">
            {renderServices()}
          </Flex>

          {renderServiceLength()}
        </>
      )}

      <Modal
        centered
        shadow="xl"
        opened={isUpsertModalOpen}
        onClose={closeUpsertModal}
        title={upsertMode + ' ' + sortingCriteria}
        closeButtonProps={{
          bg: 'crimson',
          radius: '50%',
          c: 'white',
        }}
        styles={{
          title: {
            color: upsertMode?.includes('Delete') ? 'crimson' : 'darkgreen',
            fontSize: '1.7rem',
          },
          inner: { padding: 5 },
        }}
        withCloseButton={!isSubmitting}
        closeOnClickOutside={!isSubmitting}
        closeOnEscape={!isSubmitting}
      >
        {renderUpsertModal()}
      </Modal>
    </Box>
  );
}

export default AdminService;
