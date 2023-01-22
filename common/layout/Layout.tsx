import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import {Breadcrumb, Collapse, Layout, theme, Tooltip} from "antd";
import Link from "next/link";
import Router, {useRouter} from "next/router";
import React, {ReactNode, useEffect, useMemo, useState} from "react";
import logo from "../../public/logo.png";
import {getRequest} from "../network";
import {URLs} from "../network/URLs";
import useBreadcrumbs from "../utils/useBreadcrumbs";
import icons from "./icons";
const {Header, Sider, Content} = Layout;
const {Panel} = Collapse;
interface LayoutProps {
  children: React.ReactNode;
}

interface LeftPanelResponse {
  key: number;
  icon: string;
  children: LeftPanelResponse[];
  label: String;
  link: string;
  keys: number[];
}

const initialState: {
  items: LeftPanelResponse[];
  loading: boolean;
  activeKeys: number[];
  drawer: boolean;
} = {
  items: [],
  loading: false,
  activeKeys: [],
  drawer: false,
};

const MainLayout = (_props: LayoutProps) => {
  const router = useRouter();
  const {token} = theme.useToken();
  const [collapsed, setCollapsed] = useState(false);
  const path = useBreadcrumbs((state) => state.path);
  const [state, setState] = useState(initialState);

  const getLeftPanel = async () => {
    setState((prev) => ({...prev, loading: true}));
    const response = await getRequest<LeftPanelResponse[]>({
      url: URLs.leftPanel,
    });
    if (response.data) return response.data;
    return [];
  };

  const getItem = (items: LeftPanelResponse): ReactNode => {
    if (items.link === router.pathname) {
      setState((prev) => ({...prev, activeKeys: items.keys}));
    }
    if (items.children.length > 0) {
      return (
        <Collapse
          className="flex flex-col rounded-xl"
          ghost
          expandIconPosition="end"
          key={items.key}
          defaultActiveKey={state.activeKeys}
        >
          <Panel
            header={
              <div className="flex items-center text-white whitespace-nowrap">
                {React.createElement(icons[items?.icon], {className: "pr-2"})}
                {items.label}
              </div>
            }
            className="[&>.ant-collapse-header]:!rounded-lg [&>.ant-collapse-header]:!text-white !text-white hover:[&>.ant-collapse-header]:bg-slate-300/30"
            key={items.key}
          >
            {items.children.map((item) => getItem(item))}
          </Panel>
        </Collapse>
      );
    } else {
      return (
        <Link
          href={items.link}
          key={items.key}
          onClick={() => {
            setState((prev) => ({...prev, activeKeys: items.keys}));
          }}
          className={`w-full flex items-center text-md px-4 py-3  rounded-lg my-1 !text-white whitespace-nowrap overflow-hidden ${
            router.pathname === items.link ? "" : "hover:!bg-slate-300/30"
          }`}
          style={{
            width: "100%",
            backgroundColor:
              router.pathname === items.link
                ? token.colorPrimary
                : "transparent",
            color:
              router.pathname === items.link
                ? token.colorWhite
                : token.colorTextSecondary,
          }}
        >
          {React.createElement(icons[items?.icon], {className: "pr-2"})}
          {items.label}
        </Link>
      );
    }
  };

  const leftPanel = useMemo(() => {
    return (
      <div className="p-1">
        <div className="flex items-center justify-center my-3">
          <img src={logo.src} className="max-w-none h-[100px]" />
        </div>
        <Collapse
          ghost
          expandIconPosition="end"
          defaultActiveKey={state.activeKeys}
        >
          {state.items.map((items) => getItem(items))}
        </Collapse>
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.items, state.activeKeys, router.pathname]);

  useEffect(() => {
    getLeftPanel().then((data) => {
      setState((prev) => ({...prev, items: data}));
    });
  }, []);
  return (
    <Layout className="!min-h-screen overflow-hidden">
      <Sider
        trigger={null}
        collapsible
        collapsedWidth={0}
        collapsed={collapsed}
        width={"20vw"}
        className="!h-screen overflow-scroll"
      >
        <div className="logo" />
        {leftPanel}
      </Sider>
      <Layout className="overflow-hidden flex flex-col !h-screen">
        <Header
          style={{paddingLeft: 10}}
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
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
            <span className=" text-sm whitespace-nowrap lg:text-xl px-4 text-white">
              Vendor Purchase Management
            </span>
          </div>
          <Tooltip title="Logout">
            <LogoutOutlined
              className="text-white text-xl"
              onClick={() => {
                getRequest({
                  url: URLs.user,
                  params: {
                    action: "logout",
                  },
                  showToast: true,
                }).then(({data}) => {
                  if (data) Router.push("/login");
                });
              }}
            />
          </Tooltip>
        </Header>
        <div className="overflow-scroll flex-grow flex flex-col">
          <Breadcrumb
            style={{
              margin: "12px 24px",
            }}
          >
            {path.map((bread, index) => (
              <Breadcrumb.Item key={index}>
                {bread.link ? (
                  <Link href={bread.link ? bread.link : ""}>
                    {" "}
                    {bread.label}
                  </Link>
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
            className="rounded-lg !bg-slate-200/40 !flex-grow"
          >
            {_props.children}
          </Content>
        </div>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
