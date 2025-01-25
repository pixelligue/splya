import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { useAuth } from '../../hooks/useAuth';

const { Sider, Content } = Layout;

const AdminLayout = () => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { key: '/admin', label: 'Обзор', icon: '📊' },
    { key: '/admin/teams-manager', label: 'Управление командами', icon: '⚙️' },
    { key: '/admin/tournaments', label: 'Турниры и матчи', icon: '🏆' },
    { key: '/admin/heroes', label: 'База героев', icon: '⚔️' },
    { key: '/admin/predictions', label: 'Управление прогнозами', icon: '🎯' },
    { key: '/admin/prompts', label: 'Тест промтов', icon: '🤖' },
    { key: '/admin/api-test', label: 'Тест API', icon: '🔌' }
  ].map(item => ({
    key: item.key,
    label: <Link to={item.key}>{item.label}</Link>,
    icon: <span>{item.icon}</span>
  }));

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={250}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0
        }}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ height: '100%', borderRight: 0 }}
        />
      </Sider>
      <Layout style={{ marginLeft: 250 }}>
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout; 