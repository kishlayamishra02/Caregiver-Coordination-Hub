import { List, ListItem, ListItemText } from '@mui/material';

export default function TaskList({ tasks }) {
  return (
    <List>
      {tasks.map((task, index) => (
        <ListItem key={index}>
          <ListItemText primary={task.title} secondary={task.date} />
        </ListItem>
      ))}
    </List>
  );
}