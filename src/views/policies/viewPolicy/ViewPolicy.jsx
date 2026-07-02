import Policy from '../policy';
import usePolicyFormHandler from '../handler';

const ViewPolicy = ({ policy, initialErrorMessage, onError }) => {
  const controller = usePolicyFormHandler({
    mode: 'view',
    policy,
    initialErrorMessage,
    onError,
  });

  return <Policy controller={controller} />;
};

export default ViewPolicy;
