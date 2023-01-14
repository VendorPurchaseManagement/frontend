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
    title: "Title",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "GST Number",
    dataIndex: "gst_number",
    key: "gst",
    render: (gst: string) => (gst === "" ? "--" : gst),
  },
  {
    title: "Pan Number",
    dataIndex: "pan_number",
    key: "pan",
    render: (pan: string) => (pan === "" ? "--" : pan),
  },
  {
    title: "Payment Cycle",
    dataIndex: "payment_cycle",
    key: "payment_cycle",
  },
  {
    title: "Location",
    dataIndex: "location",
    key: "location",
  },
  {
    title: "Category",
    dataIndex: "category",
    key: "category",
    render: (categories: {name: string}[]) =>
      categories.map((item, index) => item.name).join(", "),
  },
  {
    title: "MSME Certified",
    dataIndex: "msme_certified",
    key: "msme_certified",
    render: (msme_certified: boolean) => (msme_certified ? "Yes" : "No"),
  },
  {
    title: "MSME Certificate",
    dataIndex: "msme_certificate",
    key: "msme_certificate",
    render: (msme_certificate: string | null) => (
      <Tooltip title={msme_certificate ? "" : "Not Provided!"}>
        <Button
          disabled={!msme_certificate}
          href={mediaURL + msme_certificate}
          target="_blank"
        >
          View
        </Button>
      </Tooltip>
    ),
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

const Vendor: NextPage = () => {
  const setPath = useBreadcrumbs((state) => state.setPath);
  const [state, setState] = useState(initialState);
  useEffect(() => {
    setPath([
      {
        label: "Vendors",
      },
    ]);
    setState((prev) => ({...prev, loading: true}));
    getRequest<any[]>({
      url: URLs.vendor,
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
        <Button type="primary" onClick={() => Router.push("/vendor/add")}>
          Add Vendor
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

export default Vendor;
