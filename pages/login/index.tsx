import {Button, Card, Form, Input} from "antd";
import Router from "next/router";
import {useEffect, useState} from "react";
import {postRequest} from "../../common/network";
import {URLs} from "../../common/network/URLs";
import useAuth from "../../common/utils/useAuth";
import {NextPageWithLayout} from "../_app";

interface initialStateI {
  loading: boolean;
}

const initialState: initialStateI = {
  loading: false,
};

const Login: NextPageWithLayout = () => {
  const [state, setState] = useState<initialStateI>(initialState);
  const setUser = useAuth((state) => state.setUser);
  const user = useAuth((state) => state.user);

  const login = (values: object) => {
    setState((prev) => ({...prev, loading: true}));
    postRequest({url: URLs.user, reqData: values}).then(() => {
      setUser({});
    });
  };

  useEffect(() => {
    if (user) {
      Router.push("/");
    }
  }, [user]);

  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-300/40">
      <Card title="Login" bordered={false} className="w-[80%] sm:w-[40%]">
        <Form
          name="login"
          labelCol={{span: 6}}
          wrapperCol={{span: 16, offset: 2}}
          onFinish={login}
          className="flex items-center flex-col"
          autoComplete="off"
        >
          <Form.Item
            label="Username"
            name="username"
            className="w-full"
            labelAlign="left"
            rules={[{required: true, message: "Please input your username!"}]}
          >
            <Input disabled={state.loading} />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            className="w-full"
            labelAlign="left"
            rules={[{required: true, message: "Please input your password!"}]}
          >
            <Input.Password disabled={state.loading} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={state.loading}>
            Submit
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
