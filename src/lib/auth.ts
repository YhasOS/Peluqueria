import type { NextApiRequest } from 'next';

export const ADMIN_COOKIE = 'salon_admin_auth';

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || 'admin123';
}

export function isAdminRequest(req: NextApiRequest) {
  return req.cookies?.[ADMIN_COOKIE] === getAdminPassword();
}
