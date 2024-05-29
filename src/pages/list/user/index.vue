<script setup>
import {computed, onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import showToast from '../../../composables/toast'
import Icons from "../../../composables/Icons/Icons.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import CreateGroup from "./createGroup.vue"
import Button from "../../../components/button/button.vue"
import ChangePassword from "./changePassword.vue";
import ConfirmModal from "../../../components/confirm/ConfirmModal.vue";
import {createAccess, removeAccess, updateAccess} from "../../../composables/access/access.js";
import {
  addMessage,
  editMessage,
  ErrorSelectMessage,
  removeMessage,
  restoreMessage,
  selectOneItemMessage,
  warningMessage
} from "../../../composables/constant/buttons.js";
import organizationApi from "../../../api/list/organizations.js";
import user from "../../../api/list/user.js";
import validate from "./validate.js";
import {BASE_COLOR, FIELD_COLOR, FIELD_OF_SEARCH, TITLE_COLOR} from "../../../composables/constant/colors.js";
import {useFilterCanvasVisible} from "../../../store/canvasVisible.js";
import FilterCanvas from "../../../components/canvas/filterCanvas.vue";
import CustomFilterTextField from "../../../components/formElements/CustomFilterTextField.vue";
import CustomFilterAutocomplete from "../../../components/formElements/CustomFilterAutocomplete.vue";
import getExcel from "../../../composables/otherQueries/getExcel.js";
import getListColor from "../../../composables/displayed/getListColor.js";
import getListStatus from "../../../composables/displayed/getListStatus.js";
import {markedForDeletion} from "../../../composables/constant/items.js";
import userGroup from "../../../api/list/userGroup.js";
import englishSymbols from "../../../composables/format/onlyEnglishSymbols.js";

const showModal = ref(false);
const showConfirmDialog = ref(false);

const toggleModal = () => {
  showModal.value = !showModal.value;
}
const router = useRouter()

const loading = ref(true)
const dialog = ref(false)
const isDialogPassword = ref(false)
const idUser = ref(null)
const hoveredRowIndex = ref(null)
const isCreateGroup = ref(false)
const isEditGroup = ref(false)

const isExistsUser = ref(false)
const markedID = ref([])
const markedItem = ref([])
const userDialogTitle = ref(null)
const search = ref('')
const organization = ref(null)
const group = ref(null)
const groupIdRef = ref(0)

const fioRef = ref(null)
const statusRef = ref(true)
const loginRef = ref(null)
const passwordRef = ref(null)
const phoneRef = ref(null)
const emailRef = ref(null)
const imageRef = ref(null)
const imagePreview = ref('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/4QAuRXhpZgAATU0AKgAAAAgAAkAAAAMAAAABAAAAAEABAAEAAAABAAAAAAAAAAD/2wBDAAoHBwkHBgoJCAkLCwoMDxkQDw4ODx4WFxIZJCAmJSMgIyIoLTkwKCo2KyIjMkQyNjs9QEBAJjBGS0U+Sjk/QD3/2wBDAQsLCw8NDx0QEB09KSMpPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT3/wAARCAHaAdoDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD2WiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoqvc31va/66QBuyjqap/8ACQWv9yX/AL5H+NAGpRWX/wAJBa/3JvyH+NH/AAkFr/cm/If40AalFZf/AAkFr/cm/If40f8ACQWv9yb8h/jQBqUVnx63aSHBZo/d1xV8EOoZSCD0INAC0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFZ+q6h9jhCoR5r9PYetXJ5lt4Wkc4VRk1ydzcPdTtK/VjwPQUAREs5LMSWY8knOaWiigAooooAKKKKACrmmag1nMFYkwsfmU9vcVTooA7MEMAQcg9DS1j6Hfb0+zSH5lGUJ7j0/CtigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooACQASeAO9Y13roRilqobHV26fhT9dujHCtuhwZOWx6f/XrBoAuHWL0nPnY9gopP7Xvf+e5/IVUooAnuL64uUCTSllBzjGKgoooAKKsWdjLfPiMYQH5mPQf/AF637XS7e1wQu9/7zc//AKqAOeisribBjhcg98YqwNFvT/yzUfVhXTUUAcrJpN5HyYCf90g1WdGjO11ZW9CMV2dRywxToVlQOvoRQBx9Fa99oZQGS0ywHJQnn8Kx+RkHqOCDQAscjROHQlWByCO1W/7Xvf8AnufyFVKbQBd/te9/57n8hU0Ou3UZHmbJF7gjB/SszI9adQB1lnfRXse6M4YfeU9RViuRtLlrS5SVegOGHqK60EMAR0IoAWiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA5zXSf7QHsgxWdWjrv/IQ/wCACs6gAooooAKsWFk19OEGQi8s3oP8TVeuo0y0+yWiqR87fMx96ALMUSQRiONQqL0Ap9FQ3V1HaQmSU4A6Ad6AJqQuq8FgD7muYutXubkkBjFH2CnH5mqR55PJ96AO1BB5FFcdFcS25zDIyH2PFbenawJyIbnCyHhWHAb/AANAGtWTrGmiVDcQr+8A+YD+If41rUUAcTXU2FjBBax/u1ZmUFmIzmsTVbQWt2dowknzL6D1pbXWLi1hEYCOo6bu1AHRNawOpVoYyD22iuWvYRBeSxKcqrcd6ut4guSpAjiUnoQCazXdpHLMSWY5JPegBldfYkmxgJ/55r/KuQrrrD/jwg/3BQBYooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAOc13/kIf8AABWdWjrv/IQ/4AKzqACiiigCxp0Qmv4UPI3ZP4c11lc3oYB1IeyHFdJQAVy2qXZurxsH93Gdqj+tdNMxWF2HUKTXGUAOooooAKKKKAOn0q8N3ZgscyIdre/vV2sPw8x8ydexANblAGXr0QayWTvG36Hj/CufrqdVAOmT5/u5rlqACiiigBtddYf8eEH+4K5GuusP+PCD/cFAFiiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA5zXf+Qh/wAVnVo67/wAhD/gArOoAKKKKALujSeXqaZ6MCv8An8q6euNilMMySL1Rg1dhHIssSupyrDINACuoZCp6EYrjpYzFI8bfeUkGuyrG1nTTITcwrlh99R396AMSiiigAooqa0tJLyYRoOP4m/u0Aa3h+EiGWYj7x2j8P/11sVHDEtvCkSDCqMCpKAKWsSBNMl/2sKPzrmK2fEFwP3duD0+dv6f1rGoAKKKKAG111h/x4Qf7grka66w/48IP9wUAWKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigDnNd/5CH/AAAVnVo67/yEP+ACs6gAooooAK2dDvuPssh5H3Ce/tWNSAlCGUkEHII4xQB2tFZmm6styBFMQsvQE9GrToAoXWj290xcAxuf4l/wqg3h6XPyzqR7rit6igDHh8PICDPMzf7KjFakMMdvGEiQKo7CpKKACorm4S2gaWQ4UCi4uI7aMySsFUfrXNX9+99J3WNT8q/4+9AEFxM1zO8r/eY5+n/6qZRRQAUUUUANrrrD/jwg/wBwVyNddYf8eEH+4KALFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQBzmvAjUFPYoMVnV0Gt2ZngWZBl4+oHcVz9ABRRRQAUUUUAFX7XWLi2AVj5qDsx5/OqFFAHRRa7ayff3xn3GasDU7M/8vCfnXK0UAdRJq9nH/y2DH0UE1RuPEHBFtEf95/8KxaKAHzXEty++Zyzds9qZRRQAUUUUAFFFFADa6+yBFlAD1EY/lXNWFoby6WMA7AcufQf/XrrAAAAOgoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArLvNEjncvC3lOeSMcH/CtSigDnDoN2DwYiPXOKP7Cu/8Apl/31XR0UAc5/YV3/wBMv++qP7Cu/wDpl/31XR0UAc5/YV3/ANMv++qP7Cu/+mX/AH1XR0UAc5/YV3/0y/76o/sK7/6Zf99V0dFAHOf2Fd/9Mv8Avqj+wrv/AKZf99V0dFAHOf2Fd/8ATL/vqj+wrv8A6Zf99V0dFAHOf2Fd/wDTL/vqj+wrv/pl/wB9V0dFAHOf2Fd/9Mv++qlh8PykjzpVVfReTW9RQBDbWsVrGI4lwO59amoooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACsi2v7iTWGt2ZfKDNgY546Vr1y7STRaxM1su6QO2BjNAHR3LmO2ldfvKhI/KqOj3s16JTOwO0jGBiqct3qjROskBCFSGPl4wKl8OfduPqv9aAIW1O/kupIoCGIY4UKOgp/wBo1n/nkf8AvgVTjuJLbU5ZIU3uGYBcE9/arv8AbV9/z6D/AL4agCxcTaiLa3MSEyEHzBtHFUZdT1KFwkmEZhkAoOa34nLxIzDDMoJFYWuf8hKL/dH86ALNtNqrXMYmjIjJ+Y7QMCteiigCvdXsNkgaZsE9ABkmsq614ugFqGRgeS6g5FNukF14gWKTlBgYPpjP61Y12NI7OIIqqA/QDHagBLfxBF5arcK+/HzMAOa1IZo7iMSRMGU9CKp2VtFcaTCsiKcp1IrO0mVooL1QThU3D680AT3erzSXJt7FckHG7Gc/T296ikuNWtB5kvKd8gEfp0p/h2MHzpD94YUGttlDoVYZU8EGgClb35vbGSSAYmUH5fftWdJe6tDGXkTao6koOKTQyY9SljH3Sp/Q1p6x/wAgyX8P50AZkV9qtwm+Fd65xkIK0jeta6ak12D5pHK9CTTNB/5B/wDwM1S8QsTNCn8IUmgBEutUvsvbjagPGAMfr1p8Gr3FtP5N+vGcE4wR/iK2II1igRFGFVQBiszxDGpgikx8wbbn6/8A6qANfryKKq6Y5k06Bm67cflxVqgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArn7T/kYpP9566CoVtIEmMyxKJDyWA55oAW7/AOPOf/rm38qyvDn3Lj6r/Wth1V0KsAVIwQaZDbQ2+fJjVM9cDrQBz9tcpaatLLLu2hnHA960/wC3rT0l/wC+asnTrR2LNboSTkkjrSf2ZZ/8+0f5UAS21yl1CJY87T0yMVia5/yEov8AdH863YokhQJGoVR0ApktpBO4eWJXYDAJFAE1FFFAGXqOnSy3CXVqQJVxkE4ziqOp3F3LAi3VuIwrZDA8E10VRzQRXChZkV1HIBFAGNbzahJYJDb24CFcCQnqKvafpotbV0kIZ5B8xFXY41iQIihVUYAHanUAc5azPo968c6kxt1x39CKv3OuwLCfIJdzwMjAFX5reK5G2aMOB6ioU0uzjYMsC5HTJJ/nQBS0K0dd9zICN4wue/v+NW9Y/wCQZL+H86u0yWJJkKSKGU9QaAKOg/8AIP8A+Bmma5aNPAssYJaPOQPStCKGOBNkKKi9cAVJQBj2Otw/Z1S4JV1GM4yDVW/vDqk8cFsrFQeMjqfX6CtiXTLSZyzwLuPUjjP5VJBaw2wIgjVM9SByaAHW8QggSIdEUDNSUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQB/9k=')
const fileInput = ref(null)
const filterModal = ref(false);

const fioFilter = ref(null)
const loginFilter = ref(null)
const phoneFilter = ref(null)
const emailFilter = ref(null)
const organizationFilter = ref(null)
const groupFilter = ref(null)
const showModalDialog = ref(null)


const users = ref([])
const organizations = ref([])
const groups = ref([])
const paginations = ref([])
const count = ref(0)
const selectedBlock = ref("По группам")

const filterForm = ref({
  name: null,
  email: null,
  phone: null,
  login: null,
  organization_id: null,
  deleted: null
})


const groupBy = ref([
  {
    key: "name",
    order: "asc",
  },
])

const headers = ref([
  {title: '№', key: 'id'},
  {title: 'Статус', key: 'deleted_at'},
  {title: 'ФИО', key: 'name'},
])

const headersGroup = ref([
  {title: 'Статус', key: 'deleted_at'},
  {title: '', key: 'name', sortable: false},
])

const rules = {
  required: v => !!v,
  email: (v) => /.+@.+\..+/.test(v),
  phone: (v) => v.length === 13,
  password: (v) => v.length >= 6,
}

const isOrganizationFieldDisabled = computed(() => {
  return !createAccess('organization') && !updateAccess('organization');
});

const getGroups = async ({page, itemsPerPage, sortBy, search} = {}) => {
  count.value = 0;
  countFilter()
  loading.value = true
  try {
    const {data} = await userGroup.get({page, itemsPerPage, sortBy}, search, filterForm.value);
    groups.value = data.result.data
    paginations.value = data.result.pagination
    groupIdRef.value = 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const isDataChanged = () => {
  const item = groups.value

  return fioRef.value !== item.name ||
      emailRef.value !== item.email ||
      loginRef.value !== item.login ||
      statusRef.value !== item.status
}


function countFilter() {
  for (const key in filterForm.value) {
    if (filterForm.value[key] !== null) {
      count.value++
    }
  }
  return count
}

const checkAndClose = () => {
  if (fioRef.value || emailRef.value || phoneRef.value || loginRef.value || passwordRef.value || imageRef.value) {
    showModal.value = true;
  } else {
    dialog.value = false;
    showModal.value = false;
  }
}

watch(isCreateGroup, newVal => {
  if (!newVal) {
    isEditGroup.value = false
  }
})

const closeDialogWithoutSaving = () => {
  dialog.value = false;
  showModal.value = false
  showConfirmDialog.value = false;
  cleanForm();
}

const checkUpdate = () => {
  if (isDataChanged()) {
    showModal.value = true;
  } else {
    dialog.value = false;
  }
}

const closingWithSaving = async () => {
  if (isExistsUser.value) {
    await update({page: 1, itemsPerPage: 10, sortBy: 'id', search: null});
    showModal.value = false
  } else {
    const isValid = validate(
        fioRef,
        organization,
        loginRef,
        passwordRef,
        phoneRef,
        emailRef,
        group
    );
    showModal.value = false
    if (isValid === true) {
      await addUser();
      dialog.value = false;
      showModal.value = false;
      showConfirmDialog.value = false;
      cleanForm();
    }
  }
};

const cleanForm = () => {
  fioRef.value = null
  statusRef.value = null
  loginRef.value = null
  passwordRef.value = null
  phoneRef.value = null
  emailRef.value = null
  imageRef.value = null
  imagePreview.value = null
}

const getOrganization = async () => {
  try {
    const {data} = await organizationApi.get({page: 1, itemsPerPage: 100000})
    organizations.value = data.result.data.map(item => ({
      id: item.id,
      name: item.name
    }))
  } catch (e) {
    console.error(e)
  }
}

const onPickFile = () => {
  fileInput.value.click()
}

const selectAvatar = event => {
  const files = event.target.files
  imageRef.value = files[0]
  let filename = files[0].name
  if (filename.lastIndexOf('.') <= 0) {
    return showToast('Пожалуйста, добавьте заново!')
  }
  const fileReader = new FileReader()
  fileReader.addEventListener('load', () => {
    imagePreview.value = fileReader.result
  })
  fileReader.readAsDataURL(files[0])
}

const addUser = async () => {
  if (validate(fioRef, organization, loginRef, passwordRef, phoneRef, emailRef, group) !== true) return

  let organizationValue;
  if (typeof organization.value === 'object') {
    organizationValue = organization.value.id
  } else {
    organizationValue = organization.value
  }

  let groupValue;
  if (typeof group.value === 'object') {
    groupValue = group.value.id
  } else {
    groupValue = group.value
  }

  const formData = new FormData()
  formData.append('name', fioRef.value);
  formData.append('organization_id', organizationValue)
  formData.append('login', loginRef.value);
  formData.append('password', passwordRef.value);
  formData.append('phone', phoneRef.value);
  formData.append('email', emailRef.value);
  formData.append('group_id', groupValue);

  if (imageRef.value !== null) {
    formData.append('image', imageRef.value);
  }

  try {
    const res = await user.add(formData)

    if (res.status === 201) {
      await getGroups()
      showToast(addMessage)
      idUser.value = res.data.result.id
      dialog.value = false

      markedItem.value = []
    }
  } catch (e) {
    if (e.response.data.errors.email) {
      showToast(e.response.data.errors.email[0], "warning")
      return
    }
    if (e.response.data.errors.login) {
      showToast(e.response.data.errors.login[0], "warning")
      return
    }
    if (e.response.data.errors.phone) {
      showToast(e.response.data.errors.phone[0], "warning")
      return
    }
    if (e.response.data.errors.group_id) {
      showToast(e.response.data.errors.group_id[0], "warning")
    }
  } finally {
    markedID.value = []
  }
}

const update = async () => {
  if (validate(fioRef, organization, loginRef, passwordRef, phoneRef, emailRef, group) !== true) return

  let organizationValue
  if (typeof organization.value === 'object') {
    organizationValue = organization.value.id
  } else {
    organizationValue = organization.value
  }

  let groupValue;
  if (typeof group.value === 'object') {
    groupValue = group.value.id
  } else {
    groupValue = group.value
  }

  const formData = new FormData()
  formData.append('name', fioRef.value)
  formData.append('organization_id', organizationValue)
  formData.append('login', loginRef.value)
  formData.append('phone', phoneRef.value)
  formData.append('email', emailRef.value)
  formData.append('group_id', groupValue)
  formData.append('status', statusRef.value === 1 || statusRef.value ? 1 : 0)

  if (imageRef.value !== null) {
    formData.append('image', imageRef.value)
  }

  try {
    const response = await user.update(idUser.value, formData)
    cleanForm()
    if (response.status === 200) {
      dialog.value = null
      await getGroups()
      showToast(editMessage)
    }
  } catch (e) {
    console.error(e)
  } finally {
    markedID.value = []
  }
}

const remove = async () => {
  try {
    const {status} = await user.remove({ids: markedID.value})

    if (status === 200) {
      showToast(removeMessage, 'red')
      await getGroups()
      dialog.value = false
    }
  } catch (e) {
    console.error(e)
  } finally {
    markedID.value = []
  }
}

const restore = async () => {
  try {
    const {status} = await user.restore({ids: markedID.value})

    if (status === 200) {
      showToast(restoreMessage)
      await getGroups()
      dialog.value = false
    }
  } catch (e) {
    console.error(e)
  } finally {
    markedID.value = []
  }
}

const closeFilterModal = async ({
      page,
      itemsPerPage,
      sortBy,
      search,
      filterData,
    } = {}) => {
  filterModal.value = false;
  await getGroups({page, itemsPerPage, sortBy, search, filterData});
  fioFilter.value = null;
  organizationFilter.value = null;
  loginFilter.value = null;
  phoneFilter.value = null;
  emailFilter.value = null;
  groupFilter.value = null;
};


const openDialog = item => {
  dialog.value = true
  if (groupIdRef.value !== 0) {
    const groupValue = groups.value.find(item => item.id === groupIdRef.value)
    group.value = {
      id: groupValue.id,
      name: groupValue.name
    }
  }

  if (item === 0) {
    idUser.value = 0
    isExistsUser.value = false
  } else {
    idUser.value = item.id
    markedID.value.push(item.id);
    isExistsUser.value = true
    fioRef.value = item.name
    loginRef.value = item.login
    phoneRef.value = item.phone
    passwordRef.value = '#########'
    statusRef.value = item.status

    if (item.group) {
      group.value = {
        id: item.group.id,
        name: item.group.name
      }
    }

    organization.value = {
      "id": item.organization.id,
      "name": item.organization.name
    }

    if (item.image !== null) {
      imagePreview.value = import.meta.env.VITE_IMG_URL + item.image
    } else {
      imagePreview.value = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/4QAuRXhpZgAATU0AKgAAAAgAAkAAAAMAAAABAAAAAEABAAEAAAABAAAAAAAAAAD/2wBDAAoHBwkHBgoJCAkLCwoMDxkQDw4ODx4WFxIZJCAmJSMgIyIoLTkwKCo2KyIjMkQyNjs9QEBAJjBGS0U+Sjk/QD3/2wBDAQsLCw8NDx0QEB09KSMpPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT3/wAARCAHaAdoDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD2WiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoqvc31va/66QBuyjqap/8ACQWv9yX/AL5H+NAGpRWX/wAJBa/3JvyH+NH/AAkFr/cm/If40AalFZf/AAkFr/cm/If40f8ACQWv9yb8h/jQBqUVnx63aSHBZo/d1xV8EOoZSCD0INAC0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFZ+q6h9jhCoR5r9PYetXJ5lt4Wkc4VRk1ydzcPdTtK/VjwPQUAREs5LMSWY8knOaWiigAooooAKKKKACrmmag1nMFYkwsfmU9vcVTooA7MEMAQcg9DS1j6Hfb0+zSH5lGUJ7j0/CtigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooACQASeAO9Y13roRilqobHV26fhT9dujHCtuhwZOWx6f/XrBoAuHWL0nPnY9gopP7Xvf+e5/IVUooAnuL64uUCTSllBzjGKgoooAKKsWdjLfPiMYQH5mPQf/AF637XS7e1wQu9/7zc//AKqAOeisribBjhcg98YqwNFvT/yzUfVhXTUUAcrJpN5HyYCf90g1WdGjO11ZW9CMV2dRywxToVlQOvoRQBx9Fa99oZQGS0ywHJQnn8Kx+RkHqOCDQAscjROHQlWByCO1W/7Xvf8AnufyFVKbQBd/te9/57n8hU0Ou3UZHmbJF7gjB/SszI9adQB1lnfRXse6M4YfeU9RViuRtLlrS5SVegOGHqK60EMAR0IoAWiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA5zXSf7QHsgxWdWjrv/IQ/wCACs6gAooooAKsWFk19OEGQi8s3oP8TVeuo0y0+yWiqR87fMx96ALMUSQRiONQqL0Ap9FQ3V1HaQmSU4A6Ad6AJqQuq8FgD7muYutXubkkBjFH2CnH5mqR55PJ96AO1BB5FFcdFcS25zDIyH2PFbenawJyIbnCyHhWHAb/AANAGtWTrGmiVDcQr+8A+YD+If41rUUAcTXU2FjBBax/u1ZmUFmIzmsTVbQWt2dowknzL6D1pbXWLi1hEYCOo6bu1AHRNawOpVoYyD22iuWvYRBeSxKcqrcd6ut4guSpAjiUnoQCazXdpHLMSWY5JPegBldfYkmxgJ/55r/KuQrrrD/jwg/3BQBYooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAOc13/kIf8AABWdWjrv/IQ/4AKzqACiiigCxp0Qmv4UPI3ZP4c11lc3oYB1IeyHFdJQAVy2qXZurxsH93Gdqj+tdNMxWF2HUKTXGUAOooooAKKKKAOn0q8N3ZgscyIdre/vV2sPw8x8ydexANblAGXr0QayWTvG36Hj/CufrqdVAOmT5/u5rlqACiiigBtddYf8eEH+4K5GuusP+PCD/cFAFiiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA5zXf+Qh/wAVnVo67/wAhD/gArOoAKKKKALujSeXqaZ6MCv8An8q6euNilMMySL1Rg1dhHIssSupyrDINACuoZCp6EYrjpYzFI8bfeUkGuyrG1nTTITcwrlh99R396AMSiiigAooqa0tJLyYRoOP4m/u0Aa3h+EiGWYj7x2j8P/11sVHDEtvCkSDCqMCpKAKWsSBNMl/2sKPzrmK2fEFwP3duD0+dv6f1rGoAKKKKAG111h/x4Qf7grka66w/48IP9wUAWKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigDnNd/5CH/AAAVnVo67/yEP+ACs6gAooooAK2dDvuPssh5H3Ce/tWNSAlCGUkEHII4xQB2tFZmm6styBFMQsvQE9GrToAoXWj290xcAxuf4l/wqg3h6XPyzqR7rit6igDHh8PICDPMzf7KjFakMMdvGEiQKo7CpKKACorm4S2gaWQ4UCi4uI7aMySsFUfrXNX9+99J3WNT8q/4+9AEFxM1zO8r/eY5+n/6qZRRQAUUUUANrrrD/jwg/wBwVyNddYf8eEH+4KALFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQBzmvAjUFPYoMVnV0Gt2ZngWZBl4+oHcVz9ABRRRQAUUUUAFX7XWLi2AVj5qDsx5/OqFFAHRRa7ayff3xn3GasDU7M/8vCfnXK0UAdRJq9nH/y2DH0UE1RuPEHBFtEf95/8KxaKAHzXEty++Zyzds9qZRRQAUUUUAFFFFADa6+yBFlAD1EY/lXNWFoby6WMA7AcufQf/XrrAAAAOgoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArLvNEjncvC3lOeSMcH/CtSigDnDoN2DwYiPXOKP7Cu/8Apl/31XR0UAc5/YV3/wBMv++qP7Cu/wDpl/31XR0UAc5/YV3/ANMv++qP7Cu/+mX/AH1XR0UAc5/YV3/0y/76o/sK7/6Zf99V0dFAHOf2Fd/9Mv8Avqj+wrv/AKZf99V0dFAHOf2Fd/8ATL/vqj+wrv8A6Zf99V0dFAHOf2Fd/wDTL/vqj+wrv/pl/wB9V0dFAHOf2Fd/9Mv++qlh8PykjzpVVfReTW9RQBDbWsVrGI4lwO59amoooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACsi2v7iTWGt2ZfKDNgY546Vr1y7STRaxM1su6QO2BjNAHR3LmO2ldfvKhI/KqOj3s16JTOwO0jGBiqct3qjROskBCFSGPl4wKl8OfduPqv9aAIW1O/kupIoCGIY4UKOgp/wBo1n/nkf8AvgVTjuJLbU5ZIU3uGYBcE9/arv8AbV9/z6D/AL4agCxcTaiLa3MSEyEHzBtHFUZdT1KFwkmEZhkAoOa34nLxIzDDMoJFYWuf8hKL/dH86ALNtNqrXMYmjIjJ+Y7QMCteiigCvdXsNkgaZsE9ABkmsq614ugFqGRgeS6g5FNukF14gWKTlBgYPpjP61Y12NI7OIIqqA/QDHagBLfxBF5arcK+/HzMAOa1IZo7iMSRMGU9CKp2VtFcaTCsiKcp1IrO0mVooL1QThU3D680AT3erzSXJt7FckHG7Gc/T296ikuNWtB5kvKd8gEfp0p/h2MHzpD94YUGttlDoVYZU8EGgClb35vbGSSAYmUH5fftWdJe6tDGXkTao6koOKTQyY9SljH3Sp/Q1p6x/wAgyX8P50AZkV9qtwm+Fd65xkIK0jeta6ak12D5pHK9CTTNB/5B/wDwM1S8QsTNCn8IUmgBEutUvsvbjagPGAMfr1p8Gr3FtP5N+vGcE4wR/iK2II1igRFGFVQBiszxDGpgikx8wbbn6/8A6qANfryKKq6Y5k06Bm67cflxVqgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArn7T/kYpP9566CoVtIEmMyxKJDyWA55oAW7/AOPOf/rm38qyvDn3Lj6r/Wth1V0KsAVIwQaZDbQ2+fJjVM9cDrQBz9tcpaatLLLu2hnHA960/wC3rT0l/wC+asnTrR2LNboSTkkjrSf2ZZ/8+0f5UAS21yl1CJY87T0yMVia5/yEov8AdH863YokhQJGoVR0ApktpBO4eWJXYDAJFAE1FFFAGXqOnSy3CXVqQJVxkE4ziqOp3F3LAi3VuIwrZDA8E10VRzQRXChZkV1HIBFAGNbzahJYJDb24CFcCQnqKvafpotbV0kIZ5B8xFXY41iQIihVUYAHanUAc5azPo968c6kxt1x39CKv3OuwLCfIJdzwMjAFX5reK5G2aMOB6ioU0uzjYMsC5HTJJ/nQBS0K0dd9zICN4wue/v+NW9Y/wCQZL+H86u0yWJJkKSKGU9QaAKOg/8AIP8A+Bmma5aNPAssYJaPOQPStCKGOBNkKKi9cAVJQBj2Otw/Z1S4JV1GM4yDVW/vDqk8cFsrFQeMjqfX6CtiXTLSZyzwLuPUjjP5VJBaw2wIgjVM9SByaAHW8QggSIdEUDNSUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQB/9k='
    }

    emailRef.value = item.email
    userDialogTitle.value = item.name
  }

}

const openGroupDialog = (item) => {
  isEditGroup.value = true
  isCreateGroup.value = true
  group.value = item.items[0].raw
}

const addBasedOnUser = () => {
  if (markedID.value.length === 0) return showToast(warningMessage, 'warning')
  if (markedID.value.length > 1) return showToast(selectOneItemMessage, 'warning')
  dialog.value = true
  groups.value.forEach(el => {
    group.value = {
      id: el.id,
      name: el.name
    }
   el.users.forEach(item => {
     if (markedID.value[0] === item.id) {
       fioRef.value = item.name
       loginRef.value = item.login
       phoneRef.value = item.phone
       statusRef.value = item.status
       emailRef.value = item.email

       organization.value = {
         ...item.organization
       }
     }
   })
  })

}
const compute = () => {
  if (markedID.value.length === 0) return showToast(warningMessage, 'warning')

  if (markedItem.value?.deleted_at) {
    return restore()
  } else {
    return remove()
  }
}

const lineMarking = item => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = users.value.find(el => el.id === markedID.value[0])

    if (firstMarkedItem && firstMarkedItem.deleted_at && item.deleted_at === null) {
      showToast(ErrorSelectMessage, 'warning')
      return
    }
    if (firstMarkedItem && firstMarkedItem.deleted_at === null && item.deleted_at !== null) {
      showToast(ErrorSelectMessage, 'warning')
      return
    }
  }

  const index = markedID.value.indexOf(item.id);
  if (index !== -1) {
    markedID.value.splice(index, 1);
  } else {
    if (item.id !== null) {
      markedID.value.push(item.id);
    }
  }
  markedItem.value = item;
  console.log(1)
}

const closeFilterDialog = () => {
  showModalDialog.value = false
  filterForm.value = {}
  getGroups()
}

const toggleGroup = async () => {
  isCreateGroup.value = false
  markedID.value = []
  await getGroups()
}

const deleteImage = async () => {
  const previewImage = imagePreview.value
  if (idUser.value === 0) {
    imagePreview.value = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/4QAuRXhpZgAATU0AKgAAAAgAAkAAAAMAAAABAAAAAEABAAEAAAABAAAAAAAAAAD/2wBDAAoHBwkHBgoJCAkLCwoMDxkQDw4ODx4WFxIZJCAmJSMgIyIoLTkwKCo2KyIjMkQyNjs9QEBAJjBGS0U+Sjk/QD3/2wBDAQsLCw8NDx0QEB09KSMpPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT3/wAARCAHaAdoDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD2WiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoqvc31va/66QBuyjqap/8ACQWv9yX/AL5H+NAGpRWX/wAJBa/3JvyH+NH/AAkFr/cm/If40AalFZf/AAkFr/cm/If40f8ACQWv9yb8h/jQBqUVnx63aSHBZo/d1xV8EOoZSCD0INAC0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFZ+q6h9jhCoR5r9PYetXJ5lt4Wkc4VRk1ydzcPdTtK/VjwPQUAREs5LMSWY8knOaWiigAooooAKKKKACrmmag1nMFYkwsfmU9vcVTooA7MEMAQcg9DS1j6Hfb0+zSH5lGUJ7j0/CtigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooACQASeAO9Y13roRilqobHV26fhT9dujHCtuhwZOWx6f/XrBoAuHWL0nPnY9gopP7Xvf+e5/IVUooAnuL64uUCTSllBzjGKgoooAKKsWdjLfPiMYQH5mPQf/AF637XS7e1wQu9/7zc//AKqAOeisribBjhcg98YqwNFvT/yzUfVhXTUUAcrJpN5HyYCf90g1WdGjO11ZW9CMV2dRywxToVlQOvoRQBx9Fa99oZQGS0ywHJQnn8Kx+RkHqOCDQAscjROHQlWByCO1W/7Xvf8AnufyFVKbQBd/te9/57n8hU0Ou3UZHmbJF7gjB/SszI9adQB1lnfRXse6M4YfeU9RViuRtLlrS5SVegOGHqK60EMAR0IoAWiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA5zXSf7QHsgxWdWjrv/IQ/wCACs6gAooooAKsWFk19OEGQi8s3oP8TVeuo0y0+yWiqR87fMx96ALMUSQRiONQqL0Ap9FQ3V1HaQmSU4A6Ad6AJqQuq8FgD7muYutXubkkBjFH2CnH5mqR55PJ96AO1BB5FFcdFcS25zDIyH2PFbenawJyIbnCyHhWHAb/AANAGtWTrGmiVDcQr+8A+YD+If41rUUAcTXU2FjBBax/u1ZmUFmIzmsTVbQWt2dowknzL6D1pbXWLi1hEYCOo6bu1AHRNawOpVoYyD22iuWvYRBeSxKcqrcd6ut4guSpAjiUnoQCazXdpHLMSWY5JPegBldfYkmxgJ/55r/KuQrrrD/jwg/3BQBYooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAOc13/kIf8AABWdWjrv/IQ/4AKzqACiiigCxp0Qmv4UPI3ZP4c11lc3oYB1IeyHFdJQAVy2qXZurxsH93Gdqj+tdNMxWF2HUKTXGUAOooooAKKKKAOn0q8N3ZgscyIdre/vV2sPw8x8ydexANblAGXr0QayWTvG36Hj/CufrqdVAOmT5/u5rlqACiiigBtddYf8eEH+4K5GuusP+PCD/cFAFiiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA5zXf+Qh/wAVnVo67/wAhD/gArOoAKKKKALujSeXqaZ6MCv8An8q6euNilMMySL1Rg1dhHIssSupyrDINACuoZCp6EYrjpYzFI8bfeUkGuyrG1nTTITcwrlh99R396AMSiiigAooqa0tJLyYRoOP4m/u0Aa3h+EiGWYj7x2j8P/11sVHDEtvCkSDCqMCpKAKWsSBNMl/2sKPzrmK2fEFwP3duD0+dv6f1rGoAKKKKAG111h/x4Qf7grka66w/48IP9wUAWKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigDnNd/5CH/AAAVnVo67/yEP+ACs6gAooooAK2dDvuPssh5H3Ce/tWNSAlCGUkEHII4xQB2tFZmm6styBFMQsvQE9GrToAoXWj290xcAxuf4l/wqg3h6XPyzqR7rit6igDHh8PICDPMzf7KjFakMMdvGEiQKo7CpKKACorm4S2gaWQ4UCi4uI7aMySsFUfrXNX9+99J3WNT8q/4+9AEFxM1zO8r/eY5+n/6qZRRQAUUUUANrrrD/jwg/wBwVyNddYf8eEH+4KALFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQBzmvAjUFPYoMVnV0Gt2ZngWZBl4+oHcVz9ABRRRQAUUUUAFX7XWLi2AVj5qDsx5/OqFFAHRRa7ayff3xn3GasDU7M/8vCfnXK0UAdRJq9nH/y2DH0UE1RuPEHBFtEf95/8KxaKAHzXEty++Zyzds9qZRRQAUUUUAFFFFADa6+yBFlAD1EY/lXNWFoby6WMA7AcufQf/XrrAAAAOgoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArLvNEjncvC3lOeSMcH/CtSigDnDoN2DwYiPXOKP7Cu/8Apl/31XR0UAc5/YV3/wBMv++qP7Cu/wDpl/31XR0UAc5/YV3/ANMv++qP7Cu/+mX/AH1XR0UAc5/YV3/0y/76o/sK7/6Zf99V0dFAHOf2Fd/9Mv8Avqj+wrv/AKZf99V0dFAHOf2Fd/8ATL/vqj+wrv8A6Zf99V0dFAHOf2Fd/wDTL/vqj+wrv/pl/wB9V0dFAHOf2Fd/9Mv++qlh8PykjzpVVfReTW9RQBDbWsVrGI4lwO59amoooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACsi2v7iTWGt2ZfKDNgY546Vr1y7STRaxM1su6QO2BjNAHR3LmO2ldfvKhI/KqOj3s16JTOwO0jGBiqct3qjROskBCFSGPl4wKl8OfduPqv9aAIW1O/kupIoCGIY4UKOgp/wBo1n/nkf8AvgVTjuJLbU5ZIU3uGYBcE9/arv8AbV9/z6D/AL4agCxcTaiLa3MSEyEHzBtHFUZdT1KFwkmEZhkAoOa34nLxIzDDMoJFYWuf8hKL/dH86ALNtNqrXMYmjIjJ+Y7QMCteiigCvdXsNkgaZsE9ABkmsq614ugFqGRgeS6g5FNukF14gWKTlBgYPpjP61Y12NI7OIIqqA/QDHagBLfxBF5arcK+/HzMAOa1IZo7iMSRMGU9CKp2VtFcaTCsiKcp1IrO0mVooL1QThU3D680AT3erzSXJt7FckHG7Gc/T296ikuNWtB5kvKd8gEfp0p/h2MHzpD94YUGttlDoVYZU8EGgClb35vbGSSAYmUH5fftWdJe6tDGXkTao6koOKTQyY9SljH3Sp/Q1p6x/wAgyX8P50AZkV9qtwm+Fd65xkIK0jeta6ak12D5pHK9CTTNB/5B/wDwM1S8QsTNCn8IUmgBEutUvsvbjagPGAMfr1p8Gr3FtP5N+vGcE4wR/iK2II1igRFGFVQBiszxDGpgikx8wbbn6/8A6qANfryKKq6Y5k06Bm67cflxVqgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArn7T/kYpP9566CoVtIEmMyxKJDyWA55oAW7/AOPOf/rm38qyvDn3Lj6r/Wth1V0KsAVIwQaZDbQ2+fJjVM9cDrQBz9tcpaatLLLu2hnHA960/wC3rT0l/wC+asnTrR2LNboSTkkjrSf2ZZ/8+0f5UAS21yl1CJY87T0yMVia5/yEov8AdH863YokhQJGoVR0ApktpBO4eWJXYDAJFAE1FFFAGXqOnSy3CXVqQJVxkE4ziqOp3F3LAi3VuIwrZDA8E10VRzQRXChZkV1HIBFAGNbzahJYJDb24CFcCQnqKvafpotbV0kIZ5B8xFXY41iQIihVUYAHanUAc5azPo968c6kxt1x39CKv3OuwLCfIJdzwMjAFX5reK5G2aMOB6ioU0uzjYMsC5HTJJ/nQBS0K0dd9zICN4wue/v+NW9Y/wCQZL+H86u0yWJJkKSKGU9QaAKOg/8AIP8A+Bmma5aNPAssYJaPOQPStCKGOBNkKKi9cAVJQBj2Otw/Z1S4JV1GM4yDVW/vDqk8cFsrFQeMjqfX6CtiXTLSZyzwLuPUjjP5VJBaw2wIgjVM9SByaAHW8QggSIdEUDNSUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQB/9k='
    imageRef.value = null
    return
  }

  const userVal = users.value.find(item => item.id === idUser.value)
  userVal.image = null

  try {
    await user.deleteImage(idUser.value)
  } catch (e) {
    console.log(e)
  } finally {
    imagePreview.value = previewImage
    imageRef.value = null
  }
}

const isImage = computed(() => {
  const previewImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/4QAuRXhpZgAATU0AKgAAAAgAAkAAAAMAAAABAAAAAEABAAEAAAABAAAAAAAAAAD/2wBDAAoHBwkHBgoJCAkLCwoMDxkQDw4ODx4WFxIZJCAmJSMgIyIoLTkwKCo2KyIjMkQyNjs9QEBAJjBGS0U+Sjk/QD3/2wBDAQsLCw8NDx0QEB09KSMpPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT3/wAARCAHaAdoDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD2WiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoqvc31va/66QBuyjqap/8ACQWv9yX/AL5H+NAGpRWX/wAJBa/3JvyH+NH/AAkFr/cm/If40AalFZf/AAkFr/cm/If40f8ACQWv9yb8h/jQBqUVnx63aSHBZo/d1xV8EOoZSCD0INAC0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFZ+q6h9jhCoR5r9PYetXJ5lt4Wkc4VRk1ydzcPdTtK/VjwPQUAREs5LMSWY8knOaWiigAooooAKKKKACrmmag1nMFYkwsfmU9vcVTooA7MEMAQcg9DS1j6Hfb0+zSH5lGUJ7j0/CtigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooACQASeAO9Y13roRilqobHV26fhT9dujHCtuhwZOWx6f/XrBoAuHWL0nPnY9gopP7Xvf+e5/IVUooAnuL64uUCTSllBzjGKgoooAKKsWdjLfPiMYQH5mPQf/AF637XS7e1wQu9/7zc//AKqAOeisribBjhcg98YqwNFvT/yzUfVhXTUUAcrJpN5HyYCf90g1WdGjO11ZW9CMV2dRywxToVlQOvoRQBx9Fa99oZQGS0ywHJQnn8Kx+RkHqOCDQAscjROHQlWByCO1W/7Xvf8AnufyFVKbQBd/te9/57n8hU0Ou3UZHmbJF7gjB/SszI9adQB1lnfRXse6M4YfeU9RViuRtLlrS5SVegOGHqK60EMAR0IoAWiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA5zXSf7QHsgxWdWjrv/IQ/wCACs6gAooooAKsWFk19OEGQi8s3oP8TVeuo0y0+yWiqR87fMx96ALMUSQRiONQqL0Ap9FQ3V1HaQmSU4A6Ad6AJqQuq8FgD7muYutXubkkBjFH2CnH5mqR55PJ96AO1BB5FFcdFcS25zDIyH2PFbenawJyIbnCyHhWHAb/AANAGtWTrGmiVDcQr+8A+YD+If41rUUAcTXU2FjBBax/u1ZmUFmIzmsTVbQWt2dowknzL6D1pbXWLi1hEYCOo6bu1AHRNawOpVoYyD22iuWvYRBeSxKcqrcd6ut4guSpAjiUnoQCazXdpHLMSWY5JPegBldfYkmxgJ/55r/KuQrrrD/jwg/3BQBYooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAOc13/kIf8AABWdWjrv/IQ/4AKzqACiiigCxp0Qmv4UPI3ZP4c11lc3oYB1IeyHFdJQAVy2qXZurxsH93Gdqj+tdNMxWF2HUKTXGUAOooooAKKKKAOn0q8N3ZgscyIdre/vV2sPw8x8ydexANblAGXr0QayWTvG36Hj/CufrqdVAOmT5/u5rlqACiiigBtddYf8eEH+4K5GuusP+PCD/cFAFiiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA5zXf+Qh/wAVnVo67/wAhD/gArOoAKKKKALujSeXqaZ6MCv8An8q6euNilMMySL1Rg1dhHIssSupyrDINACuoZCp6EYrjpYzFI8bfeUkGuyrG1nTTITcwrlh99R396AMSiiigAooqa0tJLyYRoOP4m/u0Aa3h+EiGWYj7x2j8P/11sVHDEtvCkSDCqMCpKAKWsSBNMl/2sKPzrmK2fEFwP3duD0+dv6f1rGoAKKKKAG111h/x4Qf7grka66w/48IP9wUAWKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigDnNd/5CH/AAAVnVo67/yEP+ACs6gAooooAK2dDvuPssh5H3Ce/tWNSAlCGUkEHII4xQB2tFZmm6styBFMQsvQE9GrToAoXWj290xcAxuf4l/wqg3h6XPyzqR7rit6igDHh8PICDPMzf7KjFakMMdvGEiQKo7CpKKACorm4S2gaWQ4UCi4uI7aMySsFUfrXNX9+99J3WNT8q/4+9AEFxM1zO8r/eY5+n/6qZRRQAUUUUANrrrD/jwg/wBwVyNddYf8eEH+4KALFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQBzmvAjUFPYoMVnV0Gt2ZngWZBl4+oHcVz9ABRRRQAUUUUAFX7XWLi2AVj5qDsx5/OqFFAHRRa7ayff3xn3GasDU7M/8vCfnXK0UAdRJq9nH/y2DH0UE1RuPEHBFtEf95/8KxaKAHzXEty++Zyzds9qZRRQAUUUUAFFFFADa6+yBFlAD1EY/lXNWFoby6WMA7AcufQf/XrrAAAAOgoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArLvNEjncvC3lOeSMcH/CtSigDnDoN2DwYiPXOKP7Cu/8Apl/31XR0UAc5/YV3/wBMv++qP7Cu/wDpl/31XR0UAc5/YV3/ANMv++qP7Cu/+mX/AH1XR0UAc5/YV3/0y/76o/sK7/6Zf99V0dFAHOf2Fd/9Mv8Avqj+wrv/AKZf99V0dFAHOf2Fd/8ATL/vqj+wrv8A6Zf99V0dFAHOf2Fd/wDTL/vqj+wrv/pl/wB9V0dFAHOf2Fd/9Mv++qlh8PykjzpVVfReTW9RQBDbWsVrGI4lwO59amoooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACsi2v7iTWGt2ZfKDNgY546Vr1y7STRaxM1su6QO2BjNAHR3LmO2ldfvKhI/KqOj3s16JTOwO0jGBiqct3qjROskBCFSGPl4wKl8OfduPqv9aAIW1O/kupIoCGIY4UKOgp/wBo1n/nkf8AvgVTjuJLbU5ZIU3uGYBcE9/arv8AbV9/z6D/AL4agCxcTaiLa3MSEyEHzBtHFUZdT1KFwkmEZhkAoOa34nLxIzDDMoJFYWuf8hKL/dH86ALNtNqrXMYmjIjJ+Y7QMCteiigCvdXsNkgaZsE9ABkmsq614ugFqGRgeS6g5FNukF14gWKTlBgYPpjP61Y12NI7OIIqqA/QDHagBLfxBF5arcK+/HzMAOa1IZo7iMSRMGU9CKp2VtFcaTCsiKcp1IrO0mVooL1QThU3D680AT3erzSXJt7FckHG7Gc/T296ikuNWtB5kvKd8gEfp0p/h2MHzpD94YUGttlDoVYZU8EGgClb35vbGSSAYmUH5fftWdJe6tDGXkTao6koOKTQyY9SljH3Sp/Q1p6x/wAgyX8P50AZkV9qtwm+Fd65xkIK0jeta6ak12D5pHK9CTTNB/5B/wDwM1S8QsTNCn8IUmgBEutUvsvbjagPGAMfr1p8Gr3FtP5N+vGcE4wR/iK2II1igRFGFVQBiszxDGpgikx8wbbn6/8A6qANfryKKq6Y5k06Bm67cflxVqgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArn7T/kYpP9566CoVtIEmMyxKJDyWA55oAW7/AOPOf/rm38qyvDn3Lj6r/Wth1V0KsAVIwQaZDbQ2+fJjVM9cDrQBz9tcpaatLLLu2hnHA960/wC3rT0l/wC+asnTrR2LNboSTkkjrSf2ZZ/8+0f5UAS21yl1CJY87T0yMVia5/yEov8AdH863YokhQJGoVR0ApktpBO4eWJXYDAJFAE1FFFAGXqOnSy3CXVqQJVxkE4ziqOp3F3LAi3VuIwrZDA8E10VRzQRXChZkV1HIBFAGNbzahJYJDb24CFcCQnqKvafpotbV0kIZ5B8xFXY41iQIihVUYAHanUAc5azPo968c6kxt1x39CKv3OuwLCfIJdzwMjAFX5reK5G2aMOB6ioU0uzjYMsC5HTJJ/nQBS0K0dd9zICN4wue/v+NW9Y/wCQZL+H86u0yWJJkKSKGU9QaAKOg/8AIP8A+Bmma5aNPAssYJaPOQPStCKGOBNkKKi9cAVJQBj2Otw/Z1S4JV1GM4yDVW/vDqk8cFsrFQeMjqfX6CtiXTLSZyzwLuPUjjP5VJBaw2wIgjVM9SByaAHW8QggSIdEUDNSUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQB/9k='

  if (typeof imageRef.value === 'string' && typeof imagePreview.value === 'string' || imagePreview.value === previewImage) {
    return true
  }

  if (imageRef.value === null && imagePreview.value === null) {
    return true
  }
})

const selectBlock = name => {
  closeFilterModal();
  selectedBlock.value = name;
  loading.value = false;
};

const isGroupChecked = item => {
  return item.items[0].raw.users.every(item => markedID.value.includes(item.id))
}

const toggleGroupSelection = group => {
  const users = group.items[0].raw.users
  if (users.length === 0) return

  markedItem.value = users[0]

  const allIds = users.map(item => item.id);
  if (isGroupChecked(group)) {
    markedID.value = markedID.value.filter(id => !allIds.includes(id));
  } else {
    // Add all IDs of the group
    markedID.value = [...new Set([...markedID.value, ...allIds])];
  }
}


watch(dialog, newVal => {
  if (!newVal) {
    fioRef.value = null
    organization.value = null
    passwordRef.value = null
    imagePreview.value = null
    loginRef.value = null
    phoneRef.value = null
    emailRef.value = null
    isExistsUser.value = false
  } else {
    markedID.value = [markedID.value[markedID.value.length - 1]];
  }
})

watch(isCreateGroup, newVal => {
  if (!newVal) {
    isCreateGroup.value = false
  }
})

onMounted(async () => {
  await getOrganization()
})

</script>

<template>
  <div class="pa-3">
    <div class="d-flex justify-space-between calcWidth">
      <div class="d-flex align-center ga-2 pe-2 ms-4">
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">Пользователи</span>
      </div>
      <div class="d-flex align-center ga-2">
        <div class="d-flex ga-4 mb-1">
          <div class="switcher">
            <button
                @click="selectBlock('По группам')"
                :class="{'active': selectedBlock === 'По группам'}"
                class="button"
            >
              По группам
            </button>
            <button
                @click="selectBlock('По элементам')"
                :class="{'active': selectedBlock === 'По элементам'}"
                class="button"
            >
              По элементам
            </button>
          </div>
        </div>
        <div class="d-flex w-100">
          <div class="d-flex ga-2 mb-1 me-3">
            <Button name="group" @click="isCreateGroup = true" v-if="createAccess('user')"/>
            <Button name="create" v-if="createAccess('user')" @click="openDialog(0)"/>
            <Button name="copy" v-if="createAccess('user')" @click="addBasedOnUser"/>
            <Button name="delete" v-if="removeAccess('user')" @click="compute"/>
            <Button name="excel" @click="getExcel(user)"/>
          </div>
          <v-text-field
              class="custom_search"
              style="width: 190px;"
              v-model="search"
              prepend-inner-icon="search"
              density="compact"
              label="Поиск..."
              variant="outlined"
              :color="BASE_COLOR"
              :base-color="FIELD_OF_SEARCH"
              rounded="lg"
              clear-icon="close"
              hide-details
              single-line
              clearable
              flat
          ></v-text-field>
        </div>
        <div class="filterElement">
          <Icons
              name="filter"
              title="фильтр"
              @click="useFilterCanvasVisible().toggleFilterCanvas()"
              class="mt-1"
          />

          <span v-if="count !== 0" class="countFilter">{{ count }}</span>
        </div>
      </div>
    </div>
    <div class="mt-2 table calcWidth">
      <v-data-table-server
          style="height: calc(100vh - 150px);"
          items-per-page-text="Элементов на странице:"
          loading-text="Загрузка"
          no-data-text="Нет данных"
          v-model:items-per-page="paginations.per_page"
          :loading="loading"
          :headers="selectedBlock === 'По группам' ? headersGroup : headers"
          :items-length="paginations.total || 0"
          :items="groups"
          :group-by="selectedBlock === 'По группам' ? groupBy : []"
          @update:options="getGroups"
          :search="search"
          page-text='{0}-{1} от {2}'
          :items-per-page-options="[
            {value: 25, title: '25'},
            {value: 50, title: '50'},
            {value: 100, title: '100'},
           ]"
          fixed-header
          hover
      >
        <template v-slot:group-header="{ item, toggleGroup, isGroupOpen, index }">
          <tr style="background-color: rgba(122, 127, 176, 0.193)" @dblclick="openGroupDialog(item)">
            <td style="width: 350px;">
              <div class="d-flex align-center">
                <CustomCheckbox
                    v-if="isGroupOpen(item)"
                    v-model="markedID"
                    :checked="isGroupChecked(item)"
                    @change="toggleGroupSelection(item)"
                >
                </CustomCheckbox>
                <VBtn
                    :icon="isGroupOpen(item) ? '$expand' : '$next'"
                    size="small"
                    variant="text"
                    @click="toggleGroup(item)"

                ></VBtn>
                <span>{{ item.value }}</span>
              </div>
            </td>
            <td style="width: 390px;">
              <v-chip
                  v-if="item.items[0].raw.deleted_at"
                  style="height: 50px; width: 200px;"
                  class="d-flex justify-center"
                  :color="getListColor(item.items[0].raw.deleted_at)"
              >
              <span class="padding: 5px;">{{
                  getListStatus(item.items[0].raw.deleted_at)
                }}</span>
              </v-chip>
            </td>
            <td></td>
          </tr>
        </template>
        <template v-slot:item="{ item, index }">
          <tr
            v-if="item.users.length !== 0"
            v-for="user in item.users" :key="user.id"
            :class="{'bg-grey-lighten-2': item.id === groupIdRef }"
            @mouseenter="hoveredRowIndex = index + 100000"
            @mouseleave="hoveredRowIndex = null"
            @dblclick="openDialog(user)"
          >
            <td style="width: 350px;">
              <div class="d-flex align-center ga-2">
                <CustomCheckbox
                    v-model="markedID"
                    :checked="markedID.includes(user.id)"
                    @change="lineMarking(user)"
                >
                </CustomCheckbox>
                {{ user?.id }}
              </div>
            </td>
            <td style="width: 390px;">
              <v-chip
                  style="height: 50px; width: 200px;"
                  class="d-flex justify-center"
                  :color="getListColor(user?.deleted_at)"
              >
              <span class="padding: 5px;">{{
                  getListStatus(user?.deleted_at)
                }}</span>
              </v-chip>
            </td>
            <td>{{ user?.name }}</td>
          </tr>
          <tr v-else-if="selectedBlock === 'По группам'">
            <td></td>
            <td>Нету данных!</td>
            <td></td>
          </tr>
        </template>
      </v-data-table-server>
    </div>

    <!-- Modal -->
    <v-card>
      <v-dialog persistent class="mt-2 pa-2" v-model="dialog"
                @keyup.esc="isExistsUser ? checkUpdate() : checkAndClose()">
        <v-card :style="`border: 2px solid ${BASE_COLOR}`" min-width="600"
                class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
          <div class="d-flex justify-space-between align-center mb-2">
            <span>{{ isExistsUser ? 'Пользователь: ' + userDialogTitle : 'Добавление' }}</span>
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex ga-3 align-center mt-2 me-4">
                <span v-show="isExistsUser" class="mt-1 ms-2 text-blue-darken-4 cursor-pointer"
                      @click="$router.push({name: 'userAccess',params: {id: idUser}})">Доступ</span>
                <Icons v-if="removeAccess('user') && isExistsUser" @click="compute" name="delete"/>
                <Icons title="Сохранить" v-if="createAccess('user') && !isExistsUser" @click="addUser" name="save"/>
                <div v-if="updateAccess('user') && isExistsUser" @click="update">
                  <Icons title="Сохранить" name="save"/>
                </div>
              </div>
              <v-btn
                  @click="isExistsUser ? checkUpdate() : checkAndClose()"
                  variant="text"
                  :size="32"
                  class="pt-2 pl-1"
              >
                <Icons name="close" title="Закрыть"/>
              </v-btn>
            </div>
          </div>
          <v-form class="d-flex w-100" :disabled="!updateAccess('user') && isExistsUser" @submit.prevent="addUser">
            <v-row class="w-100">
              <v-col class="d-flex flex-column w-100">
                <div class="d-flex" :style="isExistsUser ?? { width: '98%' }">
                  <v-text-field
                      v-model="fioRef"
                      :rules="[rules.required]"
                      :color="BASE_COLOR"
                      :base-color="FIELD_COLOR"
                      variant="outlined"
                      class="w-auto text-sm-body-1"
                      density="compact"
                      placeholder="Иван Иванов Иванович"
                      label="ФИО"
                      rounded="lg"
                      autofocus
                      clear-icon="close"
                      :append-inner-icon="fioRef ? 'close' : ''"
                      @click:append-inner="fioRef = null"
                  />
                  <div class="mt-2 ms-4" v-if="isExistsUser">
                    <CustomCheckbox @change="statusRef = !statusRef" :checked="statusRef">
                      <span>Активный</span>
                    </CustomCheckbox>
                  </div>
                </div>
                <div class="d-flex w-100 ga-4">
                  <div class="border d-flex justify-center align-center position-relative" style="width: 70%;">
                      <span v-if="!isImage" class="position-absolute" style="top: -12px; right: -8px"
                            @click="deleteImage">
                          <span class="border px-1 bg-red-darken-2 text-white rounded-circle cursor-pointer"
                                style="font-size: 12px;">x</span>
                      </span>
                    <input
                        accept="image/*"
                        type="file"
                        @change="selectAvatar"
                        style="display: none;"
                        ref="fileInput"
                    />
                    <div v-if="imagePreview === null">
                      <v-btn @click="onPickFile">Загрузить фото</v-btn>
                    </div>
                    <img v-else @click="onPickFile" class="cursor-pointer" :src="imagePreview" width="150" height="150"
                         alt="">
                  </div>
                  <div class="w-100">
                    <v-autocomplete
                        v-model="organization"
                        :items="organizations"
                        :color="BASE_COLOR"
                        :disabled="isOrganizationFieldDisabled"
                        :base-color="FIELD_COLOR"
                        item-title="name"
                        item-value="id"
                        rounded="lg"
                        :rules="[rules.required]"
                        variant="outlined"
                        label="Организация"
                    />
                    <v-text-field
                        v-model="loginRef"
                        :rules="[rules.required]"
                        :color="BASE_COLOR"
                        :base-color="FIELD_COLOR"
                        variant="outlined"
                        class="w-auto text-sm-body-1"
                        density="compact"
                        placeholder="Ivan"
                        label="Логин"
                        rounded="lg"
                        v-mask="'XXXXXXXXXXXXXXXXXXX'"
                        clear-icon="close"
                        :append-inner-icon="loginRef ? 'close' : ''"
                        @click:append-inner="loginRef = null"
                    />
                    <div class="d-flex">
                      <v-text-field
                          v-model="passwordRef"
                          :rules="[rules.required, rules.password]"
                          :color="BASE_COLOR"
                          :base-color="FIELD_COLOR"
                          type="password"
                          variant="outlined"
                          class="w-auto text-sm-body-1"
                          density="compact"
                          placeholder="********"
                          label="Пароль"
                          rounded="lg"
                          autocomplete="on"
                          :disabled="passwordRef === '#########'"
                          clear-icon="close"
                          :append-inner-icon="passwordRef ? 'close' : ''"
                          @click:append-inner="passwordRef = null"
                          hide-details
                      />
                      <span v-show="isExistsUser" class="mt-1 ms-2 text-blue-darken-4 cursor-pointer"
                            @click="isDialogPassword = true">Изменить пароль</span>
                    </div>
                  </div>
                </div>
                <div :class="isExistsUser ? 'mt-2' : 'mt-5'">
                  <v-autocomplete
                      v-model="group"
                      :items="groups"
                      :color="BASE_COLOR"
                      :base-color="FIELD_COLOR"
                      item-title="name"
                      item-value="id"
                      rounded="lg"
                      :rules="[rules.required]"
                      variant="outlined"
                      label="Группа"
                      hide-details
                  />
                </div>
                <div class="d-flex ga-4 mt-5">
                  <v-text-field
                      v-model="phoneRef"
                      :rules="[rules.required, rules.phone]"
                      :color="BASE_COLOR"
                      :base-color="FIELD_COLOR"
                      variant="outlined"
                      class="w-auto text-sm-body-1"
                      density="compact"
                      type="tel"
                      rounded="lg"
                      placeholder="+992119111881"
                      label="Номер телефона"
                      v-mask="'+############'"
                      clear-icon="close"
                      :append-inner-icon="phoneRef ? 'close' : ''"
                      @click:append-inner="phoneRef = null"
                      hide-details
                  />
                  <v-text-field
                      v-model="emailRef"
                      @input="englishSymbols"
                      :rules="[rules.required, rules.email]"
                      :color="BASE_COLOR"
                      :base-color="FIELD_COLOR"
                      variant="outlined"
                      class="w-auto text-sm-body-1"
                      density="compact"
                      placeholder="ivan@gmail.com"
                      type="email"
                      label="Почта"
                      rounded="lg"
                      clear-icon="close"
                      :append-inner-icon="emailRef ? 'close' : ''"
                      @click:append-inner="emailRef = null"
                      hide-details
                  />
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-dialog>
      <div v-if="isCreateGroup">
        <create-group @toggleDialog="toggleGroup" :isEdit="isEditGroup" :item="group"/>
      </div>

      <div v-if="isDialogPassword">
        <change-password @toggleDialogPassword="isDialogPassword = false" :id="idUser"/>
      </div>

      <div v-if="showModal">
        <ConfirmModal :showModal="true" @close="toggleModal()" @closeClear="closeDialogWithoutSaving()"
                      @closeWithSaving="closingWithSaving()"/>
      </div>
    </v-card>

    <filter-canvas>
      <div class="d-flex ga-2">
        <custom-filter-text-field label="Название" v-model="filterForm.name"/>
        <custom-filter-text-field label="Логин" v-model="filterForm.login"/>
      </div>
      <div class="d-flex ga-2">
        <custom-filter-text-field label="Почта" v-model="filterForm.email"/>
        <custom-filter-text-field label="Телефон" v-model="filterForm.phone"/>
      </div>
      <div class="d-flex ga-2">
        <custom-filter-autocomplete
            label="Организация"
            v-model="filterForm.organization_id"
            :items="organizations"
        />
        <custom-filter-autocomplete
            label="Помечен на удаление"
            v-model="filterForm.deleted"
            :items="markedForDeletion"
        />
      </div>
      <div class="d-flex justify-end mt-2">
        <div class="d-flex ga-2" style="margin-right: -6%;">
          <v-btn color="red" class="btn"
                 @click="() => {closeFilterDialog(); useFilterCanvasVisible().closeFilterCanvas()}"
          >сбросить
          </v-btn
          >
          <v-btn
              :color="BASE_COLOR"
              class="btn"
              @click="() => {getGroups(); useFilterCanvasVisible().closeFilterCanvas()}"
          >применить
          </v-btn
          >
        </div>
      </div>
    </filter-canvas>

  </div>
</template>

<style scoped>
.filterElement {
  position: relative;
}

.countFilter {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 16px;
  height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #82abf6;
  border-radius: 50%;
  font-size: 10px;
  color: white;
}
</style>