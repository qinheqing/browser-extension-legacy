import { useContext } from 'react';
import { I18nContext } from '../../ui/app/contexts/i18n';

function useI18n() {
  const t = useContext(I18nContext);
  return t;
}

export default useI18n;
