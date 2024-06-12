import {useModalCreateBased} from "../../store/modalCreateBased.js";
const modalCreateBased = useModalCreateBased()

export default function createBased(e, router, id) {

  const routes = {
    'Покупка товаров': 'procurementOfGoodsCreate',
    'Возврат поставщику': 'providerReturnCreate',
    'Заказ поставщику': 'providerOrderCreate',
    'Продажа клиентам': 'sellingGoodsCreate',
    'Возврат от клиентов': 'clientReturnCreate',
    'Заказ клиентов': 'clientOrderCreate',
    'Перемещение между складами': 'moveOfGoodsCreate',
    'Инвентаризация склада': 'invertoryCreate',
    'Перемещение': 'moveOfGoodsCreate',
    'Приход денег': 'moneyComingCreate',
  }

  const query = {
    'Покупка товаров': false,
    'Возврат поставщику': false,
    'Заказ поставщику': false,
    'Продажа клиентам': true,
    'Возврат от клиентов': true,
    'Заказ клиентов': true,
    'Перемещение между складами': false,
    'Инвентаризация склада': false,
    'Приход денег': true
  }

  const routeName = routes[e.target.innerText];

  if (routeName) {
    router.push({ name: routeName, query: { id, isClient: query[e.target.innerText]} });
  }

  modalCreateBased.isModal()
}