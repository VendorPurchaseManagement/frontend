import {DefaultOptionType} from "antd/es/select";
import {getRequest} from "../network";
import {URLs} from "../network/URLs";

export interface SelectWithChildren extends DefaultOptionType {
  children: SelectWithChildren[];
}

type selectType = "category" | "location" | "payment_cycle" | "mode";

const getSelectOptions = async (select: selectType, vendor?: number) => {
  let response = await getRequest<SelectWithChildren[]>({
    url: URLs.options,
    params: {
      query: select,
      vendor: vendor,
    },
  });

  if (response.data) return response.data;
  return [];
};

export default getSelectOptions;
