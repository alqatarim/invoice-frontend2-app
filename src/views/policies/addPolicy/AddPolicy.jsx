import Policy from '../policy';
import usePolicyFormHandler from '../handler';

const AddPolicy = ({ onSave, onError }) => {
  const controller = usePolicyFormHandler({
    mode: 'add',
    onSave,
    onError,
  });

  return <Policy controller={controller} />;
};

export default AddPolicy;
