import {CheckCircleOutlined} from "@ant-design/icons";
import {Button, Form, Input, Select, Tooltip} from "antd";
import axios from "axios";
import {NextPage} from "next";
import {useEffect, useState} from "react";
import {toast} from "react-hot-toast";
import {getRequest, postRequest} from "../../../common/network";
import {URLs} from "../../../common/network/URLs";
import getSelectOptions, {
  SelectWithChildren,
} from "../../../common/utils/getSelectOptions";
import useBreadcrumbs from "../../../common/utils/useBreadcrumbs";

interface initialStateI {
  vendors: SelectWithChildren[];
  loading: boolean;
  verification: {
    verified: boolean;
    inProgress: boolean;
  };
}

const initialState: initialStateI = {
  vendors: [],
  loading: false,
  verification: {
    verified: false,
    inProgress: false,
  },
};

const AddBankDetails: NextPage = () => {
  const {useForm, useWatch} = Form;
  const [form] = useForm();
  const ifsc = useWatch("ifsc", form);
  const [state, setState] = useState(initialState);
  const setPath = useBreadcrumbs((state) => state.setPath);

  const addBankDetails = (values: object) => {
    console.log(values);

    setState((prev) => ({...prev, loading: true}));
    postRequest({
      url: URLs.bankDetail,
      reqData: values,
    })
      .then((res) => {
        console.log(res);

        if (res.data) form.resetFields();
      })
      .finally(() => {
        setState((prev) => ({...prev, loading: false}));
      });
  };

  const verifyIFSC = async () => {
    setState((prev) => ({
      ...prev,
      verification: {
        verified: false,
        inProgress: true,
      },
    }));
    let response = await axios<{BANK: string; ADDRESS: string}>({
      url: URLs.verifyIFSC + ifsc,
      method: "GET",
    })
      .then((res) => ({verified: true, data: res.data}))
      .catch((err) => ({verified: false, data: undefined}));

    if (response.verified && response.data) {
      setState((prev) => ({
        ...prev,
        verification: {
          verified: true,
          inProgress: false,
        },
      }));
      form.setFieldValue("bank_name", response.data.BANK);
      form.setFieldValue("bank_address", response.data.ADDRESS);
      toast.success("IFSC Verified!");
    } else {
      setState((prev) => ({
        ...prev,
        verification: {
          verified: false,
          inProgress: false,
        },
      }));
      toast.error("IFSC Code cannot be verified!");
      form.resetFields(["bank_name", "bank_address"]);
    }
  };

  useEffect(() => {
    setPath([
      {
        label: "Vendors",
        link: "/vendor",
      },
      {
        label: "Bank Details",
        link: "/vendor/bankDetails",
      },
      {
        label: "Add Bank Details",
      },
    ]);
    getRequest<any[]>({
      url: URLs.vendor,
    }).then((res) => {
      if (res.data)
        setState((prev) => ({
          ...prev,
          vendors: res.data.map((item, index) => ({
            value: item.id,
            label: item.name,
            children: [],
          })),
        }));
      else setState((prev) => ({...prev, vendors: []}));
    });

    getSelectOptions("location").then((data) => {
      setState((prev) => ({...prev, locations: data}));
    });
    getSelectOptions("payment_cycle").then((data) => {
      setState((prev) => ({...prev, paymentCycles: data}));
    });
  }, []);
  return (
    <>
      <Form
        name="addBankDetails"
        labelCol={{span: 6}}
        wrapperCol={{span: 16, offset: 2}}
        form={form}
        onFinish={addBankDetails}
        className="flex items-center flex-col"
        autoComplete="off"
        disabled={state.loading}
      >
        <div className="flex flex-col sm:flex-row w-full justify-between">
          <Form.Item
            wrapperCol={{
              xs: {
                offset: 0,
              },
              md: {
                offset: 2,
              },
            }}
            name="vendor"
            label="Vendor"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required
            rules={[{required: true, message: "Please select a vendor!"}]}
          >
            <Select options={state.vendors} />
          </Form.Item>
          <Form.Item
            wrapperCol={{
              xs: {
                offset: 0,
              },
              md: {
                offset: 2,
              },
            }}
            name="acc_name"
            label="Acc Name"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required
            rules={[{required: true, message: "Please enter an acc name!"}]}
          >
            <Input />
          </Form.Item>
        </div>

        <div className="flex flex-col sm:flex-row w-full justify-between">
          <Form.Item
            wrapperCol={{
              xs: {
                offset: 0,
              },
              md: {
                offset: 2,
              },
            }}
            name="acc_number"
            label="Acc Number"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required
            rules={[{required: true, message: "Please enter an acc number!"}]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            wrapperCol={{
              xs: {
                offset: 0,
              },
              md: {
                offset: 2,
              },
            }}
            label="IFSC Code"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required
          >
            <Input.Group compact>
              <Form.Item
                name="ifsc"
                noStyle
                required
                rules={[{required: true, message: "Please enter a IFSC Code!"}]}
              >
                <Input
                  className="!w-[85%]"
                  onChange={() =>
                    setState((prev) => ({
                      ...prev,
                      verification: {
                        verified: false,
                        inProgress: false,
                      },
                    }))
                  }
                />
              </Form.Item>
              <Tooltip
                title={
                  state.verification.verified ? "Verified!" : "Verify IFSC"
                }
              >
                <Button
                  type="primary"
                  className="!w-[15%] !inline-flex items-center justify-center"
                  icon={<CheckCircleOutlined size={32} />}
                  onClick={verifyIFSC}
                  loading={state.verification.inProgress}
                  disabled={state.verification.verified}
                />
              </Tooltip>
            </Input.Group>
          </Form.Item>
        </div>
        <div className="flex flex-col sm:flex-row w-full justify-between">
          <Form.Item
            wrapperCol={{
              xs: {
                offset: 0,
              },
              md: {
                offset: 2,
              },
            }}
            name="bank_name"
            label="Bank Name"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required
            rules={[
              {
                required: true,
                message: "Please enter a bank name!",
              },
            ]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            wrapperCol={{
              xs: {
                offset: 0,
              },
              md: {
                offset: 2,
              },
            }}
            name="bank_address"
            label="Bank Address"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required
            rules={[
              {
                required: true,
                message: "Please enter a bank address!",
              },
            ]}
          >
            <Input disabled />
          </Form.Item>
        </div>

        <Button
          type="primary"
          htmlType="submit"
          loading={state.loading}
          disabled={!state.verification.verified}
        >
          Submit
        </Button>
      </Form>
    </>
  );
};

export default AddBankDetails;
