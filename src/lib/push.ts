import webpush from 'web-push';
import { prisma } from '@/lib/v9-db';

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || 'mailto:gemaestudiodebelleza@gmail.com';

if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export async function sendPushToProfessional(
  professionalId: number | null | undefined,
  payload: { title: string; body: string; url?: string }
) {
  if (!professionalId || !publicKey || !privateKey) return;

  const subscriptions = await prisma.$queryRaw<any[]>`
    SELECT endpoint, p256dh, auth
    FROM "PushSubscription"
    WHERE "professionalId" = ${professionalId}
  `;

  await Promise.allSettled(
    subscriptions.map((s) =>
      webpush.sendNotification(
        {
          endpoint: s.endpoint,
          keys: {
            p256dh: s.p256dh,
            auth: s.auth,
          },
        },
        JSON.stringify(payload)
      )
    )
  );
}