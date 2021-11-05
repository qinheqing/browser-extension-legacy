// googleAnalyticsCode
// ----------------------------------------------

const head = `
<!-- Google Tag Manager -->
<script type="text/javascript"  src="/vendor/gtm.js"></script>
<!-- End Google Tag Manager -->
`;

const body = `
<!-- Google Tag Manager (noscript) -->
<noscript>
<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WG6T9PN"
 height="0" width="0" style="display:none;visibility:hidden"></iframe>
</noscript>
<!-- End Google Tag Manager (noscript) -->
`;

module.exports = {
  head,
  body,
};
