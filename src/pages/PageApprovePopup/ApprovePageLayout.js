import React, { useEffect } from 'react';
import AppPageLayout from '../../components/AppPageLayout';

function ApprovePageLayout({
  query,
  title,
  actions,
  whiteBg = true,
  ...others
}) {
  useEffect(() => {
    // brings window to front when we receive new instructions
    // this needs to be executed from wallet instead of adapter
    // to ensure chrome brings window to front
    window.focus();
  }, []);
  return (
    <AppPageLayout
      whiteBg={whiteBg}
      navLeft={
        <div
          className="w-6 h-6 cursor-pointer"
          onClick={() => console.log('Approve query: ', query)}
        />
      }
      title={title}
      footer={
        <div className="bg-white px-4 py-2 flex items-center">{actions}</div>
      }
      {...others}
    />
  );
}

export default ApprovePageLayout;
