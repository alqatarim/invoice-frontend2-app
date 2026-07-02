import Policy from '../policy';
import usePolicyFormHandler from '../handler';

const EditPolicy = ({ policy, initialErrorMessage, onSave, onError }) => {
  const controller = usePolicyFormHandler({
    mode: 'edit',
    policy,
    initialErrorMessage,
    onSave,
    onError,
  });

  return <Policy controller={controller} />;
};

export default EditPolicy;
