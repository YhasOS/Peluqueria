import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { addMinutes } from 'date-fns';
import { sendPushToProfessional } from '@/lib/push';

const STAFF_COOKIE='gema_staff_auth';
function getStaffId(req:NextApiRequest){const raw=req.cookies?.[STAFF_COOKIE];if(!raw)return null;try{const d=JSON.parse(Buffer.from(raw,'base64url').toString('utf8'));const id=Number(d.id);return id>0?id:null}catch{return null}}
function clean(v:any){const t=String(v||'').trim();return t||null}

export default async function handler(req:NextApiRequest,res:NextApiResponse){
 try{
  if(req.method!=='POST')return res.status(405).end(); const staffId=getStaffId(req);if(!staffId)return res.status(401).json({error:'Sesión de trabajadora no válida.'});
  const {customerId,name,phone,email,serviceIds,serviceId,professionalId,date,startTime,notes}=req.body||{};
  const ids=[...new Set((Array.isArray(serviceIds)?serviceIds:[serviceId]).map(Number).filter(Boolean))]; const pid=Number(professionalId); const clientName=clean(name); const clientPhone=clean(phone); const clientEmail=clean(email)?.toLowerCase()||null;
  if(!clientName||!clientPhone||!ids.length||!pid||!date||!startTime)return res.status(400).json({error:'Nombre, teléfono, uno o más servicios, profesional, fecha y hora son obligatorios.'});
  const [staff,professional,services]=await Promise.all([prisma.professional.findUnique({where:{id:staffId}}),prisma.professional.findUnique({where:{id:pid}}),prisma.service.findMany({where:{id:{in:ids}}})]);
  if(!staff?.active||!professional?.active)return res.status(401).json({error:'Profesional no autorizada.'}); if(services.length!==ids.length)return res.status(400).json({error:'Algún servicio no existe.'});
  const ordered=ids.map(id=>services.find(s=>s.id===id)!).filter(Boolean); const start=new Date(startTime); const duration=ordered.reduce((a,s)=>a+Number(s.totalDuration||0)+Number(s.preparationTime||0),0); const end=addMinutes(start,duration);
  const selectedDay=new Date(`${date}T00:00:00`);const today=new Date();today.setHours(0,0,0,0);
  if(selectedDay>=today){const conflict=await prisma.booking.findFirst({where:{professionalId:pid,status:{not:'cancelled'},startTime:{lt:end},endTime:{gt:start}},select:{id:true}});if(conflict)return res.status(409).json({error:'Ese horario ya no está disponible.'});}

  let customer:any=null;
  if(customerId)customer=await prisma.customer.findUnique({where:{id:Number(customerId)}});
  if(!customer&&clientEmail)customer=await prisma.customer.findUnique({where:{email:clientEmail}});
  if(!customer&&clientPhone)customer=await prisma.customer.findFirst({where:{phone:clientPhone}});
  if(customer) customer=await prisma.customer.update({where:{id:customer.id},data:{name:clientName,email:clientEmail??customer.email,phone:clientPhone,notes:clean(notes)??customer.notes}});
  else customer=await prisma.customer.create({data:{name:clientName,email:clientEmail,phone:clientPhone,notes:clean(notes)}});

  const booking=await prisma.$transaction(async tx=>{
    const created=await tx.booking.create({data:{clientName,clientEmail,clientPhone,notes:clean(notes),date:new Date(String(date)),startTime:start,endTime:end,serviceId:ordered[0].id,professionalId:pid},include:{professional:true,service:true}});
    for(let i=0;i<ordered.length;i++){const s=ordered[i];await tx.bookingService.create({data:{bookingId:created.id,serviceId:s.id,position:i,price:Number(s.price||0),duration:Number(s.totalDuration||0)}})}
    await tx.bookingBlock.create({data:{bookingId:created.id,start,end,exclusive:true}}); return created;
  });
  const names=ordered.map(s=>s.name).join(' + '); await sendPushToProfessional(pid,{title:'Nueva cita creada',body:`${clientName} · ${names} · ${start.toLocaleString('es-ES')}`,url:'/staff'}).catch(()=>{});
  return res.status(201).json({...booking,services:ordered.map(s=>({id:s.id,name:s.name,price:s.price,totalDuration:s.totalDuration}))});
 }catch(error:any){console.error('CREATE MULTI BOOKING ERROR',error);return res.status(500).json({error:'No se pudo crear la cita.',detail:error?.message||String(error)});}
}
