import * as vue from 'vue';
import { ComponentPropsOptions, ExtractPropTypes, VNodeChild, VNode, PropType } from 'vue';

declare const block: readonly ["top", "bottom"];
declare const inline: readonly ["start", "end", "left", "right"];
type Tblock = typeof block[number];
type Tinline = typeof inline[number];
type Anchor = Tblock | Tinline | 'center' | 'center center' | `${Tblock} ${Tinline | 'center'}` | `${Tinline} ${Tblock | 'center'}`;

type SlotsToProps<U extends RawSlots, T = MakeInternalSlots<U>> = {
    $children?: (VNodeChild | (T extends {
        default: infer V;
    } ? V : {}) | {
        [K in keyof T]?: T[K];
    });
    'v-slots'?: {
        [K in keyof T]?: T[K] | false;
    };
} & {
    [K in keyof T as `v-slot:${K & string}`]?: T[K] | false;
};
type RawSlots = Record<string, unknown>;
type Slot<T> = [T] extends [never] ? () => VNodeChild : (arg: T) => VNodeChild;
type VueSlot<T> = [T] extends [never] ? () => VNode[] : (arg: T) => VNode[];
type MakeInternalSlots<T extends RawSlots> = {
    [K in keyof T]: Slot<T[K]>;
};
type MakeSlots<T extends RawSlots> = {
    [K in keyof T]: VueSlot<T[K]>;
};
type GenericProps<Props, Slots extends Record<string, unknown>> = {
    $props: Props & SlotsToProps<Slots>;
    $slots: MakeSlots<Slots>;
};
interface FilterPropsOptions<PropsOptions extends Readonly<ComponentPropsOptions>, Props = ExtractPropTypes<PropsOptions>> {
    filterProps<T extends Partial<Props>, U extends Exclude<keyof Props, Exclude<keyof Props, keyof T>>>(props: T): Partial<Pick<T, U>>;
}

type VPickerSlots = {
    header: never;
    default: never;
    actions: never;
    title: never;
};

type VDatePickerSlots = Omit<VPickerSlots, 'header'> & {
    header: {
        header: string;
        transition: string;
    };
};
declare const VDatePicker: {
    new (...args: any[]): vue.CreateComponentPublicInstance<{
        header: string;
        style: vue.StyleValue;
        title: string;
        disabled: boolean;
        tag: string;
        landscape: boolean;
        nextIcon: string;
        prevIcon: string;
        modeIcon: string;
        viewMode: "month" | "year" | "months";
        showAdjacentMonths: boolean;
        weekdays: number[];
        hideWeekdays: boolean;
        showWeek: boolean;
        hideHeader: boolean;
    } & {
        max?: unknown;
        location?: Anchor | undefined;
        height?: string | number | undefined;
        width?: string | number | undefined;
        active?: string | string[] | undefined;
        min?: unknown;
        border?: string | number | boolean | undefined;
        color?: string | undefined;
        maxHeight?: string | number | undefined;
        maxWidth?: string | number | undefined;
        minHeight?: string | number | undefined;
        minWidth?: string | number | undefined;
        position?: "fixed" | "absolute" | "static" | "sticky" | "relative" | undefined;
        text?: string | undefined;
        month?: string | number | undefined;
        year?: string | number | undefined;
        class?: any;
        elevation?: string | number | undefined;
        theme?: string | undefined;
        rounded?: string | number | boolean | undefined;
        bgColor?: string | undefined;
        allowedDates?: unknown[] | ((date: unknown) => boolean) | undefined;
        displayValue?: unknown;
    } & {
        "onUpdate:month"?: ((date: any) => any) | undefined;
        "onUpdate:year"?: ((date: any) => any) | undefined;
        "onUpdate:viewMode"?: ((date: any) => any) | undefined;
    }, {}, unknown, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, Omit<{
        'update:modelValue': (date: any) => true;
        'update:month': (date: any) => true;
        'update:year': (date: any) => true;
        'update:viewMode': (date: any) => true;
    }, "multiple" | "$children" | "v-slot:default" | "v-slots" | "v-slot:title" | "modelValue" | "update:modelValue" | "v-slot:header" | "v-slot:actions">, vue.VNodeProps & vue.AllowedComponentProps & vue.ComponentCustomProps & {
        header: string;
        style: vue.StyleValue;
        title: string;
        disabled: boolean;
        tag: string;
        landscape: boolean;
        nextIcon: string;
        prevIcon: string;
        modeIcon: string;
        viewMode: "month" | "year" | "months";
        showAdjacentMonths: boolean;
        weekdays: number[];
        hideWeekdays: boolean;
        showWeek: boolean;
        hideHeader: boolean;
    } & {
        max?: unknown;
        location?: Anchor | undefined;
        height?: string | number | undefined;
        width?: string | number | undefined;
        active?: string | string[] | undefined;
        min?: unknown;
        border?: string | number | boolean | undefined;
        color?: string | undefined;
        maxHeight?: string | number | undefined;
        maxWidth?: string | number | undefined;
        minHeight?: string | number | undefined;
        minWidth?: string | number | undefined;
        position?: "fixed" | "absolute" | "static" | "sticky" | "relative" | undefined;
        text?: string | undefined;
        month?: string | number | undefined;
        year?: string | number | undefined;
        class?: any;
        elevation?: string | number | undefined;
        theme?: string | undefined;
        rounded?: string | number | boolean | undefined;
        bgColor?: string | undefined;
        allowedDates?: unknown[] | ((date: unknown) => boolean) | undefined;
        displayValue?: unknown;
    } & {
        "onUpdate:month"?: ((date: any) => any) | undefined;
        "onUpdate:year"?: ((date: any) => any) | undefined;
        "onUpdate:viewMode"?: ((date: any) => any) | undefined;
    }, {
        active: string | string[];
        header: string;
        style: vue.StyleValue;
        title: string;
        disabled: boolean;
        tag: string;
        landscape: boolean;
        rounded: string | number | boolean;
        nextIcon: string;
        prevIcon: string;
        modeIcon: string;
        viewMode: "month" | "year" | "months";
        showAdjacentMonths: boolean;
        weekdays: number[];
        hideWeekdays: boolean;
        showWeek: boolean;
        hideHeader: boolean;
    }, true, {}, vue.SlotsType<Partial<{
        default: () => vue.VNode<vue.RendererNode, vue.RendererElement, {
            [key: string]: any;
        }>[];
        title: () => vue.VNode<vue.RendererNode, vue.RendererElement, {
            [key: string]: any;
        }>[];
        actions: () => vue.VNode<vue.RendererNode, vue.RendererElement, {
            [key: string]: any;
        }>[];
        header: (arg: {
            header: string;
            transition: string;
        }) => vue.VNode<vue.RendererNode, vue.RendererElement, {
            [key: string]: any;
        }>[];
    }>>, {
        P: {};
        B: {};
        D: {};
        C: {};
        M: {};
        Defaults: {};
    }, {
        header: string;
        style: vue.StyleValue;
        title: string;
        disabled: boolean;
        tag: string;
        landscape: boolean;
        nextIcon: string;
        prevIcon: string;
        modeIcon: string;
        viewMode: "month" | "year" | "months";
        showAdjacentMonths: boolean;
        weekdays: number[];
        hideWeekdays: boolean;
        showWeek: boolean;
        hideHeader: boolean;
    } & {
        max?: unknown;
        location?: Anchor | undefined;
        height?: string | number | undefined;
        width?: string | number | undefined;
        active?: string | string[] | undefined;
        min?: unknown;
        border?: string | number | boolean | undefined;
        color?: string | undefined;
        maxHeight?: string | number | undefined;
        maxWidth?: string | number | undefined;
        minHeight?: string | number | undefined;
        minWidth?: string | number | undefined;
        position?: "fixed" | "absolute" | "static" | "sticky" | "relative" | undefined;
        text?: string | undefined;
        month?: string | number | undefined;
        year?: string | number | undefined;
        class?: any;
        elevation?: string | number | undefined;
        theme?: string | undefined;
        rounded?: string | number | boolean | undefined;
        bgColor?: string | undefined;
        allowedDates?: unknown[] | ((date: unknown) => boolean) | undefined;
        displayValue?: unknown;
    } & {
        "onUpdate:month"?: ((date: any) => any) | undefined;
        "onUpdate:year"?: ((date: any) => any) | undefined;
        "onUpdate:viewMode"?: ((date: any) => any) | undefined;
    }, {}, {}, {}, {}, {
        active: string | string[];
        header: string;
        style: vue.StyleValue;
        title: string;
        disabled: boolean;
        tag: string;
        landscape: boolean;
        rounded: string | number | boolean;
        nextIcon: string;
        prevIcon: string;
        modeIcon: string;
        viewMode: "month" | "year" | "months";
        showAdjacentMonths: boolean;
        weekdays: number[];
        hideWeekdays: boolean;
        showWeek: boolean;
        hideHeader: boolean;
    }>;
    __isFragment?: undefined;
    __isTeleport?: undefined;
    __isSuspense?: undefined;
} & vue.ComponentOptionsBase<{
    header: string;
    style: vue.StyleValue;
    title: string;
    disabled: boolean;
    tag: string;
    landscape: boolean;
    nextIcon: string;
    prevIcon: string;
    modeIcon: string;
    viewMode: "month" | "year" | "months";
    showAdjacentMonths: boolean;
    weekdays: number[];
    hideWeekdays: boolean;
    showWeek: boolean;
    hideHeader: boolean;
} & {
    max?: unknown;
    location?: Anchor | undefined;
    height?: string | number | undefined;
    width?: string | number | undefined;
    active?: string | string[] | undefined;
    min?: unknown;
    border?: string | number | boolean | undefined;
    color?: string | undefined;
    maxHeight?: string | number | undefined;
    maxWidth?: string | number | undefined;
    minHeight?: string | number | undefined;
    minWidth?: string | number | undefined;
    position?: "fixed" | "absolute" | "static" | "sticky" | "relative" | undefined;
    text?: string | undefined;
    month?: string | number | undefined;
    year?: string | number | undefined;
    class?: any;
    elevation?: string | number | undefined;
    theme?: string | undefined;
    rounded?: string | number | boolean | undefined;
    bgColor?: string | undefined;
    allowedDates?: unknown[] | ((date: unknown) => boolean) | undefined;
    displayValue?: unknown;
} & {
    "onUpdate:month"?: ((date: any) => any) | undefined;
    "onUpdate:year"?: ((date: any) => any) | undefined;
    "onUpdate:viewMode"?: ((date: any) => any) | undefined;
}, {}, unknown, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, Omit<{
    'update:modelValue': (date: any) => true;
    'update:month': (date: any) => true;
    'update:year': (date: any) => true;
    'update:viewMode': (date: any) => true;
}, "multiple" | "$children" | "v-slot:default" | "v-slots" | "v-slot:title" | "modelValue" | "update:modelValue" | "v-slot:header" | "v-slot:actions">, string, {
    active: string | string[];
    header: string;
    style: vue.StyleValue;
    title: string;
    disabled: boolean;
    tag: string;
    landscape: boolean;
    rounded: string | number | boolean;
    nextIcon: string;
    prevIcon: string;
    modeIcon: string;
    viewMode: "month" | "year" | "months";
    showAdjacentMonths: boolean;
    weekdays: number[];
    hideWeekdays: boolean;
    showWeek: boolean;
    hideHeader: boolean;
}, {}, string, vue.SlotsType<Partial<{
    default: () => vue.VNode<vue.RendererNode, vue.RendererElement, {
        [key: string]: any;
    }>[];
    title: () => vue.VNode<vue.RendererNode, vue.RendererElement, {
        [key: string]: any;
    }>[];
    actions: () => vue.VNode<vue.RendererNode, vue.RendererElement, {
        [key: string]: any;
    }>[];
    header: (arg: {
        header: string;
        transition: string;
    }) => vue.VNode<vue.RendererNode, vue.RendererElement, {
        [key: string]: any;
    }>[];
}>>> & vue.VNodeProps & vue.AllowedComponentProps & vue.ComponentCustomProps & (new <T, Multiple extends number | boolean | "range" | (string & {}) = false, TModel = Multiple extends string | number | true ? T[] : T>(props: {
    modelValue?: TModel | undefined;
    'onUpdate:modelValue'?: ((value: TModel) => void) | undefined;
    multiple?: Multiple | undefined;
}, slots: VDatePickerSlots) => GenericProps<{
    modelValue?: TModel | undefined;
    'onUpdate:modelValue'?: ((value: TModel) => void) | undefined;
    multiple?: Multiple | undefined;
}, VDatePickerSlots>) & FilterPropsOptions<{
    modelValue: null;
    theme: StringConstructor;
    tag: {
        type: StringConstructor;
        default: string;
    };
    rounded: {
        type: (StringConstructor | BooleanConstructor | NumberConstructor)[];
        default: undefined;
    };
    position: {
        type: vue.PropType<"fixed" | "absolute" | "static" | "sticky" | "relative">;
        validator: (v: any) => boolean;
    };
    location: vue.PropType<Anchor>;
    elevation: {
        type: (StringConstructor | NumberConstructor)[];
        validator(v: any): boolean;
    };
    height: (StringConstructor | NumberConstructor)[];
    maxHeight: (StringConstructor | NumberConstructor)[];
    maxWidth: (StringConstructor | NumberConstructor)[];
    minHeight: (StringConstructor | NumberConstructor)[];
    minWidth: (StringConstructor | NumberConstructor)[];
    width: (StringConstructor | NumberConstructor)[];
    class: vue.PropType<any>;
    style: {
        type: vue.PropType<vue.StyleValue>;
        default: null;
    };
    border: (StringConstructor | BooleanConstructor | NumberConstructor)[];
    color: StringConstructor;
    bgColor: StringConstructor;
    landscape: BooleanConstructor;
    title: {
        type: vue.PropType<string>;
        default: string;
    };
    hideHeader: BooleanConstructor;
    max: vue.PropType<unknown>;
    min: vue.PropType<unknown>;
    allowedDates: vue.PropType<unknown[] | ((date: unknown) => boolean)>;
    disabled: BooleanConstructor;
    displayValue: vue.PropType<unknown>;
    month: (StringConstructor | NumberConstructor)[];
    showAdjacentMonths: BooleanConstructor;
    year: (StringConstructor | NumberConstructor)[];
    weekdays: {
        type: {
            (arrayLength: number): number[];
            (...items: number[]): number[];
            new (arrayLength: number): number[];
            new (...items: number[]): number[];
            isArray(arg: any): arg is any[];
            readonly prototype: any[];
            from<T_1>(arrayLike: ArrayLike<T_1>): T_1[];
            from<T_2, U>(arrayLike: ArrayLike<T_2>, mapfn: (v: T_2, k: number) => U, thisArg?: any): U[];
            from<T_3>(iterable: Iterable<T_3> | ArrayLike<T_3>): T_3[];
            from<T_4, U_1>(iterable: Iterable<T_4> | ArrayLike<T_4>, mapfn: (v: T_4, k: number) => U_1, thisArg?: any): U_1[];
            of<T_5>(...items: T_5[]): T_5[];
            readonly [Symbol.species]: ArrayConstructor;
        };
        default: () => number[];
    };
    hideWeekdays: BooleanConstructor;
    multiple: vue.PropType<number | boolean | "range" | (string & {})>;
    showWeek: BooleanConstructor;
    active: {
        type: vue.PropType<string | string[]>;
        default: undefined;
    };
    nextIcon: {
        type: StringConstructor[];
        default: string;
    };
    prevIcon: {
        type: StringConstructor[];
        default: string;
    };
    modeIcon: {
        type: StringConstructor[];
        default: string;
    };
    text: StringConstructor;
    viewMode: {
        type: vue.PropType<"month" | "year" | "months">;
        default: string;
    };
    header: {
        type: StringConstructor;
        default: string;
    };
}, vue.ExtractPropTypes<{
    modelValue: null;
    theme: StringConstructor;
    tag: {
        type: StringConstructor;
        default: string;
    };
    rounded: {
        type: (StringConstructor | BooleanConstructor | NumberConstructor)[];
        default: undefined;
    };
    position: {
        type: vue.PropType<"fixed" | "absolute" | "static" | "sticky" | "relative">;
        validator: (v: any) => boolean;
    };
    location: vue.PropType<Anchor>;
    elevation: {
        type: (StringConstructor | NumberConstructor)[];
        validator(v: any): boolean;
    };
    height: (StringConstructor | NumberConstructor)[];
    maxHeight: (StringConstructor | NumberConstructor)[];
    maxWidth: (StringConstructor | NumberConstructor)[];
    minHeight: (StringConstructor | NumberConstructor)[];
    minWidth: (StringConstructor | NumberConstructor)[];
    width: (StringConstructor | NumberConstructor)[];
    class: vue.PropType<any>;
    style: {
        type: vue.PropType<vue.StyleValue>;
        default: null;
    };
    border: (StringConstructor | BooleanConstructor | NumberConstructor)[];
    color: StringConstructor;
    bgColor: StringConstructor;
    landscape: BooleanConstructor;
    title: {
        type: vue.PropType<string>;
        default: string;
    };
    hideHeader: BooleanConstructor;
    max: vue.PropType<unknown>;
    min: vue.PropType<unknown>;
    allowedDates: vue.PropType<unknown[] | ((date: unknown) => boolean)>;
    disabled: BooleanConstructor;
    displayValue: vue.PropType<unknown>;
    month: (StringConstructor | NumberConstructor)[];
    showAdjacentMonths: BooleanConstructor;
    year: (StringConstructor | NumberConstructor)[];
    weekdays: {
        type: {
            (arrayLength: number): number[];
            (...items: number[]): number[];
            new (arrayLength: number): number[];
            new (...items: number[]): number[];
            isArray(arg: any): arg is any[];
            readonly prototype: any[];
            from<T_1>(arrayLike: ArrayLike<T_1>): T_1[];
            from<T_2, U>(arrayLike: ArrayLike<T_2>, mapfn: (v: T_2, k: number) => U, thisArg?: any): U[];
            from<T_3>(iterable: Iterable<T_3> | ArrayLike<T_3>): T_3[];
            from<T_4, U_1>(iterable: Iterable<T_4> | ArrayLike<T_4>, mapfn: (v: T_4, k: number) => U_1, thisArg?: any): U_1[];
            of<T_5>(...items: T_5[]): T_5[];
            readonly [Symbol.species]: ArrayConstructor;
        };
        default: () => number[];
    };
    hideWeekdays: BooleanConstructor;
    multiple: vue.PropType<number | boolean | "range" | (string & {})>;
    showWeek: BooleanConstructor;
    active: {
        type: vue.PropType<string | string[]>;
        default: undefined;
    };
    nextIcon: {
        type: StringConstructor[];
        default: string;
    };
    prevIcon: {
        type: StringConstructor[];
        default: string;
    };
    modeIcon: {
        type: StringConstructor[];
        default: string;
    };
    text: StringConstructor;
    viewMode: {
        type: vue.PropType<"month" | "year" | "months">;
        default: string;
    };
    header: {
        type: StringConstructor;
        default: string;
    };
}>>;
type VDatePicker = InstanceType<typeof VDatePicker>;

declare const VDatePickerControls: {
    new (...args: any[]): vue.CreateComponentPublicInstance<{
        disabled: string | boolean | string[];
        nextIcon: string;
        prevIcon: string;
        modeIcon: string;
        viewMode: "month" | "year" | "months";
    } & {
        active?: string | string[] | undefined;
        text?: string | undefined;
    } & {
        $children?: vue.VNodeChild | (() => vue.VNodeChild) | {
            default?: (() => vue.VNodeChild) | undefined;
        };
        'v-slots'?: {
            default?: false | (() => vue.VNodeChild) | undefined;
        } | undefined;
    } & {
        "v-slot:default"?: false | (() => vue.VNodeChild) | undefined;
    } & {
        "onClick:year"?: (() => any) | undefined;
        "onClick:month"?: (() => any) | undefined;
        "onClick:prev"?: (() => any) | undefined;
        "onClick:next"?: (() => any) | undefined;
        "onClick:text"?: (() => any) | undefined;
    }, {}, unknown, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {
        'click:year': () => true;
        'click:month': () => true;
        'click:prev': () => true;
        'click:next': () => true;
        'click:text': () => true;
    }, vue.VNodeProps & vue.AllowedComponentProps & vue.ComponentCustomProps & {
        disabled: string | boolean | string[];
        nextIcon: string;
        prevIcon: string;
        modeIcon: string;
        viewMode: "month" | "year" | "months";
    } & {
        active?: string | string[] | undefined;
        text?: string | undefined;
    } & {
        $children?: vue.VNodeChild | (() => vue.VNodeChild) | {
            default?: (() => vue.VNodeChild) | undefined;
        };
        'v-slots'?: {
            default?: false | (() => vue.VNodeChild) | undefined;
        } | undefined;
    } & {
        "v-slot:default"?: false | (() => vue.VNodeChild) | undefined;
    } & {
        "onClick:year"?: (() => any) | undefined;
        "onClick:month"?: (() => any) | undefined;
        "onClick:prev"?: (() => any) | undefined;
        "onClick:next"?: (() => any) | undefined;
        "onClick:text"?: (() => any) | undefined;
    }, {
        active: string | string[];
        disabled: string | boolean | string[];
        nextIcon: string;
        prevIcon: string;
        modeIcon: string;
        viewMode: "month" | "year" | "months";
    }, true, {}, vue.SlotsType<Partial<{
        default: () => vue.VNode<vue.RendererNode, vue.RendererElement, {
            [key: string]: any;
        }>[];
    }>>, {
        P: {};
        B: {};
        D: {};
        C: {};
        M: {};
        Defaults: {};
    }, {
        disabled: string | boolean | string[];
        nextIcon: string;
        prevIcon: string;
        modeIcon: string;
        viewMode: "month" | "year" | "months";
    } & {
        active?: string | string[] | undefined;
        text?: string | undefined;
    } & {
        $children?: vue.VNodeChild | (() => vue.VNodeChild) | {
            default?: (() => vue.VNodeChild) | undefined;
        };
        'v-slots'?: {
            default?: false | (() => vue.VNodeChild) | undefined;
        } | undefined;
    } & {
        "v-slot:default"?: false | (() => vue.VNodeChild) | undefined;
    } & {
        "onClick:year"?: (() => any) | undefined;
        "onClick:month"?: (() => any) | undefined;
        "onClick:prev"?: (() => any) | undefined;
        "onClick:next"?: (() => any) | undefined;
        "onClick:text"?: (() => any) | undefined;
    }, {}, {}, {}, {}, {
        active: string | string[];
        disabled: string | boolean | string[];
        nextIcon: string;
        prevIcon: string;
        modeIcon: string;
        viewMode: "month" | "year" | "months";
    }>;
    __isFragment?: undefined;
    __isTeleport?: undefined;
    __isSuspense?: undefined;
} & vue.ComponentOptionsBase<{
    disabled: string | boolean | string[];
    nextIcon: string;
    prevIcon: string;
    modeIcon: string;
    viewMode: "month" | "year" | "months";
} & {
    active?: string | string[] | undefined;
    text?: string | undefined;
} & {
    $children?: vue.VNodeChild | (() => vue.VNodeChild) | {
        default?: (() => vue.VNodeChild) | undefined;
    };
    'v-slots'?: {
        default?: false | (() => vue.VNodeChild) | undefined;
    } | undefined;
} & {
    "v-slot:default"?: false | (() => vue.VNodeChild) | undefined;
} & {
    "onClick:year"?: (() => any) | undefined;
    "onClick:month"?: (() => any) | undefined;
    "onClick:prev"?: (() => any) | undefined;
    "onClick:next"?: (() => any) | undefined;
    "onClick:text"?: (() => any) | undefined;
}, {}, unknown, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {
    'click:year': () => true;
    'click:month': () => true;
    'click:prev': () => true;
    'click:next': () => true;
    'click:text': () => true;
}, string, {
    active: string | string[];
    disabled: string | boolean | string[];
    nextIcon: string;
    prevIcon: string;
    modeIcon: string;
    viewMode: "month" | "year" | "months";
}, {}, string, vue.SlotsType<Partial<{
    default: () => vue.VNode<vue.RendererNode, vue.RendererElement, {
        [key: string]: any;
    }>[];
}>>> & vue.VNodeProps & vue.AllowedComponentProps & vue.ComponentCustomProps & FilterPropsOptions<{
    active: {
        type: PropType<string | string[]>;
        default: undefined;
    };
    disabled: {
        type: PropType<string | boolean | string[]>;
        default: boolean;
    };
    nextIcon: {
        type: StringConstructor[];
        default: string;
    };
    prevIcon: {
        type: StringConstructor[];
        default: string;
    };
    modeIcon: {
        type: StringConstructor[];
        default: string;
    };
    text: StringConstructor;
    viewMode: {
        type: PropType<"month" | "year" | "months">;
        default: string;
    };
}, vue.ExtractPropTypes<{
    active: {
        type: PropType<string | string[]>;
        default: undefined;
    };
    disabled: {
        type: PropType<string | boolean | string[]>;
        default: boolean;
    };
    nextIcon: {
        type: StringConstructor[];
        default: string;
    };
    prevIcon: {
        type: StringConstructor[];
        default: string;
    };
    modeIcon: {
        type: StringConstructor[];
        default: string;
    };
    text: StringConstructor;
    viewMode: {
        type: PropType<"month" | "year" | "months">;
        default: string;
    };
}>>;
type VDatePickerControls = InstanceType<typeof VDatePickerControls>;

declare const VDatePickerHeader: {
    new (...args: any[]): vue.CreateComponentPublicInstance<{} & {
        color?: string | undefined;
        transition?: string | undefined;
        header?: string | undefined;
        onClick?: ((args_0: MouseEvent) => void) | undefined;
        appendIcon?: string | undefined;
    } & {
        $children?: vue.VNodeChild | (() => vue.VNodeChild) | {
            prepend?: (() => vue.VNodeChild) | undefined;
            default?: (() => vue.VNodeChild) | undefined;
            append?: (() => vue.VNodeChild) | undefined;
        };
        'v-slots'?: {
            prepend?: false | (() => vue.VNodeChild) | undefined;
            default?: false | (() => vue.VNodeChild) | undefined;
            append?: false | (() => vue.VNodeChild) | undefined;
        } | undefined;
    } & {
        "v-slot:prepend"?: false | (() => vue.VNodeChild) | undefined;
        "v-slot:default"?: false | (() => vue.VNodeChild) | undefined;
        "v-slot:append"?: false | (() => vue.VNodeChild) | undefined;
    } & {
        onClick?: (() => any) | undefined;
        "onClick:append"?: (() => any) | undefined;
    }, {}, unknown, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {
        click: () => true;
        'click:append': () => true;
    }, vue.VNodeProps & vue.AllowedComponentProps & vue.ComponentCustomProps & {} & {
        color?: string | undefined;
        transition?: string | undefined;
        header?: string | undefined;
        onClick?: ((args_0: MouseEvent) => void) | undefined;
        appendIcon?: string | undefined;
    } & {
        $children?: vue.VNodeChild | (() => vue.VNodeChild) | {
            prepend?: (() => vue.VNodeChild) | undefined;
            default?: (() => vue.VNodeChild) | undefined;
            append?: (() => vue.VNodeChild) | undefined;
        };
        'v-slots'?: {
            prepend?: false | (() => vue.VNodeChild) | undefined;
            default?: false | (() => vue.VNodeChild) | undefined;
            append?: false | (() => vue.VNodeChild) | undefined;
        } | undefined;
    } & {
        "v-slot:prepend"?: false | (() => vue.VNodeChild) | undefined;
        "v-slot:default"?: false | (() => vue.VNodeChild) | undefined;
        "v-slot:append"?: false | (() => vue.VNodeChild) | undefined;
    } & {
        onClick?: (() => any) | undefined;
        "onClick:append"?: (() => any) | undefined;
    }, {}, true, {}, vue.SlotsType<Partial<{
        prepend: () => vue.VNode<vue.RendererNode, vue.RendererElement, {
            [key: string]: any;
        }>[];
        default: () => vue.VNode<vue.RendererNode, vue.RendererElement, {
            [key: string]: any;
        }>[];
        append: () => vue.VNode<vue.RendererNode, vue.RendererElement, {
            [key: string]: any;
        }>[];
    }>>, {
        P: {};
        B: {};
        D: {};
        C: {};
        M: {};
        Defaults: {};
    }, {} & {
        color?: string | undefined;
        transition?: string | undefined;
        header?: string | undefined;
        onClick?: ((args_0: MouseEvent) => void) | undefined;
        appendIcon?: string | undefined;
    } & {
        $children?: vue.VNodeChild | (() => vue.VNodeChild) | {
            prepend?: (() => vue.VNodeChild) | undefined;
            default?: (() => vue.VNodeChild) | undefined;
            append?: (() => vue.VNodeChild) | undefined;
        };
        'v-slots'?: {
            prepend?: false | (() => vue.VNodeChild) | undefined;
            default?: false | (() => vue.VNodeChild) | undefined;
            append?: false | (() => vue.VNodeChild) | undefined;
        } | undefined;
    } & {
        "v-slot:prepend"?: false | (() => vue.VNodeChild) | undefined;
        "v-slot:default"?: false | (() => vue.VNodeChild) | undefined;
        "v-slot:append"?: false | (() => vue.VNodeChild) | undefined;
    } & {
        onClick?: (() => any) | undefined;
        "onClick:append"?: (() => any) | undefined;
    }, {}, {}, {}, {}, {}>;
    __isFragment?: undefined;
    __isTeleport?: undefined;
    __isSuspense?: undefined;
} & vue.ComponentOptionsBase<{} & {
    color?: string | undefined;
    transition?: string | undefined;
    header?: string | undefined;
    onClick?: ((args_0: MouseEvent) => void) | undefined;
    appendIcon?: string | undefined;
} & {
    $children?: vue.VNodeChild | (() => vue.VNodeChild) | {
        prepend?: (() => vue.VNodeChild) | undefined;
        default?: (() => vue.VNodeChild) | undefined;
        append?: (() => vue.VNodeChild) | undefined;
    };
    'v-slots'?: {
        prepend?: false | (() => vue.VNodeChild) | undefined;
        default?: false | (() => vue.VNodeChild) | undefined;
        append?: false | (() => vue.VNodeChild) | undefined;
    } | undefined;
} & {
    "v-slot:prepend"?: false | (() => vue.VNodeChild) | undefined;
    "v-slot:default"?: false | (() => vue.VNodeChild) | undefined;
    "v-slot:append"?: false | (() => vue.VNodeChild) | undefined;
} & {
    onClick?: (() => any) | undefined;
    "onClick:append"?: (() => any) | undefined;
}, {}, unknown, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {
    click: () => true;
    'click:append': () => true;
}, string, {}, {}, string, vue.SlotsType<Partial<{
    prepend: () => vue.VNode<vue.RendererNode, vue.RendererElement, {
        [key: string]: any;
    }>[];
    default: () => vue.VNode<vue.RendererNode, vue.RendererElement, {
        [key: string]: any;
    }>[];
    append: () => vue.VNode<vue.RendererNode, vue.RendererElement, {
        [key: string]: any;
    }>[];
}>>> & vue.VNodeProps & vue.AllowedComponentProps & vue.ComponentCustomProps & FilterPropsOptions<{
    appendIcon: StringConstructor;
    color: StringConstructor;
    header: StringConstructor;
    transition: StringConstructor;
    onClick: vue.PropType<(args_0: MouseEvent) => void>;
}, vue.ExtractPropTypes<{
    appendIcon: StringConstructor;
    color: StringConstructor;
    header: StringConstructor;
    transition: StringConstructor;
    onClick: vue.PropType<(args_0: MouseEvent) => void>;
}>>;
type VDatePickerHeader = InstanceType<typeof VDatePickerHeader>;

declare const VDatePickerMonth: {
    new (...args: any[]): vue.CreateComponentPublicInstance<{
        disabled: boolean;
        showAdjacentMonths: boolean;
        weekdays: number[];
        hideWeekdays: boolean;
        showWeek: boolean;
    } & {
        max?: unknown;
        min?: unknown;
        color?: string | undefined;
        multiple?: number | boolean | "range" | (string & {}) | undefined;
        month?: string | number | undefined;
        year?: string | number | undefined;
        modelValue?: unknown[] | undefined;
        allowedDates?: unknown[] | ((date: unknown) => boolean) | undefined;
        displayValue?: unknown;
    } & {
        $children?: {} | vue.VNodeChild | {
            day?: ((arg: {
                props: {
                    onClick: () => void;
                };
                item: any;
                i: number;
            }) => vue.VNodeChild) | undefined;
        };
        'v-slots'?: {
            day?: false | ((arg: {
                props: {
                    onClick: () => void;
                };
                item: any;
                i: number;
            }) => vue.VNodeChild) | undefined;
        } | undefined;
    } & {
        "v-slot:day"?: false | ((arg: {
            props: {
                onClick: () => void;
            };
            item: any;
            i: number;
        }) => vue.VNodeChild) | undefined;
    } & {
        "onUpdate:modelValue"?: ((date: unknown) => any) | undefined;
        "onUpdate:month"?: ((date: number) => any) | undefined;
        "onUpdate:year"?: ((date: number) => any) | undefined;
    }, () => JSX.Element, unknown, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {
        'update:modelValue': (date: unknown) => true;
        'update:month': (date: number) => true;
        'update:year': (date: number) => true;
    }, vue.VNodeProps & vue.AllowedComponentProps & vue.ComponentCustomProps & {
        disabled: boolean;
        showAdjacentMonths: boolean;
        weekdays: number[];
        hideWeekdays: boolean;
        showWeek: boolean;
    } & {
        max?: unknown;
        min?: unknown;
        color?: string | undefined;
        multiple?: number | boolean | "range" | (string & {}) | undefined;
        month?: string | number | undefined;
        year?: string | number | undefined;
        modelValue?: unknown[] | undefined;
        allowedDates?: unknown[] | ((date: unknown) => boolean) | undefined;
        displayValue?: unknown;
    } & {
        $children?: {} | vue.VNodeChild | {
            day?: ((arg: {
                props: {
                    onClick: () => void;
                };
                item: any;
                i: number;
            }) => vue.VNodeChild) | undefined;
        };
        'v-slots'?: {
            day?: false | ((arg: {
                props: {
                    onClick: () => void;
                };
                item: any;
                i: number;
            }) => vue.VNodeChild) | undefined;
        } | undefined;
    } & {
        "v-slot:day"?: false | ((arg: {
            props: {
                onClick: () => void;
            };
            item: any;
            i: number;
        }) => vue.VNodeChild) | undefined;
    } & {
        "onUpdate:modelValue"?: ((date: unknown) => any) | undefined;
        "onUpdate:month"?: ((date: number) => any) | undefined;
        "onUpdate:year"?: ((date: number) => any) | undefined;
    }, {
        disabled: boolean;
        showAdjacentMonths: boolean;
        weekdays: number[];
        hideWeekdays: boolean;
        showWeek: boolean;
    }, true, {}, vue.SlotsType<Partial<{
        day: (arg: {
            props: {
                onClick: () => void;
            };
            item: any;
            i: number;
        }) => vue.VNode<vue.RendererNode, vue.RendererElement, {
            [key: string]: any;
        }>[];
    }>>, {
        P: {};
        B: {};
        D: {};
        C: {};
        M: {};
        Defaults: {};
    }, {
        disabled: boolean;
        showAdjacentMonths: boolean;
        weekdays: number[];
        hideWeekdays: boolean;
        showWeek: boolean;
    } & {
        max?: unknown;
        min?: unknown;
        color?: string | undefined;
        multiple?: number | boolean | "range" | (string & {}) | undefined;
        month?: string | number | undefined;
        year?: string | number | undefined;
        modelValue?: unknown[] | undefined;
        allowedDates?: unknown[] | ((date: unknown) => boolean) | undefined;
        displayValue?: unknown;
    } & {
        $children?: {} | vue.VNodeChild | {
            day?: ((arg: {
                props: {
                    onClick: () => void;
                };
                item: any;
                i: number;
            }) => vue.VNodeChild) | undefined;
        };
        'v-slots'?: {
            day?: false | ((arg: {
                props: {
                    onClick: () => void;
                };
                item: any;
                i: number;
            }) => vue.VNodeChild) | undefined;
        } | undefined;
    } & {
        "v-slot:day"?: false | ((arg: {
            props: {
                onClick: () => void;
            };
            item: any;
            i: number;
        }) => vue.VNodeChild) | undefined;
    } & {
        "onUpdate:modelValue"?: ((date: unknown) => any) | undefined;
        "onUpdate:month"?: ((date: number) => any) | undefined;
        "onUpdate:year"?: ((date: number) => any) | undefined;
    }, () => JSX.Element, {}, {}, {}, {
        disabled: boolean;
        showAdjacentMonths: boolean;
        weekdays: number[];
        hideWeekdays: boolean;
        showWeek: boolean;
    }>;
    __isFragment?: undefined;
    __isTeleport?: undefined;
    __isSuspense?: undefined;
} & vue.ComponentOptionsBase<{
    disabled: boolean;
    showAdjacentMonths: boolean;
    weekdays: number[];
    hideWeekdays: boolean;
    showWeek: boolean;
} & {
    max?: unknown;
    min?: unknown;
    color?: string | undefined;
    multiple?: number | boolean | "range" | (string & {}) | undefined;
    month?: string | number | undefined;
    year?: string | number | undefined;
    modelValue?: unknown[] | undefined;
    allowedDates?: unknown[] | ((date: unknown) => boolean) | undefined;
    displayValue?: unknown;
} & {
    $children?: {} | vue.VNodeChild | {
        day?: ((arg: {
            props: {
                onClick: () => void;
            };
            item: any;
            i: number;
        }) => vue.VNodeChild) | undefined;
    };
    'v-slots'?: {
        day?: false | ((arg: {
            props: {
                onClick: () => void;
            };
            item: any;
            i: number;
        }) => vue.VNodeChild) | undefined;
    } | undefined;
} & {
    "v-slot:day"?: false | ((arg: {
        props: {
            onClick: () => void;
        };
        item: any;
        i: number;
    }) => vue.VNodeChild) | undefined;
} & {
    "onUpdate:modelValue"?: ((date: unknown) => any) | undefined;
    "onUpdate:month"?: ((date: number) => any) | undefined;
    "onUpdate:year"?: ((date: number) => any) | undefined;
}, () => JSX.Element, unknown, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {
    'update:modelValue': (date: unknown) => true;
    'update:month': (date: number) => true;
    'update:year': (date: number) => true;
}, string, {
    disabled: boolean;
    showAdjacentMonths: boolean;
    weekdays: number[];
    hideWeekdays: boolean;
    showWeek: boolean;
}, {}, string, vue.SlotsType<Partial<{
    day: (arg: {
        props: {
            onClick: () => void;
        };
        item: any;
        i: number;
    }) => vue.VNode<vue.RendererNode, vue.RendererElement, {
        [key: string]: any;
    }>[];
}>>> & vue.VNodeProps & vue.AllowedComponentProps & vue.ComponentCustomProps & FilterPropsOptions<{
    allowedDates: PropType<unknown[] | ((date: unknown) => boolean)>;
    disabled: BooleanConstructor;
    displayValue: PropType<unknown>;
    modelValue: PropType<unknown[]>;
    month: (StringConstructor | NumberConstructor)[];
    max: PropType<unknown>;
    min: PropType<unknown>;
    showAdjacentMonths: BooleanConstructor;
    year: (StringConstructor | NumberConstructor)[];
    weekdays: {
        type: {
            (arrayLength: number): number[];
            (...items: number[]): number[];
            new (arrayLength: number): number[];
            new (...items: number[]): number[];
            isArray(arg: any): arg is any[];
            readonly prototype: any[];
            from<T>(arrayLike: ArrayLike<T>): T[];
            from<T_1, U>(arrayLike: ArrayLike<T_1>, mapfn: (v: T_1, k: number) => U, thisArg?: any): U[];
            from<T_2>(iterable: Iterable<T_2> | ArrayLike<T_2>): T_2[];
            from<T_3, U_1>(iterable: Iterable<T_3> | ArrayLike<T_3>, mapfn: (v: T_3, k: number) => U_1, thisArg?: any): U_1[];
            of<T_4>(...items: T_4[]): T_4[];
            readonly [Symbol.species]: ArrayConstructor;
        };
        default: () => number[];
    };
    color: StringConstructor;
    hideWeekdays: BooleanConstructor;
    multiple: PropType<number | boolean | "range" | (string & {})>;
    showWeek: BooleanConstructor;
}, vue.ExtractPropTypes<{
    allowedDates: PropType<unknown[] | ((date: unknown) => boolean)>;
    disabled: BooleanConstructor;
    displayValue: PropType<unknown>;
    modelValue: PropType<unknown[]>;
    month: (StringConstructor | NumberConstructor)[];
    max: PropType<unknown>;
    min: PropType<unknown>;
    showAdjacentMonths: BooleanConstructor;
    year: (StringConstructor | NumberConstructor)[];
    weekdays: {
        type: {
            (arrayLength: number): number[];
            (...items: number[]): number[];
            new (arrayLength: number): number[];
            new (...items: number[]): number[];
            isArray(arg: any): arg is any[];
            readonly prototype: any[];
            from<T>(arrayLike: ArrayLike<T>): T[];
            from<T_1, U>(arrayLike: ArrayLike<T_1>, mapfn: (v: T_1, k: number) => U, thisArg?: any): U[];
            from<T_2>(iterable: Iterable<T_2> | ArrayLike<T_2>): T_2[];
            from<T_3, U_1>(iterable: Iterable<T_3> | ArrayLike<T_3>, mapfn: (v: T_3, k: number) => U_1, thisArg?: any): U_1[];
            of<T_4>(...items: T_4[]): T_4[];
            readonly [Symbol.species]: ArrayConstructor;
        };
        default: () => number[];
    };
    color: StringConstructor;
    hideWeekdays: BooleanConstructor;
    multiple: PropType<number | boolean | "range" | (string & {})>;
    showWeek: BooleanConstructor;
}>>;
type VDatePickerMonth = InstanceType<typeof VDatePickerMonth>;

declare const VDatePickerMonths: {
    new (...args: any[]): vue.CreateComponentPublicInstance<{} & {
        height?: string | number | undefined;
        color?: string | undefined;
        modelValue?: number | undefined;
    } & {
        $children?: {} | vue.VNodeChild | {
            month?: ((arg: {
                month: {
                    text: string;
                    value: number;
                };
                i: number;
                props: {
                    onClick: () => void;
                };
            }) => vue.VNodeChild) | undefined;
        };
        'v-slots'?: {
            month?: false | ((arg: {
                month: {
                    text: string;
                    value: number;
                };
                i: number;
                props: {
                    onClick: () => void;
                };
            }) => vue.VNodeChild) | undefined;
        } | undefined;
    } & {
        "v-slot:month"?: false | ((arg: {
            month: {
                text: string;
                value: number;
            };
            i: number;
            props: {
                onClick: () => void;
            };
        }) => vue.VNodeChild) | undefined;
    } & {
        "onUpdate:modelValue"?: ((date: any) => any) | undefined;
    }, {}, unknown, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {
        'update:modelValue': (date: any) => boolean;
    }, vue.VNodeProps & vue.AllowedComponentProps & vue.ComponentCustomProps & {} & {
        height?: string | number | undefined;
        color?: string | undefined;
        modelValue?: number | undefined;
    } & {
        $children?: {} | vue.VNodeChild | {
            month?: ((arg: {
                month: {
                    text: string;
                    value: number;
                };
                i: number;
                props: {
                    onClick: () => void;
                };
            }) => vue.VNodeChild) | undefined;
        };
        'v-slots'?: {
            month?: false | ((arg: {
                month: {
                    text: string;
                    value: number;
                };
                i: number;
                props: {
                    onClick: () => void;
                };
            }) => vue.VNodeChild) | undefined;
        } | undefined;
    } & {
        "v-slot:month"?: false | ((arg: {
            month: {
                text: string;
                value: number;
            };
            i: number;
            props: {
                onClick: () => void;
            };
        }) => vue.VNodeChild) | undefined;
    } & {
        "onUpdate:modelValue"?: ((date: any) => any) | undefined;
    }, {}, true, {}, vue.SlotsType<Partial<{
        month: (arg: {
            month: {
                text: string;
                value: number;
            };
            i: number;
            props: {
                onClick: () => void;
            };
        }) => vue.VNode<vue.RendererNode, vue.RendererElement, {
            [key: string]: any;
        }>[];
    }>>, {
        P: {};
        B: {};
        D: {};
        C: {};
        M: {};
        Defaults: {};
    }, {} & {
        height?: string | number | undefined;
        color?: string | undefined;
        modelValue?: number | undefined;
    } & {
        $children?: {} | vue.VNodeChild | {
            month?: ((arg: {
                month: {
                    text: string;
                    value: number;
                };
                i: number;
                props: {
                    onClick: () => void;
                };
            }) => vue.VNodeChild) | undefined;
        };
        'v-slots'?: {
            month?: false | ((arg: {
                month: {
                    text: string;
                    value: number;
                };
                i: number;
                props: {
                    onClick: () => void;
                };
            }) => vue.VNodeChild) | undefined;
        } | undefined;
    } & {
        "v-slot:month"?: false | ((arg: {
            month: {
                text: string;
                value: number;
            };
            i: number;
            props: {
                onClick: () => void;
            };
        }) => vue.VNodeChild) | undefined;
    } & {
        "onUpdate:modelValue"?: ((date: any) => any) | undefined;
    }, {}, {}, {}, {}, {}>;
    __isFragment?: undefined;
    __isTeleport?: undefined;
    __isSuspense?: undefined;
} & vue.ComponentOptionsBase<{} & {
    height?: string | number | undefined;
    color?: string | undefined;
    modelValue?: number | undefined;
} & {
    $children?: {} | vue.VNodeChild | {
        month?: ((arg: {
            month: {
                text: string;
                value: number;
            };
            i: number;
            props: {
                onClick: () => void;
            };
        }) => vue.VNodeChild) | undefined;
    };
    'v-slots'?: {
        month?: false | ((arg: {
            month: {
                text: string;
                value: number;
            };
            i: number;
            props: {
                onClick: () => void;
            };
        }) => vue.VNodeChild) | undefined;
    } | undefined;
} & {
    "v-slot:month"?: false | ((arg: {
        month: {
            text: string;
            value: number;
        };
        i: number;
        props: {
            onClick: () => void;
        };
    }) => vue.VNodeChild) | undefined;
} & {
    "onUpdate:modelValue"?: ((date: any) => any) | undefined;
}, {}, unknown, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {
    'update:modelValue': (date: any) => boolean;
}, string, {}, {}, string, vue.SlotsType<Partial<{
    month: (arg: {
        month: {
            text: string;
            value: number;
        };
        i: number;
        props: {
            onClick: () => void;
        };
    }) => vue.VNode<vue.RendererNode, vue.RendererElement, {
        [key: string]: any;
    }>[];
}>>> & vue.VNodeProps & vue.AllowedComponentProps & vue.ComponentCustomProps & FilterPropsOptions<{
    color: StringConstructor;
    height: (StringConstructor | NumberConstructor)[];
    modelValue: NumberConstructor;
}, vue.ExtractPropTypes<{
    color: StringConstructor;
    height: (StringConstructor | NumberConstructor)[];
    modelValue: NumberConstructor;
}>>;
type VDatePickerMonths = InstanceType<typeof VDatePickerMonths>;

declare const VDatePickerYears: {
    new (...args: any[]): vue.CreateComponentPublicInstance<{} & {
        max?: unknown;
        height?: string | number | undefined;
        min?: unknown;
        color?: string | undefined;
        modelValue?: number | undefined;
    } & {
        $children?: {} | vue.VNodeChild | {
            year?: ((arg: {
                year: {
                    text: string;
                    value: number;
                };
                i: number;
                props: {
                    active: boolean;
                    color?: string;
                    rounded: boolean;
                    text: string;
                    variant: 'flat' | 'text';
                    onClick: () => void;
                };
            }) => vue.VNodeChild) | undefined;
        };
        'v-slots'?: {
            year?: false | ((arg: {
                year: {
                    text: string;
                    value: number;
                };
                i: number;
                props: {
                    active: boolean;
                    color?: string;
                    rounded: boolean;
                    text: string;
                    variant: 'flat' | 'text';
                    onClick: () => void;
                };
            }) => vue.VNodeChild) | undefined;
        } | undefined;
    } & {
        "v-slot:year"?: false | ((arg: {
            year: {
                text: string;
                value: number;
            };
            i: number;
            props: {
                active: boolean;
                color?: string;
                rounded: boolean;
                text: string;
                variant: 'flat' | 'text';
                onClick: () => void;
            };
        }) => vue.VNodeChild) | undefined;
    } & {
        "onUpdate:modelValue"?: ((year: number) => any) | undefined;
    }, {}, unknown, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {
        'update:modelValue': (year: number) => boolean;
    }, vue.VNodeProps & vue.AllowedComponentProps & vue.ComponentCustomProps & {} & {
        max?: unknown;
        height?: string | number | undefined;
        min?: unknown;
        color?: string | undefined;
        modelValue?: number | undefined;
    } & {
        $children?: {} | vue.VNodeChild | {
            year?: ((arg: {
                year: {
                    text: string;
                    value: number;
                };
                i: number;
                props: {
                    active: boolean;
                    color?: string;
                    rounded: boolean;
                    text: string;
                    variant: 'flat' | 'text';
                    onClick: () => void;
                };
            }) => vue.VNodeChild) | undefined;
        };
        'v-slots'?: {
            year?: false | ((arg: {
                year: {
                    text: string;
                    value: number;
                };
                i: number;
                props: {
                    active: boolean;
                    color?: string;
                    rounded: boolean;
                    text: string;
                    variant: 'flat' | 'text';
                    onClick: () => void;
                };
            }) => vue.VNodeChild) | undefined;
        } | undefined;
    } & {
        "v-slot:year"?: false | ((arg: {
            year: {
                text: string;
                value: number;
            };
            i: number;
            props: {
                active: boolean;
                color?: string;
                rounded: boolean;
                text: string;
                variant: 'flat' | 'text';
                onClick: () => void;
            };
        }) => vue.VNodeChild) | undefined;
    } & {
        "onUpdate:modelValue"?: ((year: number) => any) | undefined;
    }, {}, true, {}, vue.SlotsType<Partial<{
        year: (arg: {
            year: {
                text: string;
                value: number;
            };
            i: number;
            props: {
                active: boolean;
                color?: string;
                rounded: boolean;
                text: string;
                variant: 'flat' | 'text';
                onClick: () => void;
            };
        }) => vue.VNode<vue.RendererNode, vue.RendererElement, {
            [key: string]: any;
        }>[];
    }>>, {
        P: {};
        B: {};
        D: {};
        C: {};
        M: {};
        Defaults: {};
    }, {} & {
        max?: unknown;
        height?: string | number | undefined;
        min?: unknown;
        color?: string | undefined;
        modelValue?: number | undefined;
    } & {
        $children?: {} | vue.VNodeChild | {
            year?: ((arg: {
                year: {
                    text: string;
                    value: number;
                };
                i: number;
                props: {
                    active: boolean;
                    color?: string;
                    rounded: boolean;
                    text: string;
                    variant: 'flat' | 'text';
                    onClick: () => void;
                };
            }) => vue.VNodeChild) | undefined;
        };
        'v-slots'?: {
            year?: false | ((arg: {
                year: {
                    text: string;
                    value: number;
                };
                i: number;
                props: {
                    active: boolean;
                    color?: string;
                    rounded: boolean;
                    text: string;
                    variant: 'flat' | 'text';
                    onClick: () => void;
                };
            }) => vue.VNodeChild) | undefined;
        } | undefined;
    } & {
        "v-slot:year"?: false | ((arg: {
            year: {
                text: string;
                value: number;
            };
            i: number;
            props: {
                active: boolean;
                color?: string;
                rounded: boolean;
                text: string;
                variant: 'flat' | 'text';
                onClick: () => void;
            };
        }) => vue.VNodeChild) | undefined;
    } & {
        "onUpdate:modelValue"?: ((year: number) => any) | undefined;
    }, {}, {}, {}, {}, {}>;
    __isFragment?: undefined;
    __isTeleport?: undefined;
    __isSuspense?: undefined;
} & vue.ComponentOptionsBase<{} & {
    max?: unknown;
    height?: string | number | undefined;
    min?: unknown;
    color?: string | undefined;
    modelValue?: number | undefined;
} & {
    $children?: {} | vue.VNodeChild | {
        year?: ((arg: {
            year: {
                text: string;
                value: number;
            };
            i: number;
            props: {
                active: boolean;
                color?: string;
                rounded: boolean;
                text: string;
                variant: 'flat' | 'text';
                onClick: () => void;
            };
        }) => vue.VNodeChild) | undefined;
    };
    'v-slots'?: {
        year?: false | ((arg: {
            year: {
                text: string;
                value: number;
            };
            i: number;
            props: {
                active: boolean;
                color?: string;
                rounded: boolean;
                text: string;
                variant: 'flat' | 'text';
                onClick: () => void;
            };
        }) => vue.VNodeChild) | undefined;
    } | undefined;
} & {
    "v-slot:year"?: false | ((arg: {
        year: {
            text: string;
            value: number;
        };
        i: number;
        props: {
            active: boolean;
            color?: string;
            rounded: boolean;
            text: string;
            variant: 'flat' | 'text';
            onClick: () => void;
        };
    }) => vue.VNodeChild) | undefined;
} & {
    "onUpdate:modelValue"?: ((year: number) => any) | undefined;
}, {}, unknown, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {
    'update:modelValue': (year: number) => boolean;
}, string, {}, {}, string, vue.SlotsType<Partial<{
    year: (arg: {
        year: {
            text: string;
            value: number;
        };
        i: number;
        props: {
            active: boolean;
            color?: string;
            rounded: boolean;
            text: string;
            variant: 'flat' | 'text';
            onClick: () => void;
        };
    }) => vue.VNode<vue.RendererNode, vue.RendererElement, {
        [key: string]: any;
    }>[];
}>>> & vue.VNodeProps & vue.AllowedComponentProps & vue.ComponentCustomProps & FilterPropsOptions<{
    color: StringConstructor;
    height: (StringConstructor | NumberConstructor)[];
    min: PropType<unknown>;
    max: PropType<unknown>;
    modelValue: NumberConstructor;
}, vue.ExtractPropTypes<{
    color: StringConstructor;
    height: (StringConstructor | NumberConstructor)[];
    min: PropType<unknown>;
    max: PropType<unknown>;
    modelValue: NumberConstructor;
}>>;
type VDatePickerYears = InstanceType<typeof VDatePickerYears>;

export { VDatePicker, VDatePickerControls, VDatePickerHeader, VDatePickerMonth, VDatePickerMonths, VDatePickerYears };
