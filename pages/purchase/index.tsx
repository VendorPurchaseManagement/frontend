import {DownloadOutlined} from "@ant-design/icons";
import {Button, DatePicker, Drawer, Table, Tooltip} from "antd";
import tableExport from "antd-table-export";
import dayjs, {Dayjs} from "dayjs";
import {NextPage} from "next";
import Router from "next/router";
import {useEffect, useState} from "react";
import UpdatePurchase from "../../common/components/purchase/updatePurchase";
import DynamicCols from "../../common/dyamicColumns";
import {deleteRequest, getRequest} from "../../common/network";
import {mediaURL, URLs} from "../../common/network/URLs";
import useBreadcrumbs from "../../common/utils/useBreadcrumbs";
export const columns: any[] = [
  {
    title: "Vendor",
    dataIndex: "vendor",
    key: "vendor",
  },
  {
    title: "Category",
    dataIndex: "category",
    key: "category",
  },
  {
    title: "PO",
    dataIndex: "po",
    key: "po",
  },
  {
    title: "Invoice Date",
    dataIndex: "inv_date",
    key: "inv_date",
  },
  {
    title: "Invoice Number",
    dataIndex: "inv_number",
    key: "inv_number",
  },
  {
    title: "Invoice Amount",
    dataIndex: "inv_amount",
    key: "inv_amount",
    render: (invoice_amount: string | null, row: {gst_perc: number}) =>
      invoice_amount
        ? Number.parseInt(invoice_amount) +
          Number.parseInt(invoice_amount) * (row.gst_perc / 100)
        : "",
  },
  {
    title: "Invoice",
    dataIndex: "invoice_url",
    key: "invoice",
    render: (invoice: string | null) => (
      <Tooltip title={invoice ? "" : "Not Provided!"}>
        <Button disabled={!invoice} href={mediaURL + invoice} target="_blank">
          View
        </Button>
      </Tooltip>
    ),
  },
  {
    title: "Mode",
    dataIndex: "mode",
    key: "mode",
    render: (mode: string | null) => (mode ? mode : "--"),
  },
  {
    title: "Bank",
    dataIndex: "bank",
    key: "bank",
    render: (bank: string | null, row: {[key: string]: string | null}) =>
      row.mode ? (bank ? bank : "N/A") : "--",
  },
  {
    title: "Credit Card",
    dataIndex: "credit_card",
    key: "credit_card",
    render: (credit_card: string | null, row: {[key: string]: string | null}) =>
      row.mode ? (credit_card ? credit_card : "N/A") : "--",
  },
  {
    title: "Remark",
    dataIndex: "remarks",
    key: "remarks",
  },
  {
    title: "Payment Status",
    dataIndex: "payment_status",
    key: "payment_status",
    render: (status: boolean) => (status ? "Done" : "Pending"),
  },
  {
    title: "Payment Date",
    dataIndex: "payment_date",
    key: "payment_date",
    render: (payment_date: string | null) =>
      payment_date ? payment_date : "--",
  },
  {
    title: "Payment Amount",
    dataIndex: "payment_amount",
    key: "payment_amount",
    render: (payment_amount: string | null) =>
      payment_amount ? payment_amount : "--",
  },
  {
    title: "Payment Remarks",
    dataIndex: "payment_remarks",
    key: "payment_remarks",
    render: (payment_remarks: string | null) =>
      payment_remarks ? payment_remarks : "--",
  },
  {
    title: "Added By",
    dataIndex: "added_by",
    key: "added_by",
  },
];

interface initialStateI {
  columns: any[];
  data: any[];
  drawerOpen: boolean;
  loading: boolean;
  isEditing: boolean;
  editingId: number;
  month: Dayjs;
}

const initialState: initialStateI = {
  columns: columns,
  data: [],
  drawerOpen: false,
  loading: false,
  isEditing: false,
  editingId: -1,
  month: dayjs(),
};

const Purchase: NextPage = () => {
  const setPath = useBreadcrumbs((state) => state.setPath);
  const [state, setState] = useState(initialState);
  const getData = () => {
    setState((prev) => ({...prev, loading: true}));
    getRequest<any[]>({
      url: URLs.purchase,
      params: {
        month: state.month.format("YYYY-M"),
      },
    })
      .then((res) => {
        console.log(res);

        if (res.data) setState((prev) => ({...prev, data: res.data}));
      })
      .finally(() => {
        setState((prev) => ({...prev, loading: false}));
      });
  };
  useEffect(() => {
    setPath([
      {
        label: "Purchases",
      },
    ]);
    getData();
  }, [state.month]);
  return (
    <>
      <div className="flex justify-between">
        <Button type="primary" onClick={() => Router.push("/purchase/add")}>
          Add Purchase
        </Button>

        <Button
          type="primary"
          onClick={() => setState((prev) => ({...prev, drawerOpen: true}))}
        >
          Customize Table
        </Button>
        <div className="flex">
          <DatePicker
            picker="month"
            defaultValue={state.month}
            allowClear={false}
            disabledDate={(date) => dayjs().isBefore(date, "month")}
            className="w-[150px] !mr-2"
            format={"MMM-YY"}
            onChange={(value) =>
              setState((prev) => ({...prev, month: value ?? dayjs()}))
            }
          />
          <Button
            icon={<DownloadOutlined />}
            onClick={() => {
              const exportInstance = new tableExport(
                state.data,
                state.columns.filter((value) => value.key !== "invoice")
              );
              exportInstance.download(
                `Purchases (${state.month.format("MMM YY")})`,
                "xlsx"
              );
            }}
          />
        </div>
      </div>
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
            render: (id) => (
              <>
                <Button
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      isEditing: true,
                      editingId: id,
                    }))
                  }
                >
                  Edit
                </Button>
                <Button
                  danger
                  type="primary"
                  className="ml-2"
                  onClick={() => {
                    deleteRequest({
                      url: URLs.purchase,
                      reqData: {
                        purchase: id,
                      },
                    }).then(({data}) => {
                      if (data) getData();
                    });
                  }}
                >
                  Delete
                </Button>
              </>
            ),
          },
          ...state.columns,
        ]}
        scroll={{x: "max-content"}}
      />
      <DynamicCols
        openCols={state.drawerOpen}
        closeDrawer={() => setState((prev) => ({...prev, drawerOpen: false}))}
        columns={state.columns}
        updateCols={(arr) => setState((prev) => ({...prev, columns: arr}))}
      />
      <Drawer
        title="Update Purchase"
        width={"100%"}
        onClose={() =>
          setState((prev) => ({...prev, isEditing: false, editingId: -1}))
        }
        open={state.isEditing}
        bodyStyle={{paddingBottom: 80}}
      >
        <UpdatePurchase
          id={state.editingId}
          onUpdate={() => {
            getData();
            setState((prev) => ({
              ...prev,
              isEditing: false,
              editingId: -1,
            }));
          }}
        />
      </Drawer>
    </>
  );
};

export default Purchase;
