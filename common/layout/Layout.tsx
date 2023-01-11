import {MenuFoldOutlined, MenuUnfoldOutlined} from "@ant-design/icons";
import {Breadcrumb, Layout, Menu} from "antd";
import Link from "next/link";
import React, {useState} from "react";
import useBreadcrumbs from "../utils/useBreadcrumbs";

const {Header, Sider, Content} = Layout;

interface LayoutProps {
  children: React.ReactNode;
}

const MainLayout = (_props: LayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const path = useBreadcrumbs((state) => state.path);

  return (
    <Layout className="!min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsedWidth={0}
        collapsed={collapsed}
      >
        <div className="logo" />
        <Menu mode="inline" defaultSelectedKeys={["1"]} items={[]} />
      </Sider>
      <Layout>
        <Header style={{paddingLeft: 10}} className="flex items-center">
          {collapsed ? (
            <MenuUnfoldOutlined
              className="text-xl text-white"
              onClick={() => setCollapsed(!collapsed)}
            />
          ) : (
            <MenuFoldOutlined
              className="text-xl text-white"
              onClick={() => setCollapsed(!collapsed)}
            />
          )}
          <span className="text-white text-sm whitespace-nowrap lg:text-xl px-4">
            Vendor Purchase Management
          </span>
        </Header>
        <Breadcrumb
          style={{
            margin: "12px 24px",
          }}
        >
          {path.map((bread, index) => (
            <Breadcrumb.Item key={index}>
              {bread.link ? (
                <Link href={bread.link ? bread.link : ""}> {bread.label}</Link>
              ) : (
                bread.label
              )}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
        <Content
          style={{
            margin: "12px 24px",
            padding: 24,
          }}
          className="rounded-lg !bg-slate-200/40"
        >
          {_props.children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
