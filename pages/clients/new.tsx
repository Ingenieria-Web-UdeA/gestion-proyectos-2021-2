import React from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_CLIENT } from 'graphql/mutations/client';
import { GET_CLIENTES } from 'graphql/queries/clients';
import useFormData from 'hooks/useFormData';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { ButtonLoading } from '@components/ButtonLoading';
import { matchRoles } from 'utils/matchRoles';

export async function getServerSideProps(context) {
  return {
    props: { ...(await matchRoles(context)) },
  };
}

const NewClient = () => {
  const router = useRouter();
  const { form, formData, updateFormData } = useFormData(null);
  const [createClient, { data, loading }] = useMutation(CREATE_CLIENT, {
    refetchQueries: [GET_CLIENTES],
  });

  const submitForm = async (e) => {
    e.preventDefault();

    await createClient({
      variables: {
        name: formData.name,
      },
    });
    toast.success('Cliente creado con éxito');
    router.push('/clients');
    // form.current.reset();
  };

  return (
    <div className='flex flex-col items-center p-10'>
      {data && <div>data loaded</div>}
      <Link href='/clients' passHref>
        <i className='fas fa-arrow-left self-start' />
      </Link>
      <h2>Nuevo Cliente</h2>
      <form
        ref={form}
        onChange={updateFormData}
        onSubmit={submitForm}
        className='flex flex-col my-4'
      >
        <label className='flex flex-col' htmlFor='name'>
          <span>Nombre del Cliente</span>
          <input name='name' type='text' />
        </label>
        <ButtonLoading isSubmit loading={loading} text='Crear Cliente' />
      </form>
    </div>
  );
};

export default NewClient;
