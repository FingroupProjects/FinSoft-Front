import { Fragment as _Fragment, mergeProps as _mergeProps, resolveDirective as _resolveDirective, createVNode as _createVNode } from "vue";
// Styles
import "./VDatePicker.css";

// Components
import { makeVDatePickerControlsProps, VDatePickerControls } from "./VDatePickerControls.mjs";
import { VDatePickerHeader } from "./VDatePickerHeader.mjs";
import { makeVDatePickerMonthProps, VDatePickerMonth } from "./VDatePickerMonth.mjs";
import { makeVDatePickerMonthsProps, VDatePickerMonths } from "./VDatePickerMonths.mjs";
import { makeVDatePickerYearsProps, VDatePickerYears } from "./VDatePickerYears.mjs";
import { VFadeTransition } from "../transitions/index.mjs";
import { VDefaultsProvider } from "../VDefaultsProvider/index.mjs";
import { makeVPickerProps, VPicker } from "../../labs/VPicker/VPicker.mjs"; // Composables
import { useDate } from "../../composables/date/index.mjs";
import { useLocale } from "../../composables/locale.mjs";
import { useProxiedModel } from "../../composables/proxiedModel.mjs"; // Utilities
import { computed, ref, shallowRef, watch } from 'vue';
import { genericComponent, omit, propsFactory, useRender, wrapInArray } from "../../util/index.mjs"; // Types
// Types
export const makeVDatePickerProps = propsFactory({
  // TODO: implement in v3.5
  // calendarIcon: {
  //   type: String,
  //   default: '$calendar',
  // },
  // keyboardIcon: {
  //   type: String,
  //   default: '$edit',
  // },
  // inputMode: {
  //   type: String as PropType<'calendar' | 'keyboard'>,
  //   default: 'calendar',
  // },
  // inputText: {
  //   type: String,
  //   default: '$vuetify.datePicker.input.placeholder',
  // },
  // inputPlaceholder: {
  //   type: String,
  //   default: 'dd/mm/yyyy',
  // },
  header: {
    type: String,
    default: '$vuetify.datePicker.header'
  },
  ...makeVDatePickerControlsProps(),
  ...makeVDatePickerMonthProps(),
  ...omit(makeVDatePickerMonthsProps(), ['modelValue']),
  ...omit(makeVDatePickerYearsProps(), ['modelValue']),
  ...makeVPickerProps({
    title: '$vuetify.datePicker.title'
  }),
  modelValue: null
}, 'VDatePicker');
export const VDatePicker = genericComponent()({
  name: 'VDatePicker',
  props: makeVDatePickerProps(),
  emits: {
    'update:modelValue': date => true,
    'update:month': date => true,
    'update:year': date => true,
    // 'update:inputMode': (date: any) => true,
    'update:viewMode': date => true
  },
  setup(props, _ref) {
    let {
      emit,
      slots
    } = _ref;
    const adapter = useDate();
    const {
      t
    } = useLocale();
    const model = useProxiedModel(props, 'modelValue', undefined, v => wrapInArray(v), v => props.multiple ? v : v[0]);
    const viewMode = useProxiedModel(props, 'viewMode');
    // const inputMode = useProxiedModel(props, 'inputMode')
    const internal = computed(() => {
      const value = adapter.date(model.value?.[0]);
      return value && adapter.isValid(value) ? value : adapter.date();
    });
    const month = ref(Number(props.month ?? adapter.getMonth(adapter.startOfMonth(internal.value))));
    const year = ref(Number(props.year ?? adapter.getYear(adapter.startOfYear(adapter.setMonth(internal.value, month.value)))));
    const isReversing = shallowRef(false);
    const header = computed(() => {
      return props.multiple && model.value.length > 1 ? t('$vuetify.datePicker.itemsSelected', model.value.length) : model.value[0] && adapter.isValid(model.value[0]) ? adapter.format(model.value[0], 'normalDateWithWeekday') : t(props.header);
    });
    const text = computed(() => {
      return adapter.format(adapter.parseISO(`${year.value}-${month.value + 1}-01`), 'monthAndYear');
    });
    // const headerIcon = computed(() => props.inputMode === 'calendar' ? props.keyboardIcon : props.calendarIcon)
    const headerTransition = computed(() => `date-picker-header${isReversing.value ? '-reverse' : ''}-transition`);
    const minDate = computed(() => {
      const date = adapter.date(props.min);
      return props.min && adapter.isValid(date) ? date : null;
    });
    const maxDate = computed(() => {
      const date = adapter.date(props.max);
      return props.max && adapter.isValid(date) ? date : null;
    });
    const disabled = computed(() => {
      if (props.disabled) return true;
      const targets = [];
      if (viewMode.value !== 'month') {
        targets.push(...['prev', 'next']);
      } else {
        let _date = adapter.date();
        _date = adapter.setYear(_date, year.value);
        _date = adapter.setMonth(_date, month.value);
        if (minDate.value) {
          const date = adapter.addDays(adapter.startOfMonth(_date), -1);
          adapter.isAfter(minDate.value, date) && targets.push('prev');
        }
        if (maxDate.value) {
          const date = adapter.addDays(adapter.endOfMonth(_date), 1);
          adapter.isAfter(date, maxDate.value) && targets.push('next');
        }
      }
      return targets;
    });

    // function onClickAppend () {
    //   inputMode.value = inputMode.value === 'calendar' ? 'keyboard' : 'calendar'
    // }

    function onClickNext() {
      if (month.value < 11) {
        month.value++;
      } else {
        year.value++;
        month.value = 0;
      }
    }
    function onClickPrev() {
      if (month.value > 0) {
        month.value--;
      } else {
        year.value--;
        month.value = 11;
      }
    }
    function onClickDate() {
      viewMode.value = 'month';
    }
    function onClickMonth() {
      viewMode.value = viewMode.value === 'months' ? 'month' : 'months';
    }
    function onClickYear() {
      viewMode.value = viewMode.value === 'year' ? 'month' : 'year';
    }
    watch(month, () => {
      if (viewMode.value === 'months') onClickMonth();
      emit('update:month', month.value);
    });
    watch(year, () => {
      if (viewMode.value === 'year') onClickYear();
      emit('update:year', year.value);
    });
    watch(model, (val, oldVal) => {
      const before = adapter.date(wrapInArray(val)[0]);
      const after = adapter.date(wrapInArray(oldVal)[0]);
      isReversing.value = adapter.isBefore(before, after);
    });
    useRender(() => {
      const pickerProps = VPicker.filterProps(props);
      const datePickerControlsProps = VDatePickerControls.filterProps(props);
      const datePickerHeaderProps = VDatePickerHeader.filterProps(props);
      const datePickerMonthProps = VDatePickerMonth.filterProps(props);
      const datePickerMonthsProps = omit(VDatePickerMonths.filterProps(props), ['modelValue']);
      const datePickerYearsProps = omit(VDatePickerYears.filterProps(props), ['modelValue']);
      const headerProps = {
        header: header.value,
        transition: headerTransition.value
      };
      return _createVNode(VPicker, _mergeProps(pickerProps, {
        "class": ['v-date-picker', `v-date-picker--${viewMode.value}`, {
          'v-date-picker--show-week': props.showWeek
        }, props.class],
        "style": props.style
      }), {
        title: () => slots.title?.() ?? _createVNode("div", {
          "class": "v-date-picker__title"
        }, [t(props.title)]),
        header: () => slots.header ? _createVNode(VDefaultsProvider, {
          "defaults": {
            VDatePickerHeader: {
              ...headerProps
            }
          }
        }, {
          default: () => [slots.header?.(headerProps)]
        }) : _createVNode(VDatePickerHeader, _mergeProps({
          "key": "header"
        }, datePickerHeaderProps, headerProps, {
          "onClick": viewMode.value !== 'month' ? onClickDate : undefined
        }), {
          ...slots,
          default: undefined
        }),
        default: () => _createVNode(_Fragment, null, [_createVNode(VDatePickerControls, _mergeProps(datePickerControlsProps, {
          "disabled": disabled.value,
          "text": text.value,
          "onClick:next": onClickNext,
          "onClick:prev": onClickPrev,
          "onClick:month": onClickMonth,
          "onClick:year": onClickYear
        }), null), _createVNode(VFadeTransition, {
          "hideOnLeave": true
        }, {
          default: () => [viewMode.value === 'months' ? _createVNode(VDatePickerMonths, _mergeProps({
            "key": "date-picker-months"
          }, datePickerMonthsProps, {
            "modelValue": month.value,
            "onUpdate:modelValue": $event => month.value = $event,
            "min": minDate.value,
            "max": maxDate.value
          }), null) : viewMode.value === 'year' ? _createVNode(VDatePickerYears, _mergeProps({
            "key": "date-picker-years"
          }, datePickerYearsProps, {
            "modelValue": year.value,
            "onUpdate:modelValue": $event => year.value = $event,
            "min": minDate.value,
            "max": maxDate.value
          }), null) : _createVNode(VDatePickerMonth, _mergeProps({
            "key": "date-picker-month"
          }, datePickerMonthProps, {
            "modelValue": model.value,
            "onUpdate:modelValue": $event => model.value = $event,
            "month": month.value,
            "onUpdate:month": $event => month.value = $event,
            "year": year.value,
            "onUpdate:year": $event => year.value = $event,
            "min": minDate.value,
            "max": maxDate.value
          }), null)]
        })]),
        actions: slots.actions
      });
    });
    return {};
  }
});
//# sourceMappingURL=VDatePicker.mjs.map