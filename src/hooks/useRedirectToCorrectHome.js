import { useHistory, useLocation } from 'react-router-dom';
import utilsApp from '../utils/utilsApp';

function useRedirectToCorrectHome() {
  const history = useHistory();
  const location = useLocation();
  if (utilsApp.isNewHome()) {
    //
  } else {
    //
  }
  return false;
}

export default useRedirectToCorrectHome;
