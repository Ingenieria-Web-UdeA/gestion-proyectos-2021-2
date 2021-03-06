import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_CLIENTES } from 'graphql/queries/clients';
import Link from 'next/link';
import { Dialog } from '@mui/material';
import useFormData from 'hooks/useFormData';
import { DELETE_CLIENT, EDIT_CLIENT } from 'graphql/mutations/client';
import { toast } from 'react-toastify';
import { ButtonLoading } from '@components/ButtonLoading';
import PrivateComponent from '@components/PrivateComponent';
import { matchRoles } from 'utils/matchRoles';
// import { getSession } from 'next-auth/react';

export async function getServerSideProps(context) {
  return {
    props: { ...(await matchRoles(context)) },
  };
}

const IndexClients = () => {
  const { data, loading } = useQuery(GET_CLIENTES, {
    fetchPolicy: 'cache-and-network',
  });

  if (loading) return <div>Loading....</div>;

  return (
    <div className='flex flex-col items-center p-10'>
      <PrivateComponent roleList={['Admin']}>
        <Link href='/clients/new' passHref>
          <div className='self-end button-primary'>Nuevo Cliente</div>
        </Link>
      </PrivateComponent>
      <h2 className='my-4 text-3xl font-bold text-gray-800'>Clientes</h2>
      <div className='hidden lg:block'>
        <table>
          <thead>
            <PrivateComponent roleList={['Admin']}>
              <th>ID Cliente</th>
            </PrivateComponent>
            <th>Nombre</th>
            <th>Fecha de Actualización</th>
            <th>Fecha de Creación</th>
            <PrivateComponent roleList={['Admin', 'Dev']}>
              <th>Acciones</th>
            </PrivateComponent>
          </thead>
          <tbody>
            {data.getClients.map((c) => (
              <Cliente key={c.id} client={c} />
            ))}
          </tbody>
        </table>
      </div>
      <div className='block lg:hidden'>
        <ClientesResponsive clients={data.getClients} />
      </div>
    </div>
  );
};

const ClientesResponsive = ({ clients }) => (
  <div>
    {clients.map((client) => (
      <ClienteResponisve key={client.id} client={client} />
    ))}
  </div>
);

const ClienteResponisve = ({ client }) => (
  <div className='bg-gray-200 flex flex-col my-4 p-4 rounded-lg shadow-lg'>
    <div className='flex flex-col'>
      <span>Nombre:</span>
      <span>{client.name}</span>
    </div>
    <div>
      <EditDeleteButtons client={client} />
    </div>
  </div>
);

const Cliente = ({ client }) => (
  <tr>
    <PrivateComponent roleList={['Admin']}>
      <td>{client.id}</td>
    </PrivateComponent>
    <td>{client.name}</td>
    <td>{client.updatedAt}</td>
    <td>{client.createdAt}</td>
    <PrivateComponent roleList={['Admin', 'Dev']}>
      <td>
        <EditDeleteButtons client={client} />
      </td>
    </PrivateComponent>
  </tr>
);

const EditDeleteButtons = ({ client }) => {
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const closeDialog = () => {
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
  };
  return (
    <div>
      <div className='flex w-full justify-center'>
        <button
          type='button'
          onClick={() => {
            setOpenEditDialog(true);
          }}
        >
          <i className='mx-4 fas fa-pen text-yellow-500 hover:text-yellow-700 cursor-pointer' />
        </button>
        <button type='button' onClick={() => setOpenDeleteDialog(true)}>
          <i className='mx-4 fas fa-trash text-red-500 hover:text-red-700 cursor-pointer' />
        </button>
      </div>
      <Dialog open={openEditDialog} onClose={closeDialog}>
        <EditCliente client={client} closeDialog={closeDialog} />
      </Dialog>
      <Dialog open={openDeleteDialog} onClose={closeDialog}>
        <DeleteCliente client={client} closeDialog={closeDialog} />
      </Dialog>
    </div>
  );
};

const EditCliente = ({ client, closeDialog }) => {
  const { form, formData, updateFormData } = useFormData(null);
  const [updateClient, { loading }] = useMutation(EDIT_CLIENT, {
    refetchQueries: [GET_CLIENTES],
  });
  const submitForm = async (e) => {
    e.preventDefault();
    await updateClient({
      variables: {
        updateClientId: client.id,
        name: formData.name,
      },
    });
    toast.success(`Cliente ${client.id} modificado exitosamente`);
    closeDialog();
  };
  return (
    <div className='p-10 flex flex-col items-center'>
      <h2 className='my-3 text-2xl font-extrabold text-gray-900'>
        Editar Cliente
      </h2>
      <form
        ref={form}
        onChange={updateFormData}
        onSubmit={submitForm}
        className='flex flex-col items-center'
      >
        <label htmlFor='name' className='flex flex-col'>
          <span>Nombre del Cliente:</span>
          <input name='name' defaultValue={client.name} />
        </label>
        <ButtonLoading isSubmit loading={loading} text='Editar Cliente' />
      </form>
    </div>
  );
};

const DeleteCliente = ({ client, closeDialog }) => {
  const [deleteClient, { loading }] = useMutation(DELETE_CLIENT, {
    refetchQueries: [GET_CLIENTES],
  });
  const cancel = () => {
    closeDialog();
  };
  const deleteFunction = async () => {
    await deleteClient({
      variables: {
        deleteClientId: client.id,
      },
    });
    toast.success('Cliente eliminado con éxito');
    closeDialog();
  };
  return (
    <div className='p-10 flex flex-col items-center'>
      <h2 className='text-2xl text-gray-900 font-extrabold my-3'>
        Eliminar Cliente
      </h2>
      <span className='text-red-500 font-bold my-2'>
        Esta acción no se puede deshacer.
      </span>
      <span className='my-2'>
        ¿Está seguro de que desea eliminar el cliente?
      </span>
      <div className='flex my-2'>
        <ButtonLoading
          isSubmit={false}
          onClick={deleteFunction}
          loading={loading}
          text='Confirmar'
        />
        <button
          type='button'
          className='button-secondary mx-2'
          onClick={cancel}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default IndexClients;
