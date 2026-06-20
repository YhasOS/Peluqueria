import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  });
}