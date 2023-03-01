import { Button, Drawer, Form, Input, Table } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import ApprovalRequest from "../../common/components/purchase/approval";
import DynamicCols from "../../common/dyamicColumns";
import { deleteRequest, getRequest } from "../../common/network";
import { URLs } from "../../common/network/URLs";
import useBreadcrumbs from "../../common/utils/useBreadcrumbs";

const { useForm } = Form;

export const getColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "text-yellow-400";
    case "REJECTED":
      return "text-red-600";
    case "APPROVED":
      return "text-green-500";
    default:
      return "";
  }
};

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
  month: Dayjs;
  formLoading: boolean;
}

const initialState: initialStateI = {
  columns: columns,
  data: [],
  drawerOpen: false,
  loading: false,
  isViewing: false,
  viewingData: null,
  month: dayjs(),
  formLoading: false,
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
  useEffect(() => {
    getData();
    setBreadcrumbs([
      {
        label: "Purchase",
        link: "/purchase",
      },
      {
        label: "Approvals",
      },
    ]);
  }, []);
  return (
    <>
      <Button
        type="primary"
        onClick={() => setState((prev) => ({ ...prev, isViewing: true }))}
      >
        Request Approval
      </Button>
      <Table
        loading={state.loading}
        className="my-4"
        dataSource={state.data}
        rowKey={(row) => row.id}
        columns={[
          {
            title: "Actions",
            key: "actions",
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
                  View Approval
                </Button>
              </>
            ),
          },
          ...state.columns,
        ]}
        scroll={{ x: "max-content" }}
      />
      <DynamicCols
        openCols={state.drawerOpen}
        closeDrawer={() => setState((prev) => ({ ...prev, drawerOpen: false }))}
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
            viewingData: null,
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
