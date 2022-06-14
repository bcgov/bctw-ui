import { useState, useEffect } from 'react';
import jwt from 'jsonwebtoken';

interface IDashboardUrl {
  url: string;
}
export default function useMetabaseDashboard(key: number): IDashboardUrl {
  const METABASE_SITE_URL = "https://metabase-0dff19-tools-tools.apps.silver.devops.gov.bc.ca"; //Replace with env
  const SECRET_KEY = '3d60adf1ff6f8e7a04480f06461a10bdb3cdbde633ebe47f2f22a25c1c1c1c18';

  const payload = {
    resource: { dashboard: key },
    params: {},
    exp: Math.round(Date.now() / 1000) + (10 * 60) // 10 minute expiration
  };
  const token = jwt.sign(payload, SECRET_KEY);

  const iframeUrl = METABASE_SITE_URL + "/embed/dashboard/" + token + "#bordered=true&titled=true";

  return {url: iframeUrl}
}
