import { supabase } from '../lib/supabase'

export type TaskRecord={id:string;company_id:string;restaurant_id:string;title:string;description:string|null;category:string;priority:string;status:string;due_at:string|null}
export type IncidentRecord={id:string;company_id:string;restaurant_id:string;title:string;description:string|null;category:string;priority:string;status:string;occurred_at:string}
export type EquipmentRecord={id:string;company_id:string;restaurant_id:string;name:string;category:string|null;location:string|null;status:string;next_maintenance_at:string|null;notes:string|null}
export type ChecklistRecord={id:string;company_id:string;restaurant_id:string;name:string;shift_type:string;active:boolean;checklist_items:{id:string;title:string;sort_order:number;required:boolean}[]}

export async function getOperationsData(){
  if(!supabase)return {tasks:[],incidents:[],equipment:[],checklists:[]}
  const [tasks,incidents,equipment,checklists]=await Promise.all([
    supabase.from('operational_tasks').select('*').order('created_at',{ascending:false}),
    supabase.from('incidents').select('*').order('created_at',{ascending:false}),
    supabase.from('equipment').select('*').order('name'),
    supabase.from('checklists').select('id,company_id,restaurant_id,name,shift_type,active,checklist_items(id,title,sort_order,required)').order('name'),
  ])
  const error=tasks.error||incidents.error||equipment.error||checklists.error;if(error)throw error
  return {tasks:(tasks.data??[]) as TaskRecord[],incidents:(incidents.data??[]) as IncidentRecord[],equipment:(equipment.data??[]) as EquipmentRecord[],checklists:(checklists.data??[]) as unknown as ChecklistRecord[]}
}

export async function saveOperation(table:'operational_tasks'|'incidents'|'equipment',values:Record<string,unknown>){
  if(!supabase)throw new Error('Supabase no está configurado')
  const query=values.id?supabase.from(table).update(values).eq('id',String(values.id)):supabase.from(table).insert(values)
  const {error}=await query;if(error)throw error
}

export async function createChecklist(values:{company_id:string;restaurant_id:string;name:string;shift_type:string;items:string[]}){
  if(!supabase)throw new Error('Supabase no está configurado')
  const {data,error}=await supabase.from('checklists').insert({company_id:values.company_id,restaurant_id:values.restaurant_id,name:values.name,shift_type:values.shift_type}).select('id').single();if(error)throw error
  const {error:itemError}=await supabase.from('checklist_items').insert(values.items.filter(Boolean).map((title,index)=>({checklist_id:data.id,title,sort_order:index})));if(itemError)throw itemError
}
