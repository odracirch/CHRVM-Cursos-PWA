
'use client';
import {useEffect,useState} from 'react'; import {useRouter} from 'next/navigation'; import {api} from '@/lib/api';
export default function AuthGuard({children,roles}:{children:React.ReactNode;roles?:string[]}){const [ok,setOk]=useState(false);const router=useRouter();useEffect(()=>{api('/api/auth/profile/').then((u:any)=>{if(roles&& !roles.includes(u.role)){router.replace('/dashboard');return}setOk(true)}).catch(()=>router.replace('/login'))},[router,roles]);return ok?<>{children}</>:<div className="max-w-4xl mx-auto p-10">Verificando sesión...</div>}
