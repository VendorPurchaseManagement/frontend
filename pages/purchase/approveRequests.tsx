import { DislikeOutlined, LikeOutlined } from "@ant-design/icons";
import { Button, Drawer, Form, Input, Table } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import ApprovalRequest from "../../common/components/purchase/approval";
import DynamicCols from "../../common/dyamicColumns";
import {
  deleteRequest,
  getRequest,
  postRequest,
  putRequest,
} from "../../common/network";
import { URLs } from "../../common/network/URLs";
import useBreadcrumbs from "../../common/utils/useBreadcrumbs";
import { getColor } from "./approval";

const { useForm } = Form;
export const columns: any[] = [
  {
    title: "Approval Status",
    dataIndex: "approval_status",
    key: "approval_status",
    render: (status: string) => (
      <p className={getColor(status) + " font-bold"}>{status}</p>
    ),
  },
  {
    title: "Requested By",
    dataIndex: "added_by",
    key: "added_by",
  },
  {
    title: "Requested On",
    dataIndex: "timestamp",
    key: "requested_on",
    render: (timestamp: string) =>
      dayjs(timestamp).format("MMMM D, YYYY h:mm A"),
  },
  {
    title: "Remarks",
    dataIndex: "remarks",
    key: "remarks",
    render: (remarks: string) => (remarks ? remarks : "--"),
  },
];

interface initialStateI {
  columns: any[];
  data: any[];
  drawerOpen: boolean;
  loading: boolean;
  isViewing: boolean;
  viewingData: any;
  formLoading: boolean;
  actionData: {
    id: number;
    isApproved: boolean;
  };
}

const initialState: initialStateI = {
  columns: columns,
  data: [],
  drawerOpen: false,
  loading: false,
  isViewing: false,
  viewingData: null,
  formLoading: false,
  actionData: {
    id: -1,
    isApproved: false,
  },
};

const PurchaseApproval: NextPage = () => {
  const setBreadcrumbs = useBreadcrumbs((state) => state.setPath);
  const [state, setState] = useState(initialState);
  const [form] = useForm();
  const getData = () => {
    setState((prev) => ({ ...prev, loading: true }));
    getRequest<any[]>({
      url: URLs.approval,
    })
      .then((res) => {
        console.log(res);
        if (res.data) setState((prev) => ({ ...prev, data: res.data }));
      })
      .finally(() => {
        setState((prev) => ({ ...prev, loading: false }));
      });
  };
  const requestAction = (values: any) => {
    putRequest<any[]>({
      url: URLs.approval,
      reqData: {
        ...values,
        approval_status: state.actionData.isApproved ? "APPROVED" : "REJECTED",
        approval: state.actionData.id,
      },
    })
      .then((res) => {
        console.log(res);
        if (res.data) {
          getData();
          setState((prev) => ({
            ...prev,
            actionData: initialState.actionData,
          }));
        }
      })
      .finally(() => {
        setState((prev) => ({ ...prev, actionData: initialState.actionData }));
      });
  };
  useEffect(() => {
    getData();
    setBreadcrumbs([
      {
        label: "Purchase",
        link: "/purchase",
      },
      {
        label: "Approve Requests",
      },
    ]);
  }, []);
  return (
    <>
      <Table
        loading={state.loading}
        className="my-4"
        dataSource={state.data}
        rowKey={(row) => row.id}
        columns={[
          {
            title: "Approval",
            key: "approval",
            dataIndex: "id",
            render: (id, record) => (
              <>
                <Button
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      isViewing: true,
                      viewingData: {
                        ...JSON.parse(record.data),
                        attachment: record.attachment,
                      },
                    }))
                  }
                >
                  View
                </Button>
              </>
            ),
          },
          ...state.columns,
          {
            title: "Approve/Reject",
            key: "approval",
            dataIndex: "id",
            render: (id, record) => (
              <>
                {record.remarks ? (
                  "N/A"
                ) : (
                  <Form
                    onFinishFailed={() =>
                      setState((prev) => ({
                        ...prev,
                        actionData: initialState.actionData,
                      }))
                    }
                    onFinish={requestAction}
                    disabled={state.actionData.id !== -1}
                  >
                    <div className="flex items-center">
                      <Form.Item
                        name="remarks"
                        required
                        className="!m-0"
                        rules={[
                          {
                            required: true,
                            message: "Please enter your remarks!",
                          },
                        ]}
                      >
                        <Input placeholder="Your Remarks..." />
                      </Form.Item>
                      <Button
                        type="primary"
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            actionData: { id: id, isApproved: true },
                          }))
                        }
                        shape="circle"
                        htmlType="submit"
                        className="mx-2 overflow-hidden !bg-green-500"
                        loading={
                          state.actionData.id == id &&
                          state.actionData.isApproved
                        }
                        icon={<LikeOutlined />}
                      />

                      <Button
                        type="primary"
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            actionData: { id: id, isApproved: false },
                          }))
                        }
                        danger
                        htmlType="submit"
                        shape="circle"
                        className="overflow-hidden"
                        loading={
                          state.actionData.id == id &&
                          !state.actionData.isApproved
                        }
                        icon={<DislikeOutlined />}
                      />
                    </div>
                  </Form>
                )}
              </>
            ),
          },
        ]}
        scroll={{ x: "max-content" }}
      />
      <DynamicCols
        openCols={state.drawerOpen}
        closeDrawer={() => setState((prev) => ({ ...prev, isViewing: false }))}
        columns={state.columns}
        updateCols={(arr) => setState((prev) => ({ ...prev, columns: arr }))}
      />
      <Drawer
        title={state.viewingData ? "View Approval" : "Request Approval"}
        width={"100%"}
        onClose={() =>
          setState((prev) => ({
            ...prev,
            isViewing: false,
          }))
        }
        open={state.isViewing}
        bodyStyle={{ paddingBottom: 80 }}
      >
        {React.createElement(
          ApprovalRequest,
          state.viewingData
            ? {
                data: state.viewingData,
              }
            : {}
        )}
      </Drawer>
    </>
  );
};

export default PurchaseApproval;
