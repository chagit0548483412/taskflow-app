import React from 'react';
import { useQuery } from '@tanstack/react-query';

export const KanbanBoard: React.FC = () => {
  const { data: tasks } = useQuery({ 
    queryKey: ['tasks'], 
    queryFn: () => fetch('http://localhost:3001/tasks').then(res => res.json()) 
  });

  return (
    <div className="kanban-container grid grid-cols-3 gap-4">
      {['TODO', 'IN_PROGRESS', 'DONE'].map(status => (
        <div key={status} className="column p-4 border rounded">
          <h2 className="font-bold">{status}</h2>
          {tasks?.filter(t => t.status === status).map(task => (
            <div key={task.id} className="p-2 bg-white shadow mb-2 rounded">
              {task.title}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};