import {
  ActionIcon,
  Box,
  Button,
  Divider,
  FileButton,
  Flex,
  Group,
  Image,
  Modal,
  NumberFormatter,
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

  const [image360, setImage360] = useState(null);
  const [isImage360Uploading, setIsImage360Uploading] = useState(false);

  const [addons, setAddons] = useState([]);

  //form
  let form = useForm({
    initialValues: {
      AMENITIES: [],
      IMAGE: '',
      NAME: '',
      PERSONS: 0,
      PRICE: 0,
      TYPE: '',
      addonsName: '',
      addonsPrice: '',
      PRICE_EXCEED: 0,
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
          : 'Price must be at least 1',
      AMENITIES: (value) =>
        upsertMode.includes('Delete') || value.length > 0
          ? null
          : 'Add at least 1 amenity',
      PRICE_EXCEED: (value) =>
        sortingCriteria === 'Room' || upsertMode.includes('Delete') || value > 1
          ? null
          : 'Price must be at least 1',
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
  const handlePushAddons = () => {
    const { addonsName, addonsPrice } = form.values;

    if (addonsName && addonsPrice) {
      setAddons((prev) => [...prev, { name: addonsName, price: addonsPrice }]);

      form.values.addonsName = '';
      form.values.addonsPrice = '';
    }
  };

  const handleSubmit = ({
    AMENITIES,
    NAME,
    PERSONS,
    PRICE,
    IMAGE,
    PRICE_EXCEED,
  }) => {
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
          IS_DELETED: upsertMode === 'Delete' ? true : false,
          MAIN360: image360 ? image360 : '',
          ADDONS: addons,
          PRICE_EXCEED: PRICE_EXCEED,
        },
      })
        .then(() => {
          getAllServices();

          closeUpsertModal();

          toast.success('Successfully processed', {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 1500,
          });
        })
        .catch((err) =>
          toast.error('An error occurred', {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 1500,
          }),
        )
        .finally(() => setIsSubmitting(false));
    };

    if (upsertMode === 'Delete') {
      upsert(IMAGE);
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
      form.setValues(service);
    } else {
      setImageDisplay('https://placehold.co/400x200/green/white');
      setImage(null);
      setImage360(null);
      form.reset();
    }

    if (!!service?.ADDONS && Array.isArray(service?.ADDONS))
      setAddons(service.ADDONS);
    else setAddons([]);

    setUpsertMode(mode);
    setSelectedService(service);
    setIsImage360Uploading(false);
    setImage360(service?.MAIN360);
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

  const handleUpload360 = (e) => {
    setIsImage360Uploading(true);

    if (e) {
      const formData = new FormData();
      formData.append('image', e);

      axios({
        method: 'POST',
        url: '/image/upload',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      })
        .then(({ data }) => {
          const securedSrc = data?.PATH?.replace('http', 'https');
          setImage360(securedSrc);
        })
        .catch(() =>
          toast.error('An error occurred', {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 1500,
          }),
        )
        .finally(() => setIsImage360Uploading(false));
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

        <Button
          variant="light"
          color="#FF0800"
          onClick={() => handleOpenModal('Delete', service)}
        >
          <IconTrash />
        </Button>
      </Flex>
    );

    const services = allServices?.filter(
      (service) => service?.TYPE === sortingCriteria && !service?.IS_DELETED,
    );

    services?.sort((a, b) => a.ID - b.ID);

    if (services?.length > 0) {
      return services?.map(
        ({
          AMENITIES,
          ID,
          IMAGE,
          NAME,
          PERSONS,
          PRICE,
          MAIN360,
          OTHER360,
          TYPE,
          ADDONS,
          PRICE_EXCEED,
        }) => (
          <ServiceCard
            key={ID}
            amenities={AMENITIES}
            image={IMAGE}
            name={NAME}
            persons={PERSONS}
            price={PRICE}
            type={TYPE}
            addons={ADDONS}
            price_exceed={PRICE_EXCEED}
          >
            {serviceButtons({
              AMENITIES,
              ID,
              IMAGE,
              NAME,
              PERSONS,
              PRICE,
              MAIN360,
              OTHER360,
              ADDONS,
              TYPE,
              PRICE_EXCEED,
            })}
          </ServiceCard>
        ),
      );
    } else {
      return (
        <NoRecords
          message={'No available ' + sortingCriteria.toLocaleLowerCase()}
        />
      );
    }
  };

  const renderUpsertModal = () => {
    if (upsertMode === 'Delete') {
      return (
        <>
          <Text align="center" my="md">
            Are you sure you want to delete? This action cannot be undone.
          </Text>
          <Text size="xl" fw={900} align="center">
            {selectedService.NAME}
          </Text>

          <Button
            fullWidth
            mt="md"
            color="#FF0800"
            tt="uppercase"
            fw={400}
            leftSection={<IconTrash />}
            loading={isSubmitting}
            onClick={() => handleSubmit('Delete', selectedService)}
          >
            I understand
          </Button>
        </>
      );
    } else {
      return (
        <Flex gap="sm">
          <form
            style={{ width: '440px' }}
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
              label={
                sortingCriteria === 'Pool' ? 'Price for 9am - 5pm' : 'Price'
              }
              placeholder="0.00"
              min={0}
              leftSection={<IconCurrencyPeso />}
              {...form.getInputProps('PRICE')}
            />

            {sortingCriteria !== 'Room' && (
              <NumberInput
                withAsterisk
                label={
                  sortingCriteria === 'Pool'
                    ? 'Price for 5pm to 11pm'
                    : 'Price for additional hour'
                }
                placeholder="0.00"
                min={0}
                leftSection={<IconCurrencyPeso />}
                {...form.getInputProps('PRICE_EXCEED')}
              />
            )}

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

            <Flex direction="column">
              <Flex gap="xs" align="center">
                <TextInput
                  label="Add-ons name"
                  placeholder="Add-ons"
                  {...form.getInputProps('addonsName')}
                />
                <NumberInput
                  label="Price"
                  placeholder="0"
                  {...form.getInputProps('addonsPrice')}
                />
                <ActionIcon
                  mt="lg"
                  variant="light"
                  color="#006400"
                  disabled={!form.values.addonsName || !form.values.addonsPrice}
                  onClick={handlePushAddons}
                >
                  <IconCirclePlus />
                </ActionIcon>
              </Flex>

              <Flex direction="column">
                {addons?.map((a, index) => (
                  <Group
                    fw={700}
                    direction="row"
                    key={index}
                    align="center"
                    mt="xs"
                    gap="sm"
                  >
                    <ActionIcon
                      variant="transparent"
                      color="#FF0800"
                      onClick={() =>
                        setAddons(addons.filter((_, i) => i !== index))
                      }
                    >
                      <IconTrash />
                    </ActionIcon>
                    <Text>{a?.name}</Text>
                    <NumberFormatter prefix="₱" value={a?.price} />
                  </Group>
                ))}
              </Flex>
            </Flex>

            <Button
              fullWidth
              loading={isSubmitting}
              disabled={isImage360Uploading}
              leftSection={<IconDeviceFloppy />}
              mt="md"
              type="submit"
              color="#006400"
            >
              Save
            </Button>
          </form>

          <Flex
            direction="column"
            justify="center"
            align="center"
            w="70vw"
            h="70vh"
          >
            {render360Iframe()}

            <Flex gap="md">
              <FileButton
                onChange={(e) => handleUpload360(e)}
                accept="image/png,image/jpeg"
              >
                {(props) => (
                  <Button
                    {...props}
                    w={250}
                    mt="sm"
                    color="#006400"
                    leftSection={<IconUpload />}
                  >
                    Upload 360 view
                  </Button>
                )}
              </FileButton>

              {image360 && !isImage360Uploading && (
                <Button
                  w={250}
                  mt="sm"
                  variant="light"
                  color="#FF0800"
                  onClick={() => setImage360(null)}
                >
                  Remove 360
                </Button>
              )}
            </Flex>
          </Flex>
        </Flex>
      );
    }
  };

  const renderServiceLength = () => {
    const services = allServices?.filter(
      (service) => service?.TYPE === sortingCriteria && !service?.IS_DELETED,
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

  const render360Iframe = () => {
    if (image360) {
      const src = `https://cdn.pannellum.org/2.5/pannellum.htm#panorama=${encodeURIComponent(
        image360,
      )}&autoLoad=true&autoRotate=-2`;

      if (!isImage360Uploading)
        return (
          <iframe
            title={selectedService?.MAIN360}
            width="100%"
            height="100%"
            allowFullScreen
            src={src}
          ></iframe>
        );
    }

    if (isImage360Uploading)
      return (
        <Box pos="relative" w="100%" h="100%">
          <ComponentLoader message="Uploading 360 view" />;
        </Box>
      );

    if (!isImage360Uploading && upsertMode === 'Update')
      return <NoRecords message="No 360 view available for this service" />;
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
        size="auto"
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
        withCloseButton={!isSubmitting && !isImage360Uploading}
        closeOnClickOutside={!isSubmitting && !isImage360Uploading}
        closeOnEscape={!isSubmitting && !isImage360Uploading}
      >
        {renderUpsertModal()}
      </Modal>
    </Box>
  );
}

export default AdminService;
