import getDateTimeInShow from "../date/getDateTimeInShow.js";

export default async function getDataBased(routId, form, goods, documentApi) {
  if (routId) {
    const {data} = await documentApi.getById(routId)
    form.date = getDateTimeInShow(data.result.date, "-", true);
    form.organization = {
      id: data.result.organization.id,
      name: data.result.organization.name,
    };
    form.counterparty = {
      id: data.result.counterparty.id,
      name: data.result.counterparty.name,
    };
    form.cpAgreement = {
      id: data.result.counterpartyAgreement.id,
      name: data.result.counterpartyAgreement.name,
    };
    form.storage = {
      id: data.result.storage.id,
      name: data.result.storage.name,
    };
    form.comment = data.result.comment;
    form.currency = data.result.currency;
    goods.value = data.result.goods.map((item) => ({
      id: item.id,
      good_id: item.good.id,
      amount: item.amount,
      price: item.price,
    }));
  }
}