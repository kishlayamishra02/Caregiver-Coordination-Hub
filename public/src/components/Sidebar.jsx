import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { Link } from 'react-router-dom';

const items = [
  { text: 'Dashboard', path: '/dashboard' },
  { text: 'Calendar', path: '/calendar' },
  { text: 'Tasks', path: '/tasks' },
  { text: 'Notes', path: '/notes' }
];

export default function Sidebar() {
  return (
    <Drawer variant="permanent" anchor="left">
      <List>
        {items.map(i => (
          <ListItem button key={i.text} component={Link} to={i.path}>
            {i.text}
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}