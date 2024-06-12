import getDateTimeInShow from "../date/getDateTimeInShow.js";
import createOnBased from "../../api/documents/createOnBased.js";

export default async function getDataBased(routId, form, goods, isClient) {
  if (routId) {
    const {data} = await createOnBased.getById(routId)
    console.log(data)
    form.date = getDateTimeInShow(data.result.date, "-", true);
    form.organization = {
      id: data.result?.organization?.id,
      name: data.result?.organization?.name,
    };
    form.counterparty = {
      id: data.result?.counterparty?.id,
      name: data.result?.counterparty?.name,
    };

    if (!isClient) {
      form.cpAgreement = {
        id: data.result?.counterpartyAgreement?.id,
        name: data.result?.counterpartyAgreement?.name,
      };
    }

    if (data.result.storage) {
      form.storage = {
        id: typeof data.result?.storage === "object" ? data.result?.storage?.id : data.result?.storage,
        name: typeof data.result?.storage === "object" ? data.result?.storage?.name : data.result?.storage,
      };
    }

    form.comment = data.result?.comment;
    form.currency = data.result?.currency;

    if (data.result.goods) {
      goods.value = data.result.goods.length !== 0 ?
        data.result?.goods?.map(item => ({
          id: item.id,
          good_id: item.good.id,
          amount: item.amount,
          price: item.price,
        })) : [{
          id: 1,
          good_id: null,
          amount: "1",
          price: null,
        }];
    }
  }
}