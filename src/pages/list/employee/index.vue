<script setup>
import {ref, watch} from "vue"
import {useRouter} from "vue-router"
import showToast from '../../../composables/toast'
import validate from "./validate.js"
import Icons from "../../../composables/Icons/Icons.vue"
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue"
import ConfirmModal from "../../../components/confirm/ConfirmModal.vue"
import CreateGroup from "./createGroup.vue"
import {
  addMessage,
  editMessage,
  removeMessage,
  warningMessage,
  ErrorSelectMessage,
  selectOneItemMessage,
  restoreMessage
} from "../../../composables/constant/buttons.js"
import {FIELD_COLOR, FIELD_OF_SEARCH} from "../../../composables/constant/colors.js"
import employee from "../../../api/employee.js"
import employeeGroup from "../../../api/employeeGroup.js"

const router = useRouter()

const loading = ref(true)
const loadingGroup = ref(true)
const dialog = ref(false)
const isCreateGroup = ref(false)
const idEmployee = ref(null)
const hoveredRowIndex = ref(null)
const groupIdRef = ref(0)

const isExistsEmployee = ref(false)
const markedID = ref([])
const markedItem = ref([])
const employeeDialogTitle = ref(null)
const employees = ref([])
const groups = ref([])
const group = ref(null)
const search = ref('')

const nameRef = ref(null)
const phoneRef = ref(null)
const emailRef = ref(null)
const addressRef = ref(null)
const imageRef = ref(null)
const imagePreview = ref(null)
const fileInput = ref(null)

const paginations = ref([])
const paginationsGroup = ref([])
const showConfirmDialog = ref(false)
const showModal = ref(false)

const filterDialog = ref(false)

const filterForm = ref({
  name: null,
  phone: null,
  email: null,
  address: null,
})

const count = ref(0)

const headersGroup = ref([
  {title: '№', key: 'id', align: 'start'},
  {title: 'Название группы', key: 'name'},
])

const headers = ref([
  {title: 'Наименование', key: 'name'},
])

const rules = {
  required: v => !!v,
  email: (v) => /.+@.+\..+/.test(v),
  phone: (v) => v.length === 13,
}

function countFilter() {
   
   for (const key in filterForm.value) {
       if (filterForm.value[key] !== null) {
           count.value++
       }
   }
   
   return count
}


const getGroup = async ({page, itemsPerPage, sortBy}) => {
  loadingGroup.value = true
  try {
    const { data } = await employeeGroup.get({page, itemsPerPage, sortBy})
    paginationsGroup.value = data.result.pagination
    groups.value = data.result.data.map(item => ({
      id: item.id,
      name: item.name
    }))
  } catch (e) {
    console.log(e)
  } finally {
    loadingGroup.value = false
  }
}

const toggleGroup = () => {
  isCreateGroup.value = false
  getGroup({})
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

const addEmployee = async ({page, itemsPerPage, sortBy}) => {
 if (validate(nameRef, phoneRef, emailRef, addressRef, group) !== true) return

  const formData = new FormData()

  function appendIfNotNull(key, value) {
    if (value !== null) {
      formData.append(key, value)
    }
  }

  let groupValue;
  if (typeof group.value === 'object') {
    groupValue = group.value.id
  } else {
    groupValue = group.value
  }

  appendIfNotNull('name', nameRef.value)
  appendIfNotNull('phone', phoneRef.value)
  appendIfNotNull('email', emailRef.value)
  appendIfNotNull('address', addressRef.value)
  appendIfNotNull('image', imageRef.value)
  appendIfNotNull('group_id', groupValue)

  try {
    const res = await employee.add(formData)

    if (res.status === 201) {
      await getEmployee({page, itemsPerPage, sortBy})
      showToast(addMessage)
      cleanForm()

      idEmployee.value = res.data.result.id
      dialog.value = false
      markedID.value = []
      markedItem.value = []
    }

  } catch (e) {
    if (e.response.status === 422) {
      if (e.response.data.errors.email) {
        showToast(e.response.data.errors.email[0], 'warning')
      }
      if (e.response.data.errors.phone) {
        showToast(e.response.data.errors.phone[0], 'warning')
      }
    }
  }

}


const update = async ({page, itemsPerPage, sortBy}) => {
  if (validate(nameRef, phoneRef, emailRef, addressRef, group) !== true) return

  const formData = new FormData()

  function appendIfNotNull(key, value) {
    if (value !== null) {
      formData.append(key, value)
    }
  }

  let groupValue
  if (typeof group.value === 'object') {
    groupValue = group.value.id
  } else {
    groupValue = group.value
  }

  appendIfNotNull('name', nameRef.value)
  appendIfNotNull('phone', phoneRef.value)
  appendIfNotNull('email', emailRef.value)
  appendIfNotNull('address', addressRef.value)
  appendIfNotNull('image', imageRef.value)
  appendIfNotNull('group_id', groupValue)


  try {
    const {status} = await employee.update(idEmployee.value, formData)
    if (status === 200) {
      dialog.value = null

      await getEmployee({page, itemsPerPage, sortBy})
      showToast(editMessage)
      cleanForm()
    }
  } catch (e) {
    if (e.response.status === 422) {
      if (e.response.data.errors.email) {
        showToast(e.response.data.errors.email[0], 'warning')
      }
      if (e.response.data.errors.phone) {
        showToast(e.response.data.errors.phone[0], 'warning')
      }
    }
  }
}


const cleanForm = () => {
  nameRef.value = null
  addressRef.value = null
  phoneRef.value = null
  emailRef.value = null
  imagePreview.value = null
}

const massDel = async ({page, itemsPerPage, sortBy, search}) => {

  try {
    const {status} = await employee.massDeletion({ids: markedID.value})

    if (status === 200) {

      showToast(removeMessage, 'red')
      await getEmployee({page, itemsPerPage, sortBy})
      markedID.value = []
      dialog.value = false
    }

  } catch (e) {

  }
}


const massRestore = async ({page, itemsPerPage, sortBy}) => {
  try {
    const {status} = await employee.massRestore({ids: markedID.value})

    if (status === 200) {
      showToast(restoreMessage)
      await getEmployee({page, itemsPerPage, sortBy})
      markedID.value = []
      dialog.value = false
    }
  } catch (e) {

  }
}


const handleCheckboxClick = (item) => {
  lineMarking(item)
}

const openDialog = (item) => {
  dialog.value = true
   if (item === 0) {
    idEmployee.value = 0
    isExistsEmployee.value = false

  } else {
    idEmployee.value = item.id
    markedID.value.push(item.id)
    isExistsEmployee.value = true
    nameRef.value = item.name
    phoneRef.value = item.phone
    emailRef.value = item.email
    addressRef.value = item.address
    employeeDialogTitle.value = nameRef.value

    group.value = {
      id: item.group.id,
      name: item.group.name
    }

    if (item.image !== null) {
      imagePreview.value = import.meta.env.VITE_IMG_URL + item.image
    } else {
      imagePreview.value = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/4QAuRXhpZgAATU0AKgAAAAgAAkAAAAMAAAABAAAAAEABAAEAAAABAAAAAAAAAAD/2wBDAAoHBwkHBgoJCAkLCwoMDxkQDw4ODx4WFxIZJCAmJSMgIyIoLTkwKCo2KyIjMkQyNjs9QEBAJjBGS0U+Sjk/QD3/2wBDAQsLCw8NDx0QEB09KSMpPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT3/wAARCAHaAdoDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD2WiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoqvc31va/66QBuyjqap/8ACQWv9yX/AL5H+NAGpRWX/wAJBa/3JvyH+NH/AAkFr/cm/If40AalFZf/AAkFr/cm/If40f8ACQWv9yb8h/jQBqUVnx63aSHBZo/d1xV8EOoZSCD0INAC0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFZ+q6h9jhCoR5r9PYetXJ5lt4Wkc4VRk1ydzcPdTtK/VjwPQUAREs5LMSWY8knOaWiigAooooAKKKKACrmmag1nMFYkwsfmU9vcVTooA7MEMAQcg9DS1j6Hfb0+zSH5lGUJ7j0/CtigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooACQASeAO9Y13roRilqobHV26fhT9dujHCtuhwZOWx6f/XrBoAuHWL0nPnY9gopP7Xvf+e5/IVUooAnuL64uUCTSllBzjGKgoooAKKsWdjLfPiMYQH5mPQf/AF637XS7e1wQu9/7zc//AKqAOeisribBjhcg98YqwNFvT/yzUfVhXTUUAcrJpN5HyYCf90g1WdGjO11ZW9CMV2dRywxToVlQOvoRQBx9Fa99oZQGS0ywHJQnn8Kx+RkHqOCDQAscjROHQlWByCO1W/7Xvf8AnufyFVKbQBd/te9/57n8hU0Ou3UZHmbJF7gjB/SszI9adQB1lnfRXse6M4YfeU9RViuRtLlrS5SVegOGHqK60EMAR0IoAWiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA5zXSf7QHsgxWdWjrv/IQ/wCACs6gAooooAKsWFk19OEGQi8s3oP8TVeuo0y0+yWiqR87fMx96ALMUSQRiONQqL0Ap9FQ3V1HaQmSU4A6Ad6AJqQuq8FgD7muYutXubkkBjFH2CnH5mqR55PJ96AO1BB5FFcdFcS25zDIyH2PFbenawJyIbnCyHhWHAb/AANAGtWTrGmiVDcQr+8A+YD+If41rUUAcTXU2FjBBax/u1ZmUFmIzmsTVbQWt2dowknzL6D1pbXWLi1hEYCOo6bu1AHRNawOpVoYyD22iuWvYRBeSxKcqrcd6ut4guSpAjiUnoQCazXdpHLMSWY5JPegBldfYkmxgJ/55r/KuQrrrD/jwg/3BQBYooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAOc13/kIf8AABWdWjrv/IQ/4AKzqACiiigCxp0Qmv4UPI3ZP4c11lc3oYB1IeyHFdJQAVy2qXZurxsH93Gdqj+tdNMxWF2HUKTXGUAOooooAKKKKAOn0q8N3ZgscyIdre/vV2sPw8x8ydexANblAGXr0QayWTvG36Hj/CufrqdVAOmT5/u5rlqACiiigBtddYf8eEH+4K5GuusP+PCD/cFAFiiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA5zXf+Qh/wAVnVo67/wAhD/gArOoAKKKKALujSeXqaZ6MCv8An8q6euNilMMySL1Rg1dhHIssSupyrDINACuoZCp6EYrjpYzFI8bfeUkGuyrG1nTTITcwrlh99R396AMSiiigAooqa0tJLyYRoOP4m/u0Aa3h+EiGWYj7x2j8P/11sVHDEtvCkSDCqMCpKAKWsSBNMl/2sKPzrmK2fEFwP3duD0+dv6f1rGoAKKKKAG111h/x4Qf7grka66w/48IP9wUAWKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigDnNd/5CH/AAAVnVo67/yEP+ACs6gAooooAK2dDvuPssh5H3Ce/tWNSAlCGUkEHII4xQB2tFZmm6styBFMQsvQE9GrToAoXWj290xcAxuf4l/wqg3h6XPyzqR7rit6igDHh8PICDPMzf7KjFakMMdvGEiQKo7CpKKACorm4S2gaWQ4UCi4uI7aMySsFUfrXNX9+99J3WNT8q/4+9AEFxM1zO8r/eY5+n/6qZRRQAUUUUANrrrD/jwg/wBwVyNddYf8eEH+4KALFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQBzmvAjUFPYoMVnV0Gt2ZngWZBl4+oHcVz9ABRRRQAUUUUAFX7XWLi2AVj5qDsx5/OqFFAHRRa7ayff3xn3GasDU7M/8vCfnXK0UAdRJq9nH/y2DH0UE1RuPEHBFtEf95/8KxaKAHzXEty++Zyzds9qZRRQAUUUUAFFFFADa6+yBFlAD1EY/lXNWFoby6WMA7AcufQf/XrrAAAAOgoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArLvNEjncvC3lOeSMcH/CtSigDnDoN2DwYiPXOKP7Cu/8Apl/31XR0UAc5/YV3/wBMv++qP7Cu/wDpl/31XR0UAc5/YV3/ANMv++qP7Cu/+mX/AH1XR0UAc5/YV3/0y/76o/sK7/6Zf99V0dFAHOf2Fd/9Mv8Avqj+wrv/AKZf99V0dFAHOf2Fd/8ATL/vqj+wrv8A6Zf99V0dFAHOf2Fd/wDTL/vqj+wrv/pl/wB9V0dFAHOf2Fd/9Mv++qlh8PykjzpVVfReTW9RQBDbWsVrGI4lwO59amoooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACsi2v7iTWGt2ZfKDNgY546Vr1y7STRaxM1su6QO2BjNAHR3LmO2ldfvKhI/KqOj3s16JTOwO0jGBiqct3qjROskBCFSGPl4wKl8OfduPqv9aAIW1O/kupIoCGIY4UKOgp/wBo1n/nkf8AvgVTjuJLbU5ZIU3uGYBcE9/arv8AbV9/z6D/AL4agCxcTaiLa3MSEyEHzBtHFUZdT1KFwkmEZhkAoOa34nLxIzDDMoJFYWuf8hKL/dH86ALNtNqrXMYmjIjJ+Y7QMCteiigCvdXsNkgaZsE9ABkmsq614ugFqGRgeS6g5FNukF14gWKTlBgYPpjP61Y12NI7OIIqqA/QDHagBLfxBF5arcK+/HzMAOa1IZo7iMSRMGU9CKp2VtFcaTCsiKcp1IrO0mVooL1QThU3D680AT3erzSXJt7FckHG7Gc/T296ikuNWtB5kvKd8gEfp0p/h2MHzpD94YUGttlDoVYZU8EGgClb35vbGSSAYmUH5fftWdJe6tDGXkTao6koOKTQyY9SljH3Sp/Q1p6x/wAgyX8P50AZkV9qtwm+Fd65xkIK0jeta6ak12D5pHK9CTTNB/5B/wDwM1S8QsTNCn8IUmgBEutUvsvbjagPGAMfr1p8Gr3FtP5N+vGcE4wR/iK2II1igRFGFVQBiszxDGpgikx8wbbn6/8A6qANfryKKq6Y5k06Bm67cflxVqgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArn7T/kYpP9566CoVtIEmMyxKJDyWA55oAW7/AOPOf/rm38qyvDn3Lj6r/Wth1V0KsAVIwQaZDbQ2+fJjVM9cDrQBz9tcpaatLLLu2hnHA960/wC3rT0l/wC+asnTrR2LNboSTkkjrSf2ZZ/8+0f5UAS21yl1CJY87T0yMVia5/yEov8AdH863YokhQJGoVR0ApktpBO4eWJXYDAJFAE1FFFAGXqOnSy3CXVqQJVxkE4ziqOp3F3LAi3VuIwrZDA8E10VRzQRXChZkV1HIBFAGNbzahJYJDb24CFcCQnqKvafpotbV0kIZ5B8xFXY41iQIihVUYAHanUAc5azPo968c6kxt1x39CKv3OuwLCfIJdzwMjAFX5reK5G2aMOB6ioU0uzjYMsC5HTJJ/nQBS0K0dd9zICN4wue/v+NW9Y/wCQZL+H86u0yWJJkKSKGU9QaAKOg/8AIP8A+Bmma5aNPAssYJaPOQPStCKGOBNkKKi9cAVJQBj2Otw/Z1S4JV1GM4yDVW/vDqk8cFsrFQeMjqfX6CtiXTLSZyzwLuPUjjP5VJBaw2wIgjVM9SByaAHW8QggSIdEUDNSUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQAlFLRQB/9k='
    }
  }
}

const addBasedOnEmployee = () => {
  if (markedID.value.length === 0) return showToast(warningMessage, 'warning')
  if (markedID.value.length > 1) return showToast(selectOneItemMessage, 'warning')
  dialog.value = true

  employees.value.forEach(item => {
    if (markedID.value[0] === item.id) {
      nameRef.value = item.name
      phoneRef.value = item.phone
      emailRef.value = item.email
      addressRef.value = item.address
      group.value = {
        id: item.group.id,
        name: item.group.name
      }
    }
  })
  isExistsEmployee.value = false
}

const compute = ({page, itemsPerPage, sortBy, search}) => {
  if (markedID.value.length === 0) return showToast(warningMessage, 'warning')
  if (markedItem.value.deleted_at) {
    return massRestore({page, itemsPerPage, sortBy})
  } else {
    return massDel({page, itemsPerPage, sortBy, search})
  }
}

const lineMarking = item => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = employees.value.find(el => el.id === markedID.value[0])
    if (firstMarkedItem && firstMarkedItem.deleted_at) {
      if (item.deleted_at === null) {
        showToast(ErrorSelectMessage, 'warning')
        return
      }
    }
    if (firstMarkedItem && firstMarkedItem.deleted_at === null) {
      if (item.deleted_at !== null) {
        showToast(ErrorSelectMessage, 'warning')
        return
      }
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
  markedItem.value = item
}

const lineMarkingGroup = group_id => {
  markedID.value = []
  groupIdRef.value = group_id
  getEmployee({})
}
const getEmployee = async ({page, itemsPerPage, sortBy, search}) => {

  filterDialog.value = false
  const filterData = filterForm.value
  count.value = 0
  countFilter()

  try {
    if (groupIdRef.value === 0) return
    loading.value = true

    const { data } = await employeeGroup.getEmployees({page, itemsPerPage, sortBy}, search, groupIdRef.value, filterData)
    paginations.value = data.result.pagination
    employees.value = data.result.data
  } catch (e) {
    employees.value = []
  } finally {
    loading.value = false
  }
}


const  closeFilterModal = async () => {
  filterDialog.value = false
  filterForm.value = {}
  await getEmployee({})
  
}



const isDataChanged = () => {
  const item = employees.value.find(elem => elem.id === idEmployee.value)

  return nameRef.value !== item.name ||
    phoneRef.value !== item.phone ||
    emailRef.value !== item.email ||
    addressRef.value !== item.address
}

const checkAndClose = () => {
 
  if (
    nameRef.value ||
    phoneRef.value ||
    emailRef.value ||
    addressRef.value
  ) {
    showModal.value = true
  } else {
    dialog.value = false
    showModal.value = false
  }
}

const closeDialogWithoutSaving = () => {
  dialog.value = false
  showModal.value = false
  showConfirmDialog.value = false
  cleanForm()
}

const checkUpdate = () => {
  if (isDataChanged()) {
    showModal.value = true
  } else {
    dialog.value = false
  }
}

watch(markedID, newVal => {
  markedItem.value = employees.value.find((el) => el.id === newVal[0]);
})

watch(dialog, newVal => {
  if (!newVal) {
    cleanForm()
  } else {
    markedID.value = [markedID.value[markedID.value.length - 1]];
  }
})

</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between text-uppercase ">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span>Сотрудники</span>
        </div>
        <v-card variant="text" min-width="430" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1 me-3">
              <button
                  class="group_create"
                  @click="isCreateGroup = true"
              >
              создать группу
              </button>
              <Icons @click="openDialog(0)" name="add"/>
              <Icons @click="addBasedOnEmployee" name="copy"/>
              <Icons @click="compute" name="delete"/>
            </div>

            <div class="w-100">
              <v-text-field
                  v-model="search"
                  prepend-inner-icon="search"
                  density="compact"
                  label="Поиск..."
                  variant="outlined"
                  color="info"
                  :base-color="FIELD_OF_SEARCH"
                  rounded="lg"
                  clear-icon="close"
                  hide-details
                  single-line
                  clearable
                  flat
              ></v-text-field>

            </div>
          </div>
          <div class="filterElement">
            <Icons
              name="filter"
              title="фильтр"
              @click="filterDialog = true"
              class="mt-1"
            />

            <span v-if="count !== 0" class="countFilter">{{ count }}</span>
          </div>
        </v-card>
      </div>
      <div class="d-flex ga-4 w-100">
        <v-card class="mt-2 table w-100">
          <v-data-table-server
              style="height: 78vh"
              items-per-page-text="Элементов на странице:"
              loading-text="Загрузка"
              no-data-text="Нет данных"
              v-model:items-per-page="paginationsGroup.per_page"
              :loading="loadingGroup"
              :headers="headersGroup"
              :items-length="paginationsGroup.total || 0"
              :items="groups"
              :item-value="headers.title"
              page-text='{0}-{1} от {2}'
              :items-per-page-options="[
                {value: 25, title: '25'},
                {value: 50, title: '50'},
                {value: 100, title: '100'},
            ]"
              @update:options="getGroup"
              fixed-header
              hover
          >
            <template v-slot:loading>
              <v-skeleton-loader type="table-row@9"></v-skeleton-loader>
            </template>
            <template v-slot:item="{ item, index }">
              <tr :class="{'bg-grey-lighten-2': item.id === groupIdRef }" @mouseenter="hoveredRowIndex = index + 100000"
                  @mouseleave="hoveredRowIndex = null" @click="lineMarkingGroup(item.id)">
                <td>
                  <div class="d-flex">
                    <span>{{ item.id }}</span>
                  </div>
                </td>
                <td>{{ item.name }}</td>
              </tr>
            </template>
          </v-data-table-server>
        </v-card>
        <v-card class="mt-2 table w-100">
          <v-data-table-server
              style="height: 78vh"
              items-per-page-text="Элементов на странице:"
              loading-text="Загрузка"
              no-data-text="Нет данных"
              v-model:items-per-page="paginations.per_page"
              :loading="loading"
              :headers="headers"
              :items-length="paginations.total || 0"
              :items="employees"
              :item-value="headers.title"
              page-text='{0}-{1} от {2}'
              :items-per-page-options="[
                {value: 25, title: '25'},
                {value: 50, title: '50'},
                {value: 100, title: '100'},
              ]"
              :search="search"
              show-select
              v-model="markedID"
              @update:options="getEmployee"
              fixed-header
              hover
          >
            <template v-slot:item="{ item, index }">
              <tr @mouseenter="hoveredRowIndex = index" @mouseleave="hoveredRowIndex = null" @click="lineMarking(item)"
                  @dblclick="openDialog(item)"
                  :class="{'bg-grey-lighten-2': markedID.includes(item.id) }">
                <td>
                  <template v-if="hoveredRowIndex === index || markedID.includes(item.id)">
                    <CustomCheckbox v-model="markedID" :checked="markedID.includes(item.id)"
                                    @change="handleCheckboxClick(item)">
                      <span>{{ index + 1 }}</span>
                    </CustomCheckbox>
                  </template>
                  <template v-else>
                    <div class="d-flex align-center">
                      <Icons style="margin-right: 10px; margin-top: 4px" :name="item.deleted_at === null ? 'valid' : 'inValid'"/>
                      <span>{{ index + 1 }}</span>
                    </div>
                  </template>
                </td>
                <td>{{ item.name }}</td>
              </tr>
            </template>
          </v-data-table-server>
        </v-card>
      </div>
      <!-- Modal -->
      <v-card>
        <v-dialog class="mt-2 pa-2" v-model="dialog">
          <v-card style="border: 2px solid #3AB700" min-width="540"
                  class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>{{ isExistsEmployee ? 'сотрудник: ' + employeeDialogTitle : 'Добавление' }}</span>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex ga-3 align-center mt-2 me-4">
                  <Icons v-if="isExistsEmployee" @click="compute" name="delete"/>
                  <Icons v-if="isExistsEmployee" @click="update" name="save"/>
                  <Icons v-else @click="addEmployee" name="save"/>
                </div>
                <v-btn
                  @click="isExistsEmployee ? checkUpdate() : checkAndClose()"
                  variant="text"
                  :size="32"
                  class="pt-2 pl-1"
                >
                  <Icons name="close"  title="Закрыть" />
                </v-btn>
              </div>
            </div>
            <v-form class="d-flex w-100" @submit.prevent="addEmployee">
              <v-row class="w-100">
                <v-col class="d-flex flex-column w-100">
                  <v-text-field
                      v-model="nameRef"
                      :rules="[rules.required]"
                      color="green"
                      :base-color="FIELD_COLOR"
                      variant="outlined"
                      class="w-auto text-sm-body-1"
                      density="compact"
                      placeholder="Фио"
                      label="Фио"
                      clear-icon="close"
                      clearable
                  />
                  <div class="d-flex ga-4">
                      <div class="border d-flex justify-center align-center" style="width: 50%">
                           <input
                               accept="image/*"
                               type="file"
                               @change="selectAvatar"
                               style="display: none"
                               ref="fileInput"
                           />  
                          <div v-if="imagePreview === null">
                              <v-btn @click="onPickFile">Загрузить фото</v-btn>
                          </div>
                          <img v-else :src="imagePreview" width="150" height="150" alt="">
                      </div>

                      <div class="d-flex flex-column" style="width: 60%">
                          <v-text-field
                              v-model="phoneRef"
                              :rules="[rules.required, rules.phone]"
                              color="green"
                              :base-color="FIELD_COLOR"
                              variant="outlined"
                              class="w-auto text-sm-body-1"
                              density="compact"
                              placeholder="номер телефона"
                              label="Номер телефона"
                              v-mask="'+############'"
                              clear-icon="close"
                              clearable
                          />
                          <v-text-field
                              v-model="emailRef"
                              :rules="[rules.required, rules.email]"
                              color="green"
                              :base-color="FIELD_COLOR"
                              variant="outlined"
                              class="w-auto text-sm-body-1"
                              density="compact"
                              placeholder="email"
                              label="Электронная почта"
                              clear-icon="close"
                              clearable
                          />
                          <v-text-field
                              v-model="addressRef"
                              :rules="[rules.required]"
                              color="green"
                              :base-color="FIELD_COLOR"
                              variant="outlined"
                              class="w-auto text-sm-body-1"
                              density="compact"
                              placeholder="Адрес"
                              label="Адрес"
                              clear-icon="close"
                              clearable
                          />
                          <span
                              v-show="imagePreview !== null"
                              @click="onPickFile"
                              class="text-sm-body-2 text-blue-darken-4 cursor-pointer"
                          >Изменить
                          </span>
                      </div>

                  </div>
                  <v-autocomplete
                      v-model="group"
                      class="mt-5"
                      :items="groups"
                      item-title="name"
                      item-value="id"
                      :base-color="FIELD_COLOR"
                      color="green"
                      item-color="green"
                      :rules="[rules.required]"
                      variant="outlined"
                      label="Группа"
                      hide-details
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </v-dialog>
        <div v-if="isCreateGroup">
          <create-group @toggleDialog="toggleGroup" />
        </div>
        <div v-if="showModal">
        <ConfirmModal :showModal="true" @close="showModal = !showModal" @closeClear="closeDialogWithoutSaving()" />
        </div>

        <v-dialog v-model="filterDialog" class="mt-2 pa-2">
        <v-card
          style="border: 2px solid #3ab700"
          min-width="650"
          class="d-flex pa-5 pt-2 justify-center flex-column mx-auto my-0"
          rounded="xl"
        >
          <div class="d-flex justify-space-between align-center mb-2">
            <span>Фильтр</span>
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex ga-3 align-center mt-2 me-4">
                <Icons @click="getEmployee" name="save" title="Сохранить" />
              </div>
              <v-btn
                @click="closeFilterModal"
                variant="text"
                :size="32"
                class="pt-2 pl-1"
              >
                <Icons name="close" title="Закрыть" />
              </v-btn>
            </div>
          </div>
          <v-form class="d-flex w-100">
            <v-row class="w-100">
              <v-col class="d-flex flex-column w-100">
                <div class="d-flex justify-space-between ga-6 mb-3">
                  <v-text-field
                    v-model="filterForm.name"
                    color="green"
                    :base-color="FIELD_COLOR"
                    rounded="md"
                    variant="outlined"
                    class="w-auto text-sm-body-1"
                    density="compact"
                    placeholder="Наименование"
                    label="Наименование"
                    clear-icon="close"
                    clearable
                    hide-details
                  />
                </div>
                
                <div class="d-flex ga-4 mb-3">
                  <v-text-field
                    v-model="filterForm.phone"
                    :rules="[rules.required, rules.phone]"
                    color="green"
                    :base-color="FIELD_COLOR"
                    variant="outlined"
                    class="w-auto text-sm-body-1"
                    density="compact"
                    type="tel"
                    placeholder="+992119111881"
                    label="Номер телефона"
                    v-mask="'+############'"
                    clear-icon="close"
                    :append-inner-icon="filterForm.phone ? 'close' : ''"
                    @click:append-inner="filterForm.phone = null"
                    hide-details
                  />
                  <v-text-field
                    v-model="filterForm.email"
                    :rules="[rules.required, rules.email]"
                    color="green"
                    :base-color="FIELD_COLOR"
                    variant="outlined"
                    class="w-auto text-sm-body-1"
                    density="compact"
                    placeholder="ivan@gmail.com"
                    type="email"
                    label="Почта"
                    clear-icon="close"
                    :append-inner-icon="filterForm.email ? 'close' : ''"
                    @click:append-inner="filterForm.email = null"
                    hide-details
                  />
                </div>
                <v-text-field
                  variant="outlined"
                  :base-color="FIELD_COLOR"
                  label="Адрес"
                  v-model="filterForm.address"
                  density="compact"
                  rounded="md"
                  color="green"
                  hide-details
                  :append-inner-icon="
                    filterForm.address !== null ? 'close' : ''
                  "
                  @click:append-inner="filterForm.address = null"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-dialog>



      </v-card>
    </v-col>
  </div>


</template>

<style scoped>
.filterElement {
  position: relative
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
  color: white
}
</style>