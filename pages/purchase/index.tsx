import {Button, Table, Tooltip} from "antd";
import {NextPage} from "next";
import Router from "next/router";
import {useEffect, useState} from "react";
import DynamicCols from "../../common/dyamicColumns";
import {getRequest} from "../../common/network";
import {mediaURL, URLs} from "../../common/network/URLs";
import useBreadcrumbs from "../../common/utils/useBreadcrumbs";

const columns: any[] = [
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
    render: (bank: string | null) => (bank ? bank : "--"),
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
}

const initialState: initialStateI = {
  columns: columns,
  data: [],
  drawerOpen: false,
  loading: false,
};

const Purchase: NextPage = () => {
  const setPath = useBreadcrumbs((state) => state.setPath);
  const [state, setState] = useState(initialState);
  useEffect(() => {
    setPath([
      {
        label: "Purchases",
      },
    ]);
    setState((prev) => ({...prev, loading: true}));
    getRequest<any[]>({
      url: URLs.purchase,
    })
      .then((res) => {
        console.log(res);

        if (res.data) setState((prev) => ({...prev, data: res.data}));
      })
      .finally(() => {
        setState((prev) => ({...prev, loading: false}));
      });
  }, []);
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
      </div>
      <Table
        loading={state.loading}
        className="my-4"
        dataSource={state.data}
        rowKey={(row) => row.id}
        columns={state.columns}
        scroll={{x: "max-content"}}
      />
      <DynamicCols
        openCols={state.drawerOpen}
        closeDrawer={() => setState((prev) => ({...prev, drawerOpen: false}))}
        columns={state.columns}
        updateCols={(arr) => setState((prev) => ({...prev, columns: arr}))}
      />
    </>
  );
};

export default Purchase;
