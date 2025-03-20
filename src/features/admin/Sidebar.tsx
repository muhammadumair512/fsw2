'use client';

import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { Paper, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  // Define sidebar items (removed Update Requests)
  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      href: '/admin',
    },
    {
      text: 'Users',
      icon: <PeopleIcon />,
      href: '/admin/users',
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      href: '/admin/settings',
    },
  ];

  return (
    <Paper className="p-0">
      <List component="nav">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.text} href={item.href} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
              <ListItemButton className={isActive ? 'bg-gray-100' : ''}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </Link>
          );
        })}
      </List>
    </Paper>
  );
}