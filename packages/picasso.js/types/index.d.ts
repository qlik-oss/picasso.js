// File generated automatically by "@scriptappy/to-dts"; DO NOT EDIT.
export default picassojs;

/**
 * picasso.js entry point
 * @param cfg
 */
declare function picassojs(cfg?: {
    renderer?: {
        prio: string[];
    };
    logger?: {
        level: 0 | 1 | 2 | 3 | 4;
    };
    style?: object;
    palettes?: object[];
}): typeof picassojs;

declare namespace picassojs {
    /**
     * @param definition
     */
    function chart(definition: picassojs.ChartDefinition): picassojs.Chart;

    /**
     * Component registry
     */
    const component: picassojs.registry;

    /**
     * Data registry
     */
    const data: picassojs.registry;

    /**
     * Formatter registry
     */
    const formatter: picassojs.registry;

    /**
     * Interaction registry
     */
    const interaction: picassojs.registry;

    /**
     * Renderer registry
     */
    const renderer: picassojs.registry;

    /**
     * Scale registry
     */
    const scale: picassojs.registry;

    /**
     * Plugin registry
     * @param plugin
     * @param options
     */
    function use(plugin: picassojs.plugin, options?: object): void;

    /**
     * picasso.js version
     */
    const version: string;

}

declare namespace picassojs {
    /**
     * A brush context
     */
    interface Brush {
        (): void;
        /**
         * Add and remove values in a single operation
         * almost the same as calling addValues and removeValues but only triggers one 'update' event
         * 
         * If the state of the brush changes, an 'update' event is emitted.
         * @param addItems Items to add
         * @param removeItems Items to remove
         */
        addAndRemoveValues(addItems: object[], removeItems: object[]): void;
        /**
         * Adds an alias to the given key
         * @param key Value to be replaced
         * @param alias Value to replace key with
         */
        addKeyAlias(key: string, alias: string): void;
        /**
         * Adds a numeric range to this brush context
         * @param key An identifier that represents the data source of the range
         * @param range The range to add to this brush
         */
        addRange(key: string, range: {
            min: number;
            max: number;
        }): void;
        /**
         * @param items Items containing the ranges to remove
         */
        addRanges(items: {
        }[]): void;
        /**
         * Adds a primitive value to this brush context
         * 
         * If this brush context is not started, a 'start' event is emitted.
         * If the state of the brush changes, ie. if the added value does not already exist, an 'update' event is emitted.
         * @param key An identifier that represents the data source of the value
         * @param value The value to add
         */
        addValue(key: string, value: string | number): void;
        /**
         * @param items Items to add
         */
        addValues(items: object[]): void;
        /**
         * Returns all brushes within this context
         */
        brushes(): object;
        /**
         * Clears this brush context
         */
        clear(): void;
        /**
         * Configure the brush instance.
         * @param config
         */
        configure(config: picassojs.BrushConfig): void;
        /**
         * Checks if a range segment is contained within this brush context
         * 
         * Returns true if the range segment exists for the provided key, returns false otherwise.
         * @param key An identifier that represents the data source of the value
         * @param range The range to check for
         */
        containsRange(key: string, range: {
            min: number;
            max: number;
        }): boolean;
        /**
         * Checks if a value is contained within a range in this brush context
         * 
         * Returns true if the values exists for the provided key, returns false otherwise.
         * @param key An identifier that represents the data source of the value
         * @param value The value to check for
         */
        containsRangeValue(key: string, value: number): boolean;
        /**
         * Checks if a certain value exists in this brush context
         * 
         * Returns true if the values exists for the provided key, returns false otherwise.
         * @param key An identifier that represents the data source of the value
         * @param value The value to check for
         */
        containsValue(key: string, value: string | number): boolean;
        /**
         * Ends this brush context
         * 
         * Ends this brush context and emits an 'end' event if it is not already ended.
         * @param args arguments to be passed to 'end' listeners
         */
        end(...args: any): void;
        /**
         * Adds an event interceptor
         * @param name Name of the event to intercept
         * @param ic Handler to call before event is triggered
         */
        intercept(name: string, ic: ()=>void): void;
        /**
         * Checks if this brush is activated
         * 
         * Returns true if started, false otherwise
         */
        isActive(): boolean;
        /**
         * Link this brush to another brush instance.
         * 
         * When linked, the `target` will receive updates whenever this brush changes.
         * @param target The brush instance to link to
         */
        link(target: picassojs.Brush): void;
        /**
         * Removes all interceptors
         * @param name Name of the event to remove interceptors for. If not provided, removes all interceptors.
         */
        removeAllInterceptors(name?: string): void;
        /**
         * Removes an interceptor
         * @param name Name of the event to intercept
         * @param ic Handler to remove
         */
        removeInterceptor(name: string, ic: ()=>void): void;
        /**
         * Removes an alias
         * 
         * This will only remove the key to alias mapping for new manipulations of the brush,
         * no changes will be made to the current state of this brush.
         * @param key Value to remove as alias
         */
        removeKeyAlias(key: string): void;
        /**
         * Removes a numeric range from this brush context
         * @param key An identifier that represents the data source of the range
         * @param range The range to remove from this brush
         */
        removeRange(key: string, range: {
            min: number;
            max: number;
        }): void;
        /**
         * @param items Items containing the ranges to remove
         */
        removeRanges(items: object[]): void;
        /**
         * Removes a primitive values from this brush context
         * 
         * If the state of the brush changes, ie. if the removed value does exist, an 'update' event is emitted.
         * @param key An identifier that represents the data source of the value
         * @param value The value to remove
         */
        removeValue(key: string, value: string | number): void;
        /**
         * @param items Items to remove
         */
        removeValues(items: object[]): void;
        /**
         * Sets a numeric range to this brush context
         * 
         * Overwrites any active ranges identified by `key`
         * @param key An identifier that represents the data source of the range
         * @param range The range to set on this brush
         */
        setRange(key: string, range: {
            min: number;
            max: number;
        }): void;
        /**
         * @param items Items containing the ranges to set
         */
        setRanges(items: object[]): void;
        /**
         * @param items Items to set
         */
        setValues(items: object[]): void;
        /**
         * Starts this brush context
         * 
         * Starts this brush context and emits a 'start' event if it is not already started.
         * @param args arguments to be passed to 'start' listeners
         */
        start(...args: any): void;
        /**
         * Toggles a numeric range in this brush context
         * 
         * Removes the range if it's already contained within the given identifier,
         * otherwise the given range is added to the brush.
         * @param key An identifier that represents the data source of the range
         * @param range The range to toggle in this brush
         */
        toggleRange(key: string, range: {
            min: number;
            max: number;
        }): void;
        /**
         * @param items Items containing the ranges to toggle
         */
        toggleRanges(items: object[]): void;
        /**
         * Toggles a primitive value in this brush context
         * 
         * If the given value exists in this brush context, it will be removed. If it does not exist it will be added.
         * @param key An identifier that represents the data source of the value
         * @param value The value to toggle
         */
        toggleValue(key: string, value: string | number): void;
        /**
         * @param items Items to toggle
         */
        toggleValues(items: object[]): void;
        /**
         * Triggered when this brush is deactivated
         * @param event
         * @param listener
         */
        on(event: "end", listener: ()=>void): void;
        /**
         * Triggered when this brush is activated
         * @param event
         * @param listener
         */
        on(event: "start", listener: ()=>void): void;
        /**
         * Triggered when this brush is updated
         * @param event
         * @param listener
         */
        on(event: "update", listener: (added: object[], removed: object[])=>void): void;
    }

    type BrushConfig = {
        ranges?: picassojs.BrushConfig.Ranges[];
    };

    namespace BrushConfig {
        type Ranges = {
            includeMax?: boolean;
            includeMin?: boolean;
            key?: string;
        };

    }

    type BrushConsumeSettings = {
        context?: string;
        data?: string[];
        mode?: string;
        filter?: ()=>void;
        style?: {
            active?: object;
            inactive?: object;
        };
    };

    type BrushTargetConfig = {
        key: string;
        contexts?: string[];
        data?: string[];
        action?: string;
    };

    type BrushTriggerSettings = {
        on?: string;
        action?: string;
        contexts?: string[];
        data?: string[];
        propagation?: string;
        globalPropagation?: string;
        touchRadius?: number;
        mouseRadius?: number;
    };

    /**
     * Create a new canvas renderer
     */
    type canvasRendererFactory = (sceneFn?: ()=>void)=>picassojs.Renderer;

    /**
     * Chart instance
     */
    interface Chart {
        (): void;
        /**
         * Get or create brush context for this chart
         * @param name Name of the brush context. If no match is found, a new brush context is created and returned.
         */
        brush(name: string): picassojs.Brush;
        /**
         * Brush data by providing a collection of data bound shapes.
         * @param shapes An array of data bound shapes.
         * @param config Options
         */
        brushFromShapes(shapes: picassojs.SceneNode[], config: {
            components: picassojs.BrushTargetConfig[];
        }): void;
        /**
         * Get a component context
         * @param key Component key
         */
        component(key: string): picassojs.Component;
        /**
         * Get components overlapping a point.
         * @param p Point with x- and y-coordinate. The coordinate is relative to the browser viewport.
         */
        componentsFromPoint(p: picassojs.Point): picassojs.Component[];
        /**
         * Get
         * @param key Get the dataset identified by `key`
         */
        dataset(key: string): picassojs.Dataset;
        /**
         * Destroy the chart instance.
         */
        destroy(): void;
        /**
         * Get all nodes matching the provided selector
         * @param selector CSS selector [type, attribute, universal, class]
         */
        findShapes(selector: string): picassojs.SceneNode[];
        /**
         * Get or create a formatter for this chart
         * @param v Formatter reference or formatter options
         */
        formatter(v: string | object): picassojs.formatter;
        /**
         * Get all registered formatters
         */
        formatters(): object;
        /**
         * Get all shapes associated with the provided context
         * @param context The brush context
         * @param mode Property comparison mode.
         * @param props Which specific data properties to compare
         * @param key Which component to get shapes from. Default gives shapes from all components.
         */
        getAffectedShapes(context: string, mode: string, props: string[], key: string): object[];
        interactions: {
            instances: picassojs.Interaction[];
            /**
             * Disable all interaction instances
             */
            off(): void;
            /**
             * Enable all interaction instances
             */
            on(): void;
        };
        /**
         * Layout the chart with new settings and / or data
         * @param def New chart definition
         */
        layoutComponents(def?: {
            data?: picassojs.DataSource[] | picassojs.DataSource;
            settings?: picassojs.ChartSettings;
            excludeFromUpdate?: string[];
        }): void;
        /**
         * Get or create a scale for this chart
         * @param v Scale reference or scale options
         */
        scale(v: string | object): picassojs.Scale;
        /**
         * Get all registered scales
         */
        scales(): object;
        /**
         * Get all nodes colliding with a geometrical shape (circle, line, rectangle, point, polygon, geopolygon).
         * 
         * The input shape is identified based on the geometrical attributes in the following order: circle => line => rectangle => point => polygon => geopolygon.
         * Note that not all nodes on a scene have collision detection enabled.
         * @param shape A geometrical shape. Coordinates are relative to the top-left corner of the chart instance container.
         * @param opts Options
         */
        shapesAt(shape: picassojs.Line | picassojs.Rect | picassojs.Point | picassojs.Circle, opts: {
            components?: {
            }[];
            propagation?: string;
        }): picassojs.SceneNode[];
        /**
         * @param val Toggle brushing on or off. If value is omitted, a toggle action is applied to the current state.
         */
        toggleBrushing(val?: boolean): void;
        /**
         * Update the chart with new settings and / or data
         * @param def New chart definition
         */
        update(def?: {
            data?: picassojs.DataSource[] | picassojs.DataSource;
            settings?: picassojs.ChartSettings;
            partialData?: boolean;
            excludeFromUpdate?: string[];
        }): void;
    }

    type ChartDefinition = {
        beforeDestroy?: picassojs.ChartDefinition.beforeDestroy;
        beforeMount?: picassojs.ChartDefinition.beforeMount;
        beforeRender?: picassojs.ChartDefinition.beforeRender;
        beforeUpdate?: picassojs.ChartDefinition.beforeUpdate;
        created?: picassojs.ChartDefinition.created;
        destroyed?: picassojs.ChartDefinition.destroyed;
        mounted?: picassojs.ChartDefinition.mounted;
        updated?: picassojs.ChartDefinition.updated;
        data: picassojs.DataSource[] | picassojs.DataSource;
        element: HTMLElement;
        settings: picassojs.ChartSettings;
    };

    namespace ChartDefinition {
        /**
         * Called before the chart has been destroyed
         */
        type beforeDestroy = ()=>void;

        /**
         * Called before the chart has been mounted
         */
        type beforeMount = ()=>void;

        /**
         * Called before the chart has been rendered
         */
        type beforeRender = ()=>void;

        /**
         * Called before the chart has been updated
         */
        type beforeUpdate = ()=>void;

        /**
         * Called when the chart has been created
         */
        type created = ()=>void;

        /**
         * Called after the chart has been destroyed
         */
        type destroyed = ()=>void;

        /**
         * Called after the chart has been mounted
         */
        type mounted = (element: HTMLElement)=>void;

        /**
         * Called after the chart has been updated
         */
        type updated = ()=>void;

    }

    type ChartSettings = {
        components?: picassojs.ComponentTypes[];
        scales?: object;
        formatters?: object;
        strategy?: picassojs.DockLayoutSettings;
        interactions?: picassojs.InteractionSettings[];
        collections?: picassojs.CollectionSettings[];
    };

    type Circle = {
        cx: number;
        cy: number;
        r: number;
    };

    interface CollectionSettings {
        key: string;
        data: picassojs.DataExtraction;
    }

    type Component = {
        type: string;
        key: string;
    };

    type ComponentAxis = picassojs.ComponentSettings & {
        type: "axis";
        scale: string;
        settings?: picassojs.ComponentAxis.DiscreteSettings | picassojs.ComponentAxis.ContinuousSettings;
    };

    namespace ComponentAxis {
        type ContinuousSettings = {
            align?: string;
            labels: {
                align?: number;
                filterOverlapping?: boolean;
                margin?: number;
                maxLengthPx?: number;
                minLengthPx?: number;
                offset?: number;
                show?: boolean;
            };
            line: {
                show?: boolean;
            };
            minorTicks: {
                margin?: number;
                show?: boolean;
                tickSize?: number;
            };
            paddingEnd?: number;
            paddingStart?: number;
            ticks: {
                margin?: number;
                show?: boolean;
                tickSize?: number;
            };
        };

        type DiscreteSettings = {
            align?: string;
            labels: {
                align?: number;
                filterOverlapping?: boolean;
                margin?: number;
                maxEdgeBleed?: number;
                maxGlyphCount?: number;
                maxLengthPx?: number;
                minLengthPx?: number;
                mode?: string;
                offset?: number;
                show?: boolean;
                tiltAngle?: number;
                tiltThreshold?: number;
            };
            line: {
                show?: boolean;
            };
            paddingEnd?: number;
            paddingStart?: number;
            ticks: {
                margin?: number;
                show?: boolean;
                tickSize?: number;
            };
        };

    }

    type ComponentBox = picassojs.ComponentSettings & {
        type: "box";
        data: {
            min?: number;
            max?: number;
            start?: number;
            end?: number;
            med?: number;
        };
        settings: {
            major: {
                scale: string;
                ref?: string | picassojs.ComponentBox.MajorReference;
            };
            minor: {
                scale: string;
            };
            orientation?: string;
            box?: {
                show?: boolean;
                fill?: string;
                stroke?: string;
                strokeWidth?: number;
                strokeLinejoin?: string;
                width?: number;
                maxWidthPx?: number;
                minWidthPx?: number;
                minHeightPx?: number;
            };
            line?: {
                show?: boolean;
                stroke?: string;
                strokeWidth?: number;
            };
            whisker?: {
                show?: boolean;
                stroke?: string;
                strokeWidth?: number;
                width?: number;
            };
            median?: {
                show?: boolean;
                stroke?: string;
                strokeWidth?: number;
            };
            oob?: {
                show?: boolean;
                type?: string;
                fill?: string;
                stroke?: string;
                strokeWidth?: number;
                size?: number;
                sides?: number;
            };
        };
    };

    namespace ComponentBox {
        type MajorReference = {
            start: string;
            end: string;
        };

    }

    type ComponentBrushArea = picassojs.ComponentSettings & {
        type: "brush-area";
        settings: {
            brush: {
                components: picassojs.BrushTargetConfig[];
            };
        };
    };

    type ComponentBrushAreaDir = picassojs.ComponentSettings & {
        type: "brush-area-dir";
        settings: {
            brush: {
                components: picassojs.BrushTargetConfig[];
            };
            direction?: string;
            bubbles?: {
                show?: boolean;
                align?: string;
                label?: ()=>void;
            };
            target?: {
                components?: string[];
            };
        };
    };

    type ComponentBrushLasso = picassojs.ComponentSettings & {
        type: "brush-lasso";
        settings: {
            lasso?: {
                fill?: string;
                stroke?: string;
                strokeWidth?: number;
                opacity?: number;
                strokeDasharray?: number;
            };
            snapIndicator?: {
                threshold?: number;
                strokeDasharray?: string;
                stroke?: string;
                strokeWidth?: number;
                opacity?: number;
            };
            startPoint?: {
                r?: number;
                stroke?: string;
                strokeWidth?: number;
                opacity?: number;
            };
            brush?: {
                components: {
                }[];
            };
        };
    };

    type ComponentBrushRange = picassojs.ComponentSettings & {
        type: "brush-range";
        settings: {
            brush: string | object;
            scale: string;
            direction?: string;
            bubbles?: {
                show?: boolean;
                align?: string;
                label?: ()=>void;
            };
            target?: {
                components?: string[];
                selector?: string;
                fillSelector?: string;
            };
        };
    };

    type ComponentContainer = picassojs.ComponentSettings & {
        type: "container";
    };

    type ComponentGridLine = picassojs.ComponentSettings & {
        type: "grid-line";
        settings: {
            x: {
                scale: string;
            };
            y: {
                scale: string;
            };
            ticks?: {
                show?: boolean;
                stroke?: string;
                strokeWidth?: number;
                strokeDasharray?: string;
            };
            minorTicks?: {
                show?: boolean;
                stroke?: string;
                strokeWidth?: number;
                strokeDasharray?: string;
            };
        };
    };

    type ComponentLabels = picassojs.ComponentSettings & {
        type: "labels";
        settings: {
            sources: picassojs.ComponentLabels.Source[];
        };
    };

    namespace ComponentLabels {
        type BarsLabelStrategy = {
            type: "bar";
            settings: {
                direction?: string | (()=>void);
                orientation?: string;
                fontFamily?: string;
                fontSize?: number;
                labels: {
                }[];
            };
        };

        type RowsLabelStrategy = {
            type: "rows";
            settings: {
                fontFamily?: string;
                fontSize?: number;
                justify?: number;
                padding?: number;
                labels: {
                }[];
            };
        };

        type SlicesLabelStrategy = {
            type: "slice";
            settings: {
                direction?: string | (()=>void);
                fontFamily?: string;
                fontSize?: number;
                labels: {
                }[];
            };
        };

        type Source = {
            component: string;
            selector: string;
            strategy: picassojs.ComponentLabels.BarsLabelStrategy | picassojs.ComponentLabels.RowsLabelStrategy | picassojs.ComponentLabels.SlicesLabelStrategy;
        };

    }

    type ComponentLegendCat = picassojs.ComponentSettings & {
        type: "legend-cat";
        scale: string;
        settings?: {
            item?: {
                align?: number;
                justify?: number;
                label?: {
                    fontFamily?: string;
                    fontSize?: string;
                    lineHeight?: number;
                    maxLines?: number;
                    maxWidth?: number;
                    wordBreak?: string;
                };
                shape?: {
                    size?: number;
                    type?: string;
                };
                show?: boolean;
            };
            layout?: {
                direction?: string;
                scrollOffset?: number;
                size?: number;
            };
            navigation?: {
                button?: {
                    class?: object;
                    content: ()=>void;
                    tabIndex?: number;
                };
                disabled?: boolean;
            };
            title?: {
                anchor: string;
                fill?: string;
                fontFamily?: string;
                fontSize?: string;
                lineHeight?: number;
                maxLines?: number;
                maxWidth?: number;
                show?: boolean;
                text?: string;
                wordBreak?: string;
            };
        };
    };

    type ComponentLegendSeq = picassojs.ComponentSettings & {
        type: "legend-seq";
        settings: {
            fill: string;
            major: string;
            size?: number;
            length?: number;
            maxLengthPx?: number;
            align?: number;
            justify?: number;
            padding?: {
                left?: number;
                right?: number;
                top?: number;
                bottom?: number;
            };
            tick?: {
                label?: ()=>void;
                fill?: string;
                fontSize?: string;
                fontFamily?: string;
                maxLengthPx?: number;
                anchor?: string;
                padding?: number;
            };
            title?: {
                show?: boolean;
                text?: string;
                fill?: string;
                fontSize?: string;
                fontFamily?: string;
                maxLengthPx?: number;
                padding?: number;
                anchor?: string;
                wordBreak?: string;
                hyphens?: string;
                maxLines?: number;
                lineHeight?: number;
            };
        };
    };

    type ComponentLine = picassojs.ComponentSettings & {
        type: "line";
        settings: {
            connect?: boolean;
            coordinates: {
                defined?: picassojs.DatumBoolean;
                layerId?: number;
                major: number;
                minor: number;
            };
            layers: {
                area: {
                    fill?: string;
                    opacity?: number;
                    show?: boolean;
                };
                curve?: string;
                line: {
                    opacity?: number;
                    show?: boolean;
                    showMinor0?: boolean;
                    stroke?: string;
                    strokeDasharray?: string;
                    strokeLinejoin?: string;
                    strokeWidth?: number;
                };
                show?: boolean;
                sort?: picassojs.ComponentLine.LayerSort;
            };
            orientation?: string;
        };
    };

    namespace ComponentLine {
        /**
         * Callback function for layer sort
         */
        type LayerSort = (a: {
            id: string;
            data: picassojs.DatumExtract[];
        }, b: {
            id: string;
            data: picassojs.DatumExtract[];
        })=>void;

    }

    type ComponentPie = picassojs.ComponentSettings & {
        type: "pie";
        settings: {
            endAngle?: number;
            slice: {
                arc?: number;
                cornerRadius?: number;
                fill?: string;
                innerRadius?: number;
                offset?: number;
                opacity?: number;
                outerRadius?: number;
                show?: boolean;
                stroke?: string;
                strokeLinejoin?: string;
                strokeWidth?: number;
            };
            startAngle?: number;
        };
    };

    type ComponentPoint = picassojs.ComponentSettings & {
        type: "point";
        settings?: {
            fill?: picassojs.DatumString;
            label?: picassojs.DatumString;
            opacity?: picassojs.DatumNumber;
            shape?: picassojs.DatumString;
            show?: picassojs.DatumBoolean;
            size?: picassojs.DatumNumber;
            sizeLimits?: {
                maxPx?: number;
                maxRelDiscrete?: number;
                maxRelExtent?: number;
                minPx?: number;
                minRelDiscrete?: number;
                minRelExtent?: number;
            };
            stroke?: picassojs.DatumString;
            strokeDasharray?: picassojs.DatumString;
            strokeLinejoin?: picassojs.DatumString;
            strokeWidth?: picassojs.DatumNumber;
            x?: picassojs.DatumNumber;
            y?: picassojs.DatumNumber;
        };
    };

    type ComponentRefLine = picassojs.ComponentSettings & {
        type: "ref-line";
        settings: {
            lines: {
                x?: picassojs.ComponentRefLine.Line[];
                y?: picassojs.ComponentRefLine.Line[];
            };
        };
    };

    namespace ComponentRefLine {
        type GenericObject = {
            fill?: string;
            stroke?: string;
            strokeWidth?: number;
            opacity?: number;
        };

        type GenericText = {
            text?: string;
            fontSize?: string;
            fontFamily?: string;
            fill?: string;
            stroke?: string;
            strokeWidth?: number;
            strokeDasharray?: string;
            opacity?: number;
        };

        type Line = {
            value: number | (()=>void);
            scale?: string;
            line?: picassojs.ComponentRefLine.GenericObject;
            label?: picassojs.ComponentRefLine.LineLabel;
            slope?: picassojs.ComponentRefLine.Slope;
        };

        type LineLabel = {
            padding: number;
            text?: string;
            fontSize?: string;
            fontFamily?: string;
            stroke?: string;
            strokeWidth?: number;
            opacity?: number;
            align?: number | string;
            vAlign?: number | string;
            maxWidth?: number;
            maxWidthPx?: number;
            background?: picassojs.ComponentRefLine.LineLabelBackground;
            showValue?: boolean;
        };

        type LineLabelBackground = {
            fill?: string;
            stroke?: string;
            strokeWidth?: number;
            opacity?: number;
        };

        type Slope = {
            value?: number;
        };

    }

    /**
     * Generic settings available to all components
     */
    interface ComponentSettings {
        type: string;
        preferredSize?: ()=>void;
        created?: ()=>void;
        beforeMount?: ()=>void;
        mounted?: ()=>void;
        beforeUpdate?: ()=>void;
        updated?: ()=>void;
        beforeRender?: ()=>void;
        beforeDestroy?: ()=>void;
        destroyed?: ()=>void;
        brush?: {
            trigger?: picassojs.BrushTriggerSettings[];
            consume?: picassojs.BrushConsumeSettings[];
            sortNodes?: ()=>void;
        };
        layout?: {
            displayOrder?: number;
            prioOrder?: number;
            minimumLayoutMode?: string | Object;
            dock?: string;
        };
        show?: boolean;
        scale?: string;
        formatter?: string;
        components?: picassojs.ComponentSettings[];
        strategy?: picassojs.DockLayoutSettings | picassojs.customLayoutFunction;
        data?: picassojs.DataExtraction | picassojs.DataFieldExtraction;
        rendererSettings?: picassojs.RendererSettings;
        key?: string;
    }

    type ComponentText = picassojs.ComponentSettings & {
        type: "text";
        text: string | (()=>void);
        settings: {
            paddingStart?: number;
            paddingEnd?: number;
            paddingLeft?: number;
            paddingRight?: number;
            anchor?: string;
            join?: string;
            maxLengthPx?: number;
        };
        style: {
            text?: {
                fontSize?: string;
                fontFamily?: string;
                fontWeight?: string;
                fill?: string;
                stroke?: string;
                strokeWidth?: number;
                opacity?: number;
            };
        };
    };

    type ComponentTooltip = picassojs.ComponentSettings & {
        type: "tooltip";
        settings: {
            /**
             * Component lifecycle hook. Called after the tooltip is hidden.
             */
            afterHide?(): void;
            /**
             * Component lifecycle hook. Called after the tooltip have been displayed.
             */
            afterShow?(): void;
            appendTo?: HTMLElement;
            arrowClass?: object;
            /**
             * Component lifecycle hook. Called before the tooltip is hidden.
             * @param ctx Callback paramater
             */
            beforeHide?(ctx: {
                element: HTMLElement;
            }): void;
            /**
             * Component lifecycle hook. Called before the tooltip is displayed.
             */
            beforeShow?(): void;
            /**
             * Callback function to generate content. Should return an array of Virtual DOM Elements.
             * @param ctx Callback context
             */
            content?(ctx: {
                data: any[];
                h: object;
            }): object[];
            contentClass?: object;
            delay?: number;
            direction?: string;
            duration?: number;
            /**
             * Callback function called for each node to extract data. Can return any type.
             * @param ctx Callback context
             */
            extract?(ctx: {
                node: picassojs.SceneNode;
            }): any;
            /**
             * Callback function to filter incoming nodes to only a set of applicable nodes. Is called as a part of the `show` event.
             * 
             * Should return an array of SceneNodes.
             * @param nodes Array of SceneNodes
             */
            filter?(nodes: picassojs.SceneNode[]): picassojs.SceneNode[];
            /**
             * Comparison function. If evaluted to true, the incoming nodes in the `show` event are ignored. If evaluated to false, any active tooltip is cleared and a new tooltip is queued.
             * 
             * The function gets two parameters, the first is the currently active set of nodes, if any, and the second is the incoming set of nodes. By default the two set of nodes are considered equal if their data attributes are the same.
             * @param prev Previous array of SceneNodes
             * @param curr Current array of SceneNodes
             */
            isEqual?(prev: picassojs.SceneNode[], curr: picassojs.SceneNode[]): boolean;
            /**
             * Component lifecycle hook. Called when the toolip is hidden. By default this deletes the tooltip element.
             * @param ctx Callback paramater
             */
            onHide?(ctx: {
                element: HTMLElement;
            }): void;
            placement?: {
                area?: number;
                dock?: string;
                offset?: number;
                type?: string;
            };
            tooltipClass?: object;
        };
    };

    type ComponentTypes = picassojs.ComponentAxis | picassojs.ComponentBox | picassojs.ComponentBrushArea | picassojs.ComponentBrushAreaDir | picassojs.ComponentBrushLasso | picassojs.ComponentBrushRange | picassojs.ComponentContainer | picassojs.ComponentGridLine | picassojs.ComponentLabels | picassojs.ComponentLegendCat | picassojs.ComponentLegendSeq | picassojs.ComponentLine | picassojs.ComponentPie | picassojs.ComponentPoint | picassojs.ComponentRefLine | picassojs.ComponentText | picassojs.ComponentTooltip;

    type customLayoutFunction = (rect: picassojs.Rect, components: {
    }[])=>void;

    type DataExtraction = {
        extract: picassojs.DataExtraction.Extract | picassojs.DataExtraction.Extract[];
        stack?: {
            stackKey: picassojs.DataExtraction.StackKeyCallback;
            value: picassojs.DataExtraction.StackValueCallback;
        };
        filter?: picassojs.DataExtraction.FilterCallback;
        sort?: picassojs.DataExtraction.SortCallback;
    };

    namespace DataExtraction {
        type Extract = {
            source: string;
            field: string;
            value?: picassojs.DataExtraction.Extract.ValueFn | string | number | boolean;
            label?: picassojs.DataExtraction.Extract.LabelFn | string | number | boolean;
            trackBy?: picassojs.DataExtraction.Extract.TrackByFn;
            reduce?: picassojs.DataExtraction.Extract.ReduceFn | string;
            reduceLabel?: picassojs.DataExtraction.Extract.ReduceLabelFn | string;
            filter?: picassojs.DataExtraction.Extract.FilterFn;
            props?: object;
        };

        namespace Extract {
            /**
             * Filter callback function
             */
            type FilterFn = (cell: any)=>boolean;

            /**
             * Label callback function
             */
            type LabelFn = (cell: any)=>string;

            type Props = {
                field: string;
                value?: picassojs.DataExtraction.Extract.ValueFn | string | number | boolean;
                label?: picassojs.DataExtraction.Extract.LabelFn | string | number | boolean;
            };

            /**
             * Reduce callback function
             */
            type ReduceFn = (values: any[])=>any;

            /**
             * ReduceLabel callback function
             */
            type ReduceLabelFn = (labels: any[], value: any)=>string;

            /**
             * TrackBy callback function
             */
            type TrackByFn = (cell: any)=>any;

            /**
             * Value callback function
             */
            type ValueFn = (cell: any)=>any;

        }

        /**
         * Callback function to filter the extracted data items
         */
        type FilterCallback = (datum: picassojs.DatumExtract)=>boolean;

        /**
         * Callback function to sort the extracted data items
         */
        type SortCallback = (a: picassojs.DatumExtract, b: picassojs.DatumExtract)=>number;

        /**
         * Callback function. Should return the key to stack by
         */
        type StackKeyCallback = (datum: picassojs.DatumExtract)=>any;

        /**
         * Callback function. Should return the data value to stack with
         */
        type StackValueCallback = (datum: picassojs.DatumExtract)=>any;

    }

    type DataFieldExtraction = {
        source: string;
        field: string;
        value?: picassojs.DataExtraction.Extract.ValueFn | string | number | boolean;
        label?: picassojs.DataExtraction.Extract.LabelFn | string | number | boolean;
    };

    interface Dataset {
        (): void;
        /**
         * Extract data items from this dataset
         * @param config
         */
        extract(config: picassojs.DataExtraction.Extract | picassojs.DataFieldExtraction): picassojs.DatumExtract[];
        /**
         * Find a field within this dataset
         * @param query The field to find
         */
        field(query: string): picassojs.Field;
        /**
         * Get all fields within this dataset
         */
        fields(): picassojs.Field[];
        hierarchy(): null;
        /**
         * Get the key identifying this dataset
         */
        key(): string;
        /**
         * Get the raw data
         */
        raw(): any;
    }

    type DataSource = {
        key?: string;
        type: string;
        data: any;
    };

    /**
     * Callback function
     */
    type datumAccessor = (d: picassojs.DatumExtract)=>void;

    type DatumBoolean = boolean | picassojs.DatumConfig | picassojs.datumAccessor;

    type DatumConfig = {
        scale?: string;
        fn?: picassojs.datumAccessor;
        ref?: string;
    };

    type DatumExtract = {
        value: any;
        label: string;
        source: {
            key: string;
            field: string;
        };
    };

    type DatumNumber = number | picassojs.DatumConfig | picassojs.datumAccessor;

    type DatumString = string | picassojs.DatumConfig | picassojs.datumAccessor;

    type DockLayoutSettings = {
        logicalSize?: {
            width?: number;
            height?: number;
            preserveAspectRatio?: boolean;
            align?: number;
        };
        center?: {
            minWidthRatio?: number;
            minHeightRatio?: number;
            minWidth?: number;
            minHeight?: number;
        };
        layoutModes?: object;
        size?: {
            width?: number;
            height?: number;
        };
    };

    namespace DockLayoutSettings {
        type LayoutMode = {
            width: number;
            height: number;
        };

    }

    type Field = {
        /**
         * Returns a formatter adapted to the content of this field.
         */
        formatter(): void;
        /**
         * Returns this field's id
         */
        id(): string;
        /**
         * Returns the values of this field.
         */
        items(): picassojs.DatumExtract[];
        /**
         * Returns this field's key
         */
        key(): string;
        /**
         * Returns the max value of this field.
         */
        max(): number;
        /**
         * Returns the min value of this field.
         */
        min(): number;
        /**
         * Returns the input data
         */
        raw(): any;
        /**
         * Returns the tags.
         */
        tags(): string[];
        /**
         * Returns this field's title.
         */
        title(): string;
        /**
         * Returns this field's type: 'dimension' or 'measure'.
         */
        type(): string;
    };

    type formatter = ()=>any;

    type FormatterDefinition = {
        formatter?: string;
        type?: string;
        format?: string;
        data?: picassojs.DataExtraction | picassojs.DataFieldExtraction;
    };

    type Geopolygon = {
        polygons: picassojs.Polygon[];
    };

    type Interaction = {
        on: ()=>void;
        off: ()=>void;
        destroy: ()=>void;
        key: string;
    };

    interface InteractionSettings {
        type: string;
        key?: string;
        enable: (()=>void) | boolean;
    }

    type Line = {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };

    type Path = {
        d: string;
    };

    /**
     * Callback function to register a plugin
     */
    type plugin = (registries: picassojs.Registries, options: object)=>void;

    type Point = {
        x: number;
        y: number;
    };

    type Polygon = {
        points: picassojs.Point[];
    };

    type Polyline = {
        points: picassojs.Point[];
    };

    type ProgressiveObject = {
        start: number;
        end: number;
        isFirst: boolean;
        isLast: boolean;
    };

    type Rect = {
        x: number;
        y: number;
        width: number;
        height: number;
    };

    type Registries = {
        component: picassojs.registry;
        data: picassojs.registry;
        formatter: picassojs.registry;
        interaction: picassojs.registry;
        renderer: picassojs.registry;
        scale: picassojs.registry;
    };

    /**
     * Register a `value` with the given `key`. If `value` is omitted, returns the `value` of `key`.
     */
    type registry = (key: string, value?: any)=>any;

    interface Renderer {
        (): void;
        /**
         * @param element Element to attach renderer to
         */
        appendTo(element: HTMLElement): HTMLElement;
        /**
         * Clear all child elements from the renderer root element
         */
        clear(): picassojs.Renderer;
        /**
         * Remove the renderer root element from its parent element
         */
        destory(): void;
        /**
         * Get the element this renderer is attached to
         */
        element(): HTMLElement;
        /**
         * Get all nodes matching the provided selector
         * @param selector CSS selector [type, attribute, universal, class]
         */
        findShapes(selector: string): picassojs.SceneNode[];
        /**
         * Get nodes renderer at area
         * @param geometry Get nodes that intersects with geometry
         */
        itemsAt(geometry: picassojs.Point | picassojs.Circle | picassojs.Rect | picassojs.Line | picassojs.Polygon | picassojs.Geopolygon): picassojs.SceneNode[];
        /**
         * @param opts
         */
        measureText(opts: {
            text: string;
            fontSize: string;
            fontFamily: string;
        }): object;
        /**
         * @param nodes Nodes to render
         */
        render(nodes: object[]): boolean;
        /**
         * Get the root element of the renderer
         */
        root(): HTMLElement;
        /**
         * Set or Get renderer settings
         * @param settings Settings for the renderer
         */
        settings(settings?: object): void;
        /**
         * Set or Get the size definition of the renderer container.
         * @param opts Size definition
         */
        size(opts?: picassojs.Renderer.SizeDefinition): picassojs.Renderer.SizeDefinition;
    }

    namespace Renderer {
        type SizeDefinition = {
            x?: number;
            y?: number;
            width?: number;
            height?: number;
            scaleRatio?: {
                x?: number;
                y?: number;
            };
            margin?: {
                left?: number;
                top?: number;
            };
        };

    }

    type RendererSettings = {
        transform?: picassojs.RendererSettings.TransformFunction;
        canvasBufferSize?: picassojs.RendererSettings.CanvasBufferSize;
        progressive?: picassojs.RendererSettings.Progressive;
    };

    namespace RendererSettings {
        type CanvasBufferSize = (()=>void) | object;

        /**
         * A function which returns either (1) false (to specify no progressive rendering used) or an object specifing the data chunk rendered.
         *  This is only applied to a canvas renderer.
         */
        type Progressive = ()=>picassojs.ProgressiveObject | boolean;

        /**
         * Should return a transform object if transformation should be applied, otherwise undefined or a falsy value.
         * Transforms can be applied with the canvas, svg and dom renderer.
         * Transform is applied when running chart.update, see example.
         * !Important: When a transform is applied to a component, the underlaying node representations are not updated with the new positions/sizes, which
         * can cause problems for operations that relies on the positioning of the shapes/nodes (such as tooltips, selections etc). An extra chart update
         * without a transform is therefore needed to make sure the node position information is in sync with the visual representation again.
         */
        type TransformFunction = ()=>picassojs.TransformObject;

    }

    /**
     * Scale instance
     */
    interface Scale {
        type: string;
    }

    type ScaleBand = {
        type?: string;
        padding?: number;
        paddingInner?: number;
        paddingOuter?: number;
        align?: number;
        invert?: boolean;
        maxPxStep?: number;
        label?: ()=>void;
        value?: ()=>void;
        range?: number[] | (()=>void);
    };

    type ScaleCategoricalColor = {
        type?: string;
        range?: string[];
        unknown?: string;
        explicit?: {
            "domain[]"?: object[];
            "range[]"?: string[];
        };
    };

    type ScaleDefinition = {
        type?: string;
        data?: picassojs.DataExtraction | picassojs.DataFieldExtraction;
    };

    type ScaleLinear = {
        type?: string;
        expand?: number;
        invert?: boolean;
        include?: number[];
        ticks?: {
            tight?: boolean;
            forceBounds?: boolean;
            distance?: number;
            values?: number[] | object[];
            count?: number;
        };
        minorTicks?: {
            count?: number;
        };
        min?: number;
        max?: number;
    };

    type ScaleSequentialColor = {
        type?: string;
        range?: string[];
        invert?: boolean;
        min?: number;
        max?: number;
    };

    type ScaleThresholdColor = {
        type?: string;
        domain?: number[];
        range?: string[];
        invert?: boolean;
        min?: number;
        max?: number;
        nice?: boolean;
    };

    /**
     * Read-only object representing a node on the scene.
     */
    class SceneNode {
        constructor();

        attrs: {
        };

        bounds: picassojs.Rect;

        /**
         * Bounding rectangle of the node, relative a target.
         * 
         * If target is an HTMLElement, the bounds are relative to the HTMLElement.
         * Any other target type will return the bounds relative to the viewport of the browser.
         * @param target
         * @param includeTransform Whether to include any applied transforms on the node
         */
        boundsRelativeTo(target: HTMLElement | any, includeTransform: boolean): picassojs.Rect;

        children: picassojs.SceneNode[];

        collider: picassojs.Line | picassojs.Rect | picassojs.Circle | picassojs.Path;

        data: any;

        desc: {
        };

        element: HTMLElement;

        key: string;

        localBounds: picassojs.Rect;

        parent: picassojs.SceneNode;

        tag: string;

        type: string;

    }

    /**
     * Create a new svg renderer
     */
    type svgRendererFactory = (treeFactory?: ()=>void, ns?: string, sceneFn?: ()=>void)=>picassojs.Renderer;

    type TransformObject = {
        horizontalScaling: number;
        horizontalSkewing: number;
        verticalSkewing: number;
        verticalScaling: number;
        horizontalMoving: number;
        verticalMoving: number;
    };

}

