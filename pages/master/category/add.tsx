import {Button, Form, Input} from "antd";
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

  const addCategory = (values: object) => {
    console.log(values);

    setState((prev) => ({...prev, loading: true}));
    postRequest({
      url: URLs.category,
      reqData: values,
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
        label: "Category",
        link: "/master/category",
      },
      {
        label: "Add Category",
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
            name="name"
            label="Name"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required
            rules={[{required: true, message: "Please enter name!"}]}
          >
            <Input />
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
