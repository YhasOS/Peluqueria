import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { addMinutes } from 'date-fns';

function parseHour(value: string | undefined, fallback: number) { const h=Number(String(value||'').split(':')[0]); return Number.isFinite(h)?h:fallback; }

export default async function handler(req:NextApiRequest,res:NextApiResponse){
 if(req.method!=='GET')return res.status(405).end();
 try{
  const ids=String(req.query.serviceIds||'').split(',').map(Number).filter(Boolean); const professionalId=Number(req.query.professionalId); const date=String(req.query.date||'');
  if(!ids.length||!professionalId||!date)return res.status(200).json([]);
  const services=await prisma.service.findMany({where:{id:{in:ids}}}); if(services.length!==ids.length)return res.status(400).json({error:'Servicio no encontrado.'});
  const duration=services.reduce((a,s)=>a+Number(s.totalDuration||0)+Number(s.preparationTime||0),0);
  const settingsRows=await prisma.setting.findMany(); const settings:Record<string,string>={}; settingsRows.forEach(r=>settings[r.key]=r.value);
  const selected=new Date(`${date}T00:00:00`); const weekday=selected.getDay(); const today=new Date(); today.setHours(0,0,0,0);
  const open=weekday===6?parseHour(settings.saturdayOpeningHour,9):parseHour(settings.openingHour,9); const close=weekday===6?parseHour(settings.saturdayClosingHour,14):parseHour(settings.closingHour,19); const step=Number(settings.slotMinutes||30)||30;
  if(selected<today){const out:Date[]=[];let slot=new Date(selected);slot.setHours(open,0,0,0);const end=new Date(selected);end.setHours(close,0,0,0);while(addMinutes(slot,duration)<=end){out.push(new Date(slot));slot=addMinutes(slot,step)}return res.status(200).json(out);}
  const closed=(settings.closedDays||'0').split(',').map(x=>Number(x.trim())); if(closed.includes(weekday))return res.status(200).json([]);
  const dayStart=new Date(selected);dayStart.setHours(open,0,0,0); const dayEnd=new Date(selected);dayEnd.setHours(close,0,0,0);
  const bookings=await prisma.booking.findMany({where:{professionalId,status:{not:'cancelled'},startTime:{gte:dayStart,lt:dayEnd}},select:{startTime:true,endTime:true}});
  const out:Date[]=[]; let slot=new Date(dayStart); const now=new Date();
  while(addMinutes(slot,duration)<=dayEnd){const end=addMinutes(slot,duration);const clash=bookings.some(b=>b.startTime<end&&b.endTime>slot);if(!clash&&slot>=now)out.push(new Date(slot));slot=addMinutes(slot,step)}
  return res.status(200).json(out);
 }catch(error:any){console.error('MULTI SLOTS ERROR',error);return res.status(500).json({error:'No se pudo calcular disponibilidad.',detail:error?.message||String(error)});}
}
