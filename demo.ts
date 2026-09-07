export type Employee = {
  id: string; name: string; initials: string; code: string; role: string;
  department: string; email: string; status: 'Activo' | 'Ausente'; color: string
}

export const employees: Employee[] = [
  { id: '1', name: 'Carlos García', initials: 'CG', code: 'EMP001', role: 'Camarero', department: 'Sala', email: 'carlos@demo.es', status: 'Activo', color: '#db7c43' },
  { id: '2', name: 'Ana Martínez', initials: 'AM', code: 'EMP002', role: 'Cocinera', department: 'Cocina', email: 'ana@demo.es', status: 'Activo', color: '#5e8f78' },
  { id: '3', name: 'Laura Sánchez', initials: 'LS', code: 'EMP003', role: 'Encargada', department: 'Sala', email: 'laura@demo.es', status: 'Ausente', color: '#71669b' },
]

export const shifts = [
  { employeeId: '1', day: 0, time: '10:00–16:00', area: 'Sala' },
  { employeeId: '1', day: 2, time: '18:00–00:00', area: 'Sala' },
  { employeeId: '1', day: 4, time: '12:00–18:00', area: 'Sala' },
  { employeeId: '2', day: 0, time: '09:00–17:00', area: 'Cocina' },
  { employeeId: '2', day: 1, time: '09:00–17:00', area: 'Cocina' },
  { employeeId: '2', day: 3, time: '16:00–00:00', area: 'Cocina' },
  { employeeId: '2', day: 5, time: '12:00–20:00', area: 'Cocina' },
  { employeeId: '3', day: 0, time: '12:00–20:00', area: 'Sala' },
  { employeeId: '3', day: 1, time: '16:00–00:00', area: 'Sala' },
  { employeeId: '3', day: 2, time: '12:00–20:00', area: 'Sala' },
  { employeeId: '3', day: 3, time: '12:00–20:00', area: 'Sala' },
  { employeeId: '3', day: 4, time: '16:00–00:00', area: 'Sala' },
]
