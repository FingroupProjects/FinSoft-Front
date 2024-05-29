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
    'Инвентаризация склада': 'invertoryCreate'
  }

  const routeName = routes[e.target.innerText];

  if (routeName) {
    router.push({ name: routeName, query: { id } });
  }

  modalCreateBased.isModal()
}