<script setup>
import Button from "../../../components/button/button.vue";
import { onMounted, ref, watch, computed } from "vue";
import groupApi from "../../../api/list/goodGroup";
import goodsApi from "../../../api/list/goods";
import showToast from "../../../composables/toast";
import Icons from "../../../composables/Icons/Icons.vue";
import unitsApi from "../../../api/list/units";
import barcode from "./barcode.vue";
import storageApi from "../../../api/list/storage";
import { useRoute, useRouter } from "vue-router";
import ConfirmModal from "../../../components/confirm/ConfirmModal.vue";
import { addMessage, editMessage } from "../../../composables/constant/buttons";
import validate from "./validate";
import {
  FIELD_COLOR,
  BASE_COLOR,
  TITLE_COLOR
} from "../../../composables/constant/colors.js";
import {
  createAccess,
  readAccess,
  removeAccess,
  updateAccess,
} from "../../../composables/access/access.js";

const { query, params: routeParams } = useRoute();
const router = useRouter();

const notImg = ref(false);
const isValid = ref(false);
const isEdit = ref(false);
const isCreated = ref(false);
const isCreateOnBase = ref(false);
const showModal = ref(false);
const showConfirmDialog = ref(false);

const currentIndex = ref(0);

const name = ref("");
const good_name = ref("");
const vendor_code = ref("");
const description = ref("");

const id = ref(0);
const storage_id = ref(null);
const unit_id = ref(null);
const good_group_id = ref(null);

const images_id = ref([]);
const imageRef = ref([]);
const goodItem = ref([]);
const add_images = ref([]);
const url = ref([]);
const storages = ref([]);
const units = ref([]);
const groups = ref([]);

const rules = {
  required: (v) => !!v,
};

const itemsProps = (item) => {
  return {
    title: item.name,
  };
};

const toggleModal = () => {
  showModal.value = !showModal.value;
};

const isDataChanged = () => {
  const item = goodItem.value;
  const isChanged =
    name.value !== item.name ||
    vendor_code.value !== item.vendor_code ||
    description.value !== item.description ||
    good_group_id.value !== item.good_group.id ||
    unit_id.value !== item.unit_id.id ||
    storage_id.value !== item.storage.id;
  return isChanged;
};

const closingWithSaving = async () => {
  if (isEdit.value) {
    await updateGood({ page: 1, itemsPerPage: 10, sortBy: "id", search: null });
    showModal.value = false;
  } else {
    const isValid = validate(
      name,
      vendor_code,
      description,
      unit_id,
      storage_id,
      main_image
    );
    showModal.value = false;
    if (isValid === true) {
      await createGood({
        page: 1,
        itemsPerPage: 10,
        sortBy: "id",
        search: null,
      });
      showModal.value = false;
      showConfirmDialog.value = false;
    }
  }
  await getGoodByid();
};

const closeDialogWithoutSaving = () => {
  showModal.value = false;
  showConfirmDialog.value = false;
  router.push("/list/nomenclature");
  cleanForm();
};

const checkUpdate = () => {
  if (isDataChanged()) {
    showModal.value = true;
  } else {
    router.push("/list/nomenclature");
  }
};

const cleanForm = () => {
  name.value = null;
  vendor_code.value = null;
  description.value = null;
  unit_id.value = null;
  storage_id.value = null;
  main_image.value = null;
};

const main_image = computed(() => add_images.value[currentIndex.value]);

const previousImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

const nextImage = () => {
  if (currentIndex.value < add_images.value.length - 1) {
    currentIndex.value++;
  }
};

const goToImages = () => {
  if (id.value == 0) {
    showToast("Сначало сохраните товар", "warning");
    return;
  }
  router.push({
    name: "goodImages",
    params: {
      id: id.value,
    },
  });
};

const getUnits = async ({ page, itemsPerPage, sortBy, search }) => {
  try {
    const { data } = await unitsApi.get({ page, itemsPerPage, sortBy }, search);
    units.value = data.result.data;
  } catch (e) {
    console.error(e);
  }
};

const getGoodByid = async () => {
  if (id.value == 0) {
    return;
  }
  try {
    add_images.value = [];
    const { data } = await goodsApi.getById(id.value);
    const good = data.result;
    goodItem.value = good;
    good_name.value = good.name;
    name.value = good.name;
    (vendor_code.value = good.vendor_code),
      (description.value = good.description),
      (unit_id.value = good.unit_id.id),
      (storage_id.value = good.storage.id),
      (good_group_id.value = good.good_group.id),
      good.images.forEach((image) => {
        if (image.is_main === 1) {
          add_images.value.push(import.meta.env.VITE_IMG_URL + image.image);
        } else {
          add_images.value.push(import.meta.env.VITE_IMG_URL + image.image);
        }
      });
    if (good.images.length === 0) {
      notImg.value = true;
      add_images.value.push(
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/4QAuRXhpZgAATU0AKgAAAAgAAkAAAAMAAAABAAAAAEABAAEAAAABAAAAAAAAAAD/2wBDAAoHBwkHBgoJCAkLCwoMDxkQDw4ODx4WFxIZJCAmJSMgIyIoLTkwKCo2KyIjMkQyNjs9QEBAJjBGS0U+Sjk/QD3/2wBDAQsLCw8NDx0QEB09KSMpPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT3/wAARCAHaAdoDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD2WiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoqvc31va/66QBuyjqap/8ACQWv9yX/AL5H+NAGpRWX/wAJBa/3JvyH+NH/AAkFr/cm/If40AalFZf/AAkFr/cm/If40f8ACQWv9yb8h/jQBqUVnx63aSHBZo/d1xV8EOoZSCD0INAC0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFZ+q6h9jhCoR5r9PYetXJ5lt4Wkc4VRk1ydzcPdTtK/VjwPQUAREs5LMSWY8knOaWiigAooooAKKKKACrmmag1nMFYkwsfmU9vcVTooA7MEMAQcg9DS1j6Hfb0+zSH5lGUJ7j0/CtigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooACQASeAO9Y13roRilqobHV26fhT9dujHCtuhwZOWx6f/XrBoAuHWL0nPnY9gopP7Xvf+e5/IVUooAnuL64uUCTSllBzjGKgoooAKKsWdjLfPiMYQH5mPQf/AF637XS7e1wQu9/7zc//AKqAOeisribBjhcg98YqwNFvT/yzUfVhXTUUAcrJpN5HyYCf90g1WdGjO11ZW9CMV2dRywxToVlQOvoRQBx9Fa99oZQGS0ywHJQnn8Kx+RkHqOCDQAscjROHQlWByCO1W/7Xvf8AnufyFVKbQBd/te9/57n8hU0Ou3UZHmbJF7gjB/SszI9adQB1lnfRXse6M4YfeU9RViuRtLlrS5SVegOGHqK60EMAR0IoAWiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA5zXSf7QHsgxWdWjrv/IQ/wCACs6gAooooAKsWFk19OEGQi8s3oP8TVeuo0y0+yWiqR87fMx96ALMUSQRiONQqL0Ap9FQ3V1HaQmSU4A6Ad6AJqQuq8FgD7muYutXubkkBjFH2CnH5mqR55PJ96AO1BB5FFcdFcS25zDIyH2PFbenawJyIbnCyHhWHAb/AANAGtWTrGmiVDcQr+8A+YD+If41rUUAcTXU2FjBBax/u1ZmUFmIzmsTVbQWt2dowknzL6D1pbXWLi1hEYCOo6bu1AHRNawOpVoYyD22iuWvYRBeSxKcqrcd6ut4guSpAjiUnoQCazXdpHLMSWY5JPegBldfYkmxgJ/55r/KuQrrrD/jwg/3BQBYooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAOc13/kIf8AABWdWjrv/IQ/4AKzqACiiigCxp0Qmv4UPI3ZP4c11lc3oYB1IeyHFdJQAVy2qXZurxsH93Gdqj+tdNMxWF2HUKTXGUAOooooAKKKKAOn0q8N3ZgscyIdre/vV2sPw8x8ydexANblAGXr0QayWTvG36Hj/CufrqdVAOmT5/u5rlqACiiigBtddYf8eEH+4K5GuusP+PCD/cFAFiiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA5zXf+Qh/wAVnVo67/wAhD/gArOoAKKKKALujSeXqaZ6MCv8An8q6euNilMMySL1Rg1dhHIssSupyrDINACuoZCp6EYrjpYzFI8bfeUkGuyrG1nTTITcwrlh99R396AMSiiigAooqa0tJLyYRoOP4m/u0Aa3h+EiGWYj7x2j8P/11sVHDEtvCkSDCqMCpKAKWsSBNMl/2sKPzrmK2fEFwP3duD0+dv6f1rGoAKKKKAG111h/x4Qf7grka66w/48IP9wUAWKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigDnNd/5CH/AAAVnVo67/yEP+ACs6gAooooAK2dDvuPssh5H3Ce/tWNSAlCGUkEHII4xQB2tFZmm6styBFMQsvQE9GrToAoXWj290xcAxuf4l/wqg3h6XPyzqR7rit6igDHh8PICDPMzf7KjFakMMdvGEiQKo7CpKKACorm4S2gaWQ4UCi4uI7aMySsFUfrXNX9+99J3WNT8q/4+9AEFxM1zO8r/eY5+n/6qZRRQAUUUUANrrrD/jwg/wBwVyNddYf8eEH+4KALFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQBzmvAjUFPYoMVnV0Gt2ZngWZBl4+oHcVz9ABRRRQAUUUUAFX7XWLi2AVj5qDsx5/OqFFAHRRa7ayff3xn3GasDU7M/8vCfnXK0UAdRJq9nH/y2DH0UE1RuPEHBFtEf95/8KxaKAHzXEty++Zyzds9qZRRQAUUUUAFFFFADa6+yBFlAD1EY/lXNWFoby6WMA7AcufQf/XrrAAAAOgoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArLvNEjncvC3lOeSMcH/CtSigDnDoN2DwYiPXOKP7Cu/8Apl/31XR0UAc5/YV3/wBMv++qP7Cu/wDpl/31XR0UAc5/YV3/ANMv++qP7Cu/+mX/AH1XR0UAc5/YV3/0y/76o/sK7/6Zf99V0dFAHOf2Fd/9Mv8Avqj+wrv/AKZf99V0dFAHOf2Fd/8ATL/vqj+wrv8A6Zf99V0dFAHOf2Fd/wDTL/vqj+wrv/pl/wB9V0dFAHOf2Fd/9Mv++qlh8PykjzpVVfReTW9RQBDbWsVrGI4lwO59amoooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACsi2v7iTWGt2ZfKDNgY546Vr1y7STRaxM1su6QO2BjNAHR3LmO2ldfvKhI/KqOj3s16JTOwO0jGBiqct3qjROskBCFSGPl4wKl8OfduPqv9aAIW1O/kupIoCGIY4UKOgp/wBo1n/nkf8AvgVTjuJLbU5ZIU3uGYBcE9/arv8AbV9/z6D/AL4agCxcTaiLa3MSEyEHzBtHFUZdT1KFwkmEZhkAoOa34nLxIzDDMoJFYWuf8hKL/dH86ALNtNqrXMYmjIjJ+Y7QMCteiigCvdXsNkgaZsE9ABkmsq614ugFqGRgeS6g5FNukF14gWKTlBgYPpjP61Y12NI7OIIqqA/QDHagBLfxBF5arcK+/HzMAOa1IZo7iMSRMGU9CKp2VtFcaTCsiKcp1IrO0mVooL1QThU3D680AT3erzSXJt7FckHG7Gc/T296ikuNWtB5kvKd8gEfp0p/h2MHzpD94YUGttlDoVYZU8EGgClb35vbGSSAYmUH5fftWdJe6tDGXkTao6koOKTQyY9SljH3Sp/Q1p6x/wAgyX8P50AZkV9qtwm+Fd65xkIK0jeta6ak12D5pHK9CTTNB/5B/wDwM1S8QsTNCn8IUmgBEutUvsvbjagPGAMfr1p8Gr3FtP5N+vGcE4wR/iK2II1igRFGFVQBiszxDGpgikx8wbbn6/8A6qANfryKKq6Y5k06Bm67cflxVqgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArn7T/kYpP9566CoVtIEmMyxKJDyWA55oAW7/AOPOf/rm38qyvDn3Lj6r/Wth1V0KsAVIwQaZDbQ2+fJjVM9cDrQBz9tcpaatLLLu2hnHA960/wC3rT0l/wC+asnTrR2LNboSTkkjrSf2ZZ/8+0f5UAS21yl1CJY87T0yMVia5/yEov8AdH863YokhQJGoVR0ApktpBO4eWJXYDAJFAE1FFFAGXqOnSy3CXVqQJVxkE4ziqOp3F3LAi3VuIwrZDA8E10VRzQRXChZkV1HIBFAGNbzahJYJDb24CFcCQnqKvafpotbV0kIZ5B8xFXY41iQIihVUYAHanUAc5azPo968c6kxt1x39CKv3OuwLCfIJdzwMjAFX5reK5G2aMOB6ioU0uzjYMsC5HTJJ/nQBS0K0dd9zICN4wue/v+NW9Y/wCQZL+H86u0yWJJkKSKGU9QaAKOg/8AIP8A+Bmma5aNPAssYJaPOQPStCKGOBNkKKi9cAVJQBj2Otw/Z1S4JV1GM4yDVW/vDqk8cFsrFQeMjqfX6CtiXTLSZyzwLuPUjjP5VJBaw2wIgjVM9SByaAHW8QggSIdEUDNSUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQB/9k="
      );
    }
  } catch (e) {
    console.error(e);
  }
};

const getStorage = async ({ page, itemsPerPage, sortBy, search }) => {
  try {
    const { data } = await storageApi.get(
      { page, itemsPerPage, sortBy },
      search
    );
    storages.value = data.result.data;
  } catch (e) {
    console.error(e);
  }
};

const getGroups = async ({ page, itemsPerPage, sortBy, search }) => {
  try {
    const { data } = await groupApi.get({ page, itemsPerPage, sortBy }, search);
    groups.value = data.result.data;
  } catch (e) {
    console.error(e);
  }
};

const updateGood = async () => {
  if (id.value == 0) {
    return;
  } else if (
    validate(name, vendor_code, storage_id, unit_id, good_group_id) !== true
  )
    return;
  try {
    isValid.value = true;
    const formData = new FormData();
    function appendIfNotNull(key, value) {
      if (value !== null) {
        formData.append(key, value);
      }
    }
    appendIfNotNull("name", name.value);
    appendIfNotNull("vendor_code", vendor_code.value);
    appendIfNotNull("description", description.value);
    appendIfNotNull("main_image", imageRef.value);
    if (!images_id.value) {
      appendIfNotNull("image_ids[]", images_id.value);
    }
    appendIfNotNull("storage_id", storage_id.value);
    appendIfNotNull("good_group_id", good_group_id.value);
    appendIfNotNull("unit_id", unit_id.value);

    await goodsApi.update(id.value, formData);
    showToast(editMessage);
  } catch (e) {
    console.error(e);
  } finally {
    isValid.value = false;
  }
};

const createGood = async () => {
  if (validate(name, vendor_code, storage_id, unit_id, good_group_id) !== true)
    return;
  try {
    isValid.value = true;

    const formData = new FormData();

    function appendIfNotNull(key, value) {
      if (value !== null) {
        formData.append(key, value);
      }
    }
    appendIfNotNull("name", name.value);
    appendIfNotNull("vendor_code", vendor_code.value);
    appendIfNotNull("description", description.value);
    appendIfNotNull("unit_id", unit_id.value);
    appendIfNotNull("storage_id", storage_id.value);
    appendIfNotNull("good_group_id", good_group_id.value);
    const { data } = await goodsApi.create(formData);
    id.value = data.result.id;
    showToast(addMessage);
    isCreated.value = true;
    isCreateOnBase.value = false;
    router.push({ name: "createUpdateGood", params: { id: id.value } });
  } catch (e) {
    console.error(e);
    if (e.response.data.errors.vendor_code) {
      showToast("Такой артикуль уже существует", "warning");
    }
  } finally {
    isValid.value = false;
  }
};

const isEditGood = async () => {
  id.value = routeParams.id;
  isEdit.value = id.value != 0;
};

const check = async () => {
  if (isEdit.value === false) {
    add_images.value.push(
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/4QAuRXhpZgAATU0AKgAAAAgAAkAAAAMAAAABAAAAAEABAAEAAAABAAAAAAAAAAD/2wBDAAoHBwkHBgoJCAkLCwoMDxkQDw4ODx4WFxIZJCAmJSMgIyIoLTkwKCo2KyIjMkQyNjs9QEBAJjBGS0U+Sjk/QD3/2wBDAQsLCw8NDx0QEB09KSMpPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT3/wAARCAHaAdoDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD2WiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoqvc31va/66QBuyjqap/8ACQWv9yX/AL5H+NAGpRWX/wAJBa/3JvyH+NH/AAkFr/cm/If40AalFZf/AAkFr/cm/If40f8ACQWv9yb8h/jQBqUVnx63aSHBZo/d1xV8EOoZSCD0INAC0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFZ+q6h9jhCoR5r9PYetXJ5lt4Wkc4VRk1ydzcPdTtK/VjwPQUAREs5LMSWY8knOaWiigAooooAKKKKACrmmag1nMFYkwsfmU9vcVTooA7MEMAQcg9DS1j6Hfb0+zSH5lGUJ7j0/CtigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooACQASeAO9Y13roRilqobHV26fhT9dujHCtuhwZOWx6f/XrBoAuHWL0nPnY9gopP7Xvf+e5/IVUooAnuL64uUCTSllBzjGKgoooAKKsWdjLfPiMYQH5mPQf/AF637XS7e1wQu9/7zc//AKqAOeisribBjhcg98YqwNFvT/yzUfVhXTUUAcrJpN5HyYCf90g1WdGjO11ZW9CMV2dRywxToVlQOvoRQBx9Fa99oZQGS0ywHJQnn8Kx+RkHqOCDQAscjROHQlWByCO1W/7Xvf8AnufyFVKbQBd/te9/57n8hU0Ou3UZHmbJF7gjB/SszI9adQB1lnfRXse6M4YfeU9RViuRtLlrS5SVegOGHqK60EMAR0IoAWiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA5zXSf7QHsgxWdWjrv/IQ/wCACs6gAooooAKsWFk19OEGQi8s3oP8TVeuo0y0+yWiqR87fMx96ALMUSQRiONQqL0Ap9FQ3V1HaQmSU4A6Ad6AJqQuq8FgD7muYutXubkkBjFH2CnH5mqR55PJ96AO1BB5FFcdFcS25zDIyH2PFbenawJyIbnCyHhWHAb/AANAGtWTrGmiVDcQr+8A+YD+If41rUUAcTXU2FjBBax/u1ZmUFmIzmsTVbQWt2dowknzL6D1pbXWLi1hEYCOo6bu1AHRNawOpVoYyD22iuWvYRBeSxKcqrcd6ut4guSpAjiUnoQCazXdpHLMSWY5JPegBldfYkmxgJ/55r/KuQrrrD/jwg/3BQBYooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAOc13/kIf8AABWdWjrv/IQ/4AKzqACiiigCxp0Qmv4UPI3ZP4c11lc3oYB1IeyHFdJQAVy2qXZurxsH93Gdqj+tdNMxWF2HUKTXGUAOooooAKKKKAOn0q8N3ZgscyIdre/vV2sPw8x8ydexANblAGXr0QayWTvG36Hj/CufrqdVAOmT5/u5rlqACiiigBtddYf8eEH+4K5GuusP+PCD/cFAFiiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA5zXf+Qh/wAVnVo67/wAhD/gArOoAKKKKALujSeXqaZ6MCv8An8q6euNilMMySL1Rg1dhHIssSupyrDINACuoZCp6EYrjpYzFI8bfeUkGuyrG1nTTITcwrlh99R396AMSiiigAooqa0tJLyYRoOP4m/u0Aa3h+EiGWYj7x2j8P/11sVHDEtvCkSDCqMCpKAKWsSBNMl/2sKPzrmK2fEFwP3duD0+dv6f1rGoAKKKKAG111h/x4Qf7grka66w/48IP9wUAWKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigDnNd/5CH/AAAVnVo67/yEP+ACs6gAooooAK2dDvuPssh5H3Ce/tWNSAlCGUkEHII4xQB2tFZmm6styBFMQsvQE9GrToAoXWj290xcAxuf4l/wqg3h6XPyzqR7rit6igDHh8PICDPMzf7KjFakMMdvGEiQKo7CpKKACorm4S2gaWQ4UCi4uI7aMySsFUfrXNX9+99J3WNT8q/4+9AEFxM1zO8r/eY5+n/6qZRRQAUUUUANrrrD/jwg/wBwVyNddYf8eEH+4KALFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQBzmvAjUFPYoMVnV0Gt2ZngWZBl4+oHcVz9ABRRRQAUUUUAFX7XWLi2AVj5qDsx5/OqFFAHRRa7ayff3xn3GasDU7M/8vCfnXK0UAdRJq9nH/y2DH0UE1RuPEHBFtEf95/8KxaKAHzXEty++Zyzds9qZRRQAUUUUAFFFFADa6+yBFlAD1EY/lXNWFoby6WMA7AcufQf/XrrAAAAOgoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArLvNEjncvC3lOeSMcH/CtSigDnDoN2DwYiPXOKP7Cu/8Apl/31XR0UAc5/YV3/wBMv++qP7Cu/wDpl/31XR0UAc5/YV3/ANMv++qP7Cu/+mX/AH1XR0UAc5/YV3/0y/76o/sK7/6Zf99V0dFAHOf2Fd/9Mv8Avqj+wrv/AKZf99V0dFAHOf2Fd/8ATL/vqj+wrv8A6Zf99V0dFAHOf2Fd/wDTL/vqj+wrv/pl/wB9V0dFAHOf2Fd/9Mv++qlh8PykjzpVVfReTW9RQBDbWsVrGI4lwO59amoooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACsi2v7iTWGt2ZfKDNgY546Vr1y7STRaxM1su6QO2BjNAHR3LmO2ldfvKhI/KqOj3s16JTOwO0jGBiqct3qjROskBCFSGPl4wKl8OfduPqv9aAIW1O/kupIoCGIY4UKOgp/wBo1n/nkf8AvgVTjuJLbU5ZIU3uGYBcE9/arv8AbV9/z6D/AL4agCxcTaiLa3MSEyEHzBtHFUZdT1KFwkmEZhkAoOa34nLxIzDDMoJFYWuf8hKL/dH86ALNtNqrXMYmjIjJ+Y7QMCteiigCvdXsNkgaZsE9ABkmsq614ugFqGRgeS6g5FNukF14gWKTlBgYPpjP61Y12NI7OIIqqA/QDHagBLfxBF5arcK+/HzMAOa1IZo7iMSRMGU9CKp2VtFcaTCsiKcp1IrO0mVooL1QThU3D680AT3erzSXJt7FckHG7Gc/T296ikuNWtB5kvKd8gEfp0p/h2MHzpD94YUGttlDoVYZU8EGgClb35vbGSSAYmUH5fftWdJe6tDGXkTao6koOKTQyY9SljH3Sp/Q1p6x/wAgyX8P50AZkV9qtwm+Fd65xkIK0jeta6ak12D5pHK9CTTNB/5B/wDwM1S8QsTNCn8IUmgBEutUvsvbjagPGAMfr1p8Gr3FtP5N+vGcE4wR/iK2II1igRFGFVQBiszxDGpgikx8wbbn6/8A6qANfryKKq6Y5k06Bm67cflxVqgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArn7T/kYpP9566CoVtIEmMyxKJDyWA55oAW7/AOPOf/rm38qyvDn3Lj6r/Wth1V0KsAVIwQaZDbQ2+fJjVM9cDrQBz9tcpaatLLLu2hnHA960/wC3rT0l/wC+asnTrR2LNboSTkkjrSf2ZZ/8+0f5UAS21yl1CJY87T0yMVia5/yEov8AdH863YokhQJGoVR0ApktpBO4eWJXYDAJFAE1FFFAGXqOnSy3CXVqQJVxkE4ziqOp3F3LAi3VuIwrZDA8E10VRzQRXChZkV1HIBFAGNbzahJYJDb24CFcCQnqKvafpotbV0kIZ5B8xFXY41iQIihVUYAHanUAc5azPo968c6kxt1x39CKv3OuwLCfIJdzwMjAFX5reK5G2aMOB6ioU0uzjYMsC5HTJJ/nQBS0K0dd9zICN4wue/v+NW9Y/wCQZL+H86u0yWJJkKSKGU9QaAKOg/8AIP8A+Bmma5aNPAssYJaPOQPStCKGOBNkKKi9cAVJQBj2Otw/Z1S4JV1GM4yDVW/vDqk8cFsrFQeMjqfX6CtiXTLSZyzwLuPUjjP5VJBaw2wIgjVM9SByaAHW8QggSIdEUDNSUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQB/9k="
    );
  }
  if (query.createOnBase == "1") {
    isCreateOnBase.value = true;

    id.value = routeParams.id;
  } else {
    isEditGood();
  }
};

onMounted(async () => {
  await check();
  await Promise.all([
    getGoodByid(),
    getUnits({ page: 1, itemsPerPage: 1000 }),
    getStorage({ page: 1, itemsPerPage: 1000 }),
    getGroups({ page: 1, itemsPerPage: 1000 }),
  ]);
});
</script>

<template>
  <div class="pa-4" @keyup.esc="$router.go(-1)">
    <div class="d-flex justify-space-between align-center mb-2 ms-4">
      <div class="d-flex ga-4">
        <!-- <div
          style="cursor: pointer"
          @click="
            isEdit && !isCreateOnBase
              ? checkUpdate()
              : $router.push('/list/nomenclature')
          "
          class="pa-1 bg-green rounded-circle d-inline-block mr-4 text-uppercase"
        >
          <v-icon icon="keyboard_backspace" size="x-small" />
        </div> -->
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }"> {{ isEdit && !isCreateOnBase ? `Товар: ${good_name}` : "Добавление" }} </span>
      </div>
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex ga-3 align-center mt-2 me-4">
          <Button
            v-if="
              isEdit && !isCreateOnBase
                ? updateAccess('nomenclature')
                : createAccess('nomenclature')
            "
            @click="goToImages()"
            name="img"
          />
          <Button
            v-if="
              isEdit && !isCreateOnBase
                ? updateAccess('nomenclature')
                : createAccess('nomenclature')
            "
            @click="isEdit && !isCreateOnBase ? updateGood() : createGood()"
            name="save"
          />
          <Button
            @click="
              isEdit && !isCreateOnBase
                ? checkUpdate()
                : $router.push('/list/nomenclature')
            "
            name="close"
          />
        </div>
      </div>
    </div>
    <v-card
      min-width="650"
      class="d-flex pa-5 justify-center flex-column mx-auto my-0"
      rounded="xl"
    >
      <v-form
        :disabled="!updateAccess('nomenclature') && isEdit"
        class="d-flex w-100"
      >
        <v-row class="w-100">
          <v-col class="d-flex flex-column w-100 ga-3">
            <div class="d-flex ga-4">
              <v-text-field
                v-model="name"
                style="max-width: 49.4%; min-width: 49.4%"
                :rules="isValid ? [rules.required] : []"
                :color="BASE_COLOR"
                rounded="lg"
                variant="outlined"
                class="w-auto text-sm-body-1"
                density="compact"
                placeholder="Наименование"
                label="Наименование"
                autofocus
                clear-icon="close"
                clearablehide-details
                clearable
                hide-details
                :base-color="FIELD_COLOR"
              />
              <v-text-field
                style="max-width: 49.4%; min-width: 49.4%"
                v-model="vendor_code"
                :rules="isValid ? [rules.required] : []"
                :color="BASE_COLOR"
                rounded="lg"
                variant="outlined"
                class="w-auto text-sm-body-1"
                density="compact"
                maxlength="8"
                placeholder="Артикуль"
                v-mask="'########'"
                label="Артикуль"
                clear-icon="close"
                clearable
                hide-details
                :base-color="FIELD_COLOR"
              />
            </div>
            <div class="d-flex ga-4">
              <v-autocomplete
                style="max-width: 49.4%; min-width: 49.4%"
                :rules="isValid ? [rules.required] : []"
                placeholder="Место расположения"
                label="Место расположения"
                :item-props="itemsProps"
                v-model="storage_id"
                variant="outlined"
                item-title="name"
                item-value="id"
                rounded="lg"
                :items="storages"
                :color="BASE_COLOR"
                hide-details
                :base-color="FIELD_COLOR"
              />
              <v-autocomplete
                style="max-width: 49.4%; min-width: 49.4%"
                :rules="isValid ? [rules.required] : []"
                placeholder="Ед измерения"
                :item-props="itemsProps"
                label="Ед измерения"
                v-model="unit_id"
                rounded="lg"
                variant="outlined"
                item-title="name"
                item-value="id"
                :items="units"
                :color="BASE_COLOR"
                hide-details
                :base-color="FIELD_COLOR"
              />
            </div>
            <div
              :class="add_images.length > 1 ? 'mb-3' : ''"
              class="d-flex justify-space-between ga-3"
            >
              <div style="min-width: 240px; max-height: 186px">
                <div>
                  <img
                    @click="
                      (updateAccess('nomenclature') && isEdit) ||
                      (createAccess('nomenclature') && !isEdit)
                        ? goToImages()
                        : ''
                    "
                    v-if="main_image"
                    :src="main_image"
                    class="image"
                    alt="Main Image"
                    style="
                      width: 100%;
                      height: 100%;
                      border-radius: 4px;
                      border: 1px solid #274d87;
                      cursor: pointer;
                      object-fit: contain;
                    "
                  />
                  <div
                    v-if="!notImg && add_images.length > 1"
                    class="d-flex justify-space-between w-100"
                  >
                    <div style="cursor: pointer" @click="previousImage()">
                      <Icons name="left"></Icons>
                    </div>
                    <div style="cursor: pointer" @click="nextImage()">
                      <Icons name="right"></Icons>
                    </div>
                  </div>
                </div>
              </div>
              <div class="d-flex flex-column ga-3" style="width: 100%">
                <v-autocomplete
                  :rules="isValid ? [rules.required] : []"
                  placeholder="Группа номенклатуры"
                  label="Группа номенклатуры"
                  :item-props="itemsProps"
                  v-model="good_group_id"
                  variant="outlined"
                  item-title="name"
                  item-value="id"
                  :items="groups"
                  :color="BASE_COLOR"
                  hide-details
                  :base-color="FIELD_COLOR"
                />
                <v-textarea
                  v-model="description"
                  variant="outlined"
                  label="Описание"
                  :color="BASE_COLOR"
                  :base-color="FIELD_COLOR"
                  hide-details
                  rows="4"
                />
              </div>
            </div>

            <div
              :style="`border: 2px solid ${BASE_COLOR}`"
              style="border-radius: 8px"
            >
              <barcode
                :isCreated="isCreated"
                :id="id"
                :isEdit="isEdit"
                :createOnBase="isCreateOnBase"
              />
            </div>
          </v-col>
        </v-row>
      </v-form>
    </v-card>
    <div v-if="showModal">
      <ConfirmModal
        :showModal="true"
        @close="toggleModal()"
        @closeClear="closeDialogWithoutSaving()"
        @closeWithSaving="closingWithSaving()"
      />
    </div>
  </div>
</template>
<style scoped>
.photo_el:hover {
  color: green;
  cursor: pointer;
}
.image {
  object-fit: contain;
  max-height: 180px;
  /* max-width: 280px; */
}
</style>
