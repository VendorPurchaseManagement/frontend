import {Badge, Card, DatePicker, Statistic, Table, Tabs} from "antd";
import dayjs from "dayjs";
import Head from "next/head";
import {useEffect, useState} from "react";
import {Chart} from "react-google-charts";
import {getRequest} from "../common/network";
import {URLs} from "../common/network/URLs";
import useBreadcrumbs from "../common/utils/useBreadcrumbs";
import {columns as purchaseColumns} from "./purchase";

interface initialStateI {
  total_spent: number;
  category_wise: any[];
  vendor_wise: any[];
  pending_purchases: any[];
}

const initialState: initialStateI = {
  total_spent: 0,
  category_wise: [],
  vendor_wise: [],
  pending_purchases: [],
};

export default function Home() {
  const [state, setState] = useState<initialStateI>(initialState);
  const setPath = useBreadcrumbs((state) => state.setPath);
  const getData = (month: string) => {
    getRequest<initialStateI>({
      url: URLs.dashboard,
      params: {
        month: month,
      },
    }).then(({data}) => {
      if (data)
        setState((prev) => ({
          ...prev,
          total_spent: data.total_spent,
          category_wise: data.category_wise,
          vendor_wise: data.vendor_wise,
          pending_purchases: data.pending_purchases,
        }));
    });
  };
  useEffect(() => {
    setPath([
      {
        label: "Dashboard",
      },
    ]);
    getData(dayjs().format("YYYY-M"));
  }, []);
  return (
    <>
      <Head>
        <title>Vendor Purchase Management</title>
        <meta
          name="description"
          content="WebUI for Vendor Purchase Management"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col h-full">
        <DatePicker
          picker="month"
          defaultValue={dayjs()}
          allowClear={false}
          disabledDate={(date) => dayjs().isBefore(date, "month")}
          className="w-[150px] !mb-2 self-end"
          format={"MMM-YY"}
          onChange={(value) => {
            if (value) getData(value.format("YYYY-M"));
          }}
        />
        <Card bordered={false}>
          <Statistic
            title={"Total Spent"}
            prefix="₹"
            value={state.total_spent.toFixed(2)}
          />
        </Card>
        <Tabs
          style={{
            flexGrow: 1,
          }}
          className="[&>.ant-tabs-content]:!h-full"
          items={[
            {
              key: "overview",
              label: "Monthly Overview",
              children: (
                <Tabs
                  className="!h-full"
                  tabPosition="left"
                  // type="card"
                  items={[
                    {
                      key: "category_wise",
                      label: "Category Wise",
                      children: (
                        <Chart
                          chartType="PieChart"
                          width="100%"
                          className="!h-full"
                          data={state.category_wise}
                        />
                      ),
                    },
                    {
                      key: "vendor_wise",
                      label: "Vendor Wise",
                      children: (
                        <Chart
                          chartType="PieChart"
                          width="100%"
                          className="!h-full"
                          data={state.vendor_wise}
                        />
                      ),
                    },
                  ]}
                />
              ),
            },
            {
              key: "pending",
              label: (
                <>
                  Pending Purchases{" "}
                  <Badge count={state.pending_purchases.length} />
                </>
              ),
              children: (
                <>
                  <Table
                    // loading={state.loading}
                    className="my-4"
                    dataSource={state.pending_purchases}
                    rowKey={(row) => row.id}
                    columns={purchaseColumns}
                    scroll={{x: "max-content"}}
                  />
                </>
              ),
            },
          ]}
        />
      </div>
    </>
  );
}
