import {Button, DatePicker, Form, Input} from "antd";
import {NextPage} from "next";
import {useEffect, useState} from "react";
import {postRequest} from "../../../common/network";
import {URLs} from "../../../common/network/URLs";
import useBreadcrumbs from "../../../common/utils/useBreadcrumbs";

export interface initialStateI {
  loading: boolean;
}

export const initialState: initialStateI = {
  loading: false,
};

const addCategory: NextPage = () => {
  const {useForm, useWatch} = Form;
  const [form] = useForm();
  const [state, setState] = useState(initialState);
  const setPath = useBreadcrumbs((state) => state.setPath);

  const addCategory = (values: any) => {
    console.log(values);

    setState((prev) => ({...prev, loading: true}));
    postRequest({
      url: URLs.creditCard,
      reqData: {
        ...values,
        expiry_date: values.expiry_date.format("YYYY-MM-DD"),
      },
    })
      .then((res) => {
        if (res.data) form.resetFields();
      })
      .finally(() => {
        setState((prev) => ({...prev, loading: false}));
      });
  };

  useEffect(() => {
    setPath([
      {
        label: "Master",
      },
      {
        label: "Credit Cards",
        link: "/master/creditCard",
      },
      {
        label: "Add Credit Card",
      },
    ]);
  }, []);
  return (
    <>
      <Form
        name="addCategory"
        labelCol={{span: 6}}
        wrapperCol={{span: 16, offset: 2}}
        form={form}
        onFinish={addCategory}
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
            name="number"
            label="Number"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required
            rules={[{required: true, message: "Please enter card number!"}]}
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
            name="holder"
            label="Holder"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required
            rules={[
              {required: true, message: "Please enter card holder name!"},
            ]}
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
            name="expiry_date"
            label="Expiry Date"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required
            rules={[{required: true, message: "Please select expiry date!"}]}
          >
            <DatePicker />
          </Form.Item>
        </div>

        <Button type="primary" htmlType="submit" loading={state.loading}>
          Submit
        </Button>
      </Form>
    </>
  );
};

export default addCategory;
