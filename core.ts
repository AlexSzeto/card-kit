enum AnchorPositions {
    //% block="top left"
    TopLeft,
    //% block="top"
    Top,
    //% block="top right"
    TopRight,
    //% block="left"
    Left,
    //% block="center"
    Center,
    //% block="right"
    Right,
    //% block="bottom left"
    BottomLeft,
    //% block="bottom"
    Bottom,
    //% block="bottom right"
    BottomRight
}

namespace cardCore {
    
    /*****************************************/
    /* Card Data                             */
    /*****************************************/

    export function valueToString(value: any): string {
        switch (typeof value) {
            case 'number':
            case 'boolean':
                return JSON.stringify(value)
            case 'string':
                return value
            default: return ''
        }
    }

    export type CardAttributeValues = string | number | boolean
    export type CardAttribute = {
        attribute: number
        value: CardAttributeValues
    }

    export class CardData {
        private _attributes: CardAttribute[]

        constructor() {
            this._attributes = []
        }

        getAttribute(id: number): CardAttributeValues {
            const attribute = this._attributes.find(attr => attr.attribute === id)
            if (!!attribute) {
                return attribute.value
            } else {
                return null
            }
        }

        setAttribute(id: number, value: CardAttributeValues): void {
            const attribute = this._attributes.find(attr => attr.attribute === id)
            if (!!attribute) {
                attribute.value = value
            } else {
                this._attributes.push({ attribute: id, value: value })
            }
        }

        attributeEquals(id: number, value: CardAttributeValues): boolean {
            const valueText: string = valueToString(value)
            const attribute = this._attributes.find(attr => attr.attribute === id)
            if (!attribute) {
                return (valueText === '' || valueText === '0' || valueText === 'false')
            }
            const attrText: string = valueToString(attribute.value)
            return attrText === valueText
        }

        clone(): CardData {
            const clone = new CardData()
            this._attributes.forEach(attribute => {
                clone.setAttribute(attribute.attribute, attribute.value)
            })
            return clone
        }

        toString(): string {
            return `[${this._attributes.map(attribute => `${attribute.attribute}:${attribute.value}`).join(',')}]`
        }
    }

    /*****************************************/
    /* Card Data Look Up                     */
    /*****************************************/

    type AttributeLookupDrawables = string | Image
    export type AttributeLookup = {
        value: CardAttributeValues
        drawable: AttributeLookupDrawables
    }

    enum DynamicValueSources {
        Static,
        FromAttribute,
        FromLookup,
    }

    type DynamicValueOutputs = number | string | Image

    class DynamicValue {
        constructor(
            private source: DynamicValueSources,
            private staticValue: DynamicValueOutputs,
            private attribute: number,
            private lookupTable: AttributeLookup[]
        ) {}

        private getOutput(data: CardData) {
            switch (this.source) {
                case DynamicValueSources.Static:
                    return this.staticValue
                case DynamicValueSources.FromAttribute:
                    return data.getAttribute(this.attribute)
                case DynamicValueSources.FromLookup:
                    const value = data.getAttribute(this.attribute)
                    const lookup = this.lookupTable.find(lookup => lookup.value === value)
                    return !!lookup ? lookup.drawable : null
            }
        }

        getNumber(data: CardData): number {
            const value = this.getOutput(data)
            if (typeof value === 'number') {
                return value
            } else if (typeof value === 'string') {
                return parseInt(value)
            } else {
                return 0
            }
        }

        getString(data: CardData): string {
            const value = this.getOutput(data)
            if (typeof value === 'number'|| typeof value === 'string') {
                return valueToString(value)
            } else {
                return ''
            }
        }

        getImage(data: CardData): Image {
            return this.getOutput(data) as Image
        }
    }

    export function createStaticValue(value: DynamicValueOutputs): DynamicValue {
        return new DynamicValue(DynamicValueSources.Static, value, -1, null)
    }

    export function createAttributeAsValue(attribute: number): DynamicValue {
        return new DynamicValue(DynamicValueSources.FromAttribute, null, attribute, null)
    }

    export function createIndexedLookupValue(attribute: number, drawables: AttributeLookupDrawables[]): DynamicValue {
        const lookupTable: AttributeLookup[] = []
        drawables.forEach((drawable, index) => {
            lookupTable.push({ value: index, drawable: drawable })
        })
        return new DynamicValue(DynamicValueSources.FromLookup, null, attribute, lookupTable)
    }

    export function createLookupValue(attribute: number, lookupTable: AttributeLookup[]): DynamicValue {
        return new DynamicValue(DynamicValueSources.FromLookup, null, attribute, lookupTable)
    }

    /*****************************************/
    /* Drawable Data                         */
    /*****************************************/

    enum DrawableTypes {
        Text,
        Image,
    }

    export type DrawItem = {
        drawableType: DrawableTypes
        repeats: DynamicValue
        drawable: DynamicValue
        color: DynamicValue
        width?: number
        height?: number
    }

    export function createImageItem(image: Image, width: number = 0, height: number = 0): DrawItem {
        return {
            drawableType: DrawableTypes.Image,
            repeats: createStaticValue(1),
            drawable: createStaticValue(image),
            color: createStaticValue(-1),
            width: width,
            height: height
        }
    }

    export function createTextItem(text: string, width: number = 0, height: number = 0): DrawItem {
        return {
            drawableType: DrawableTypes.Text,
            repeats: createStaticValue(1),
            drawable: createStaticValue(text),
            color: createStaticValue(15),
            width: width,
            height: height
        }
    }

    enum HorizontalAlignments {
        Left,
        Center,
        Right,
    }

    enum VerticalAlignments {
        Top,
        Center,
        Bottom,
    }

    export class DrawGroup {
        public items: DrawItem[] = []
        public horizontalAlign: HorizontalAlignments
        public verticalAlign: VerticalAlignments

        public constructor(
            align: AnchorPositions,
            public horizontal: boolean = true,
            public offsetX: number = 0,
            public offsetY: number = 0,
            public visibilityAttributeId: number = -1
        ) {
            switch (align) {
                case AnchorPositions.TopLeft:
                case AnchorPositions.Left:
                case AnchorPositions.BottomLeft:
                    this.horizontalAlign = HorizontalAlignments.Left
                    break
                case AnchorPositions.Top:
                case AnchorPositions.Center:
                case AnchorPositions.Bottom:
                    this.horizontalAlign = HorizontalAlignments.Center
                    break
                case AnchorPositions.TopRight:
                case AnchorPositions.Right:
                case AnchorPositions.BottomRight:
                    this.horizontalAlign = HorizontalAlignments.Right
                    break
            }
            switch (align) {
                case AnchorPositions.TopLeft:
                case AnchorPositions.Top:
                case AnchorPositions.TopRight:
                    this.verticalAlign = VerticalAlignments.Top
                    break
                case AnchorPositions.Left:
                case AnchorPositions.Center:
                case AnchorPositions.Right:
                    this.verticalAlign = VerticalAlignments.Center
                    break
                case AnchorPositions.BottomLeft:
                case AnchorPositions.Bottom:
                case AnchorPositions.BottomRight:
                    this.verticalAlign = VerticalAlignments.Bottom
                    break
            }
        }
    }

    type FinalDrawable = {
        width: number
        height: number
        image: Image
        lines: string[]
        color: number
    }
    
    export class CardDesign {
        frontImage: Image
        backImage: Image
        blankImage: Image
        private frontStackResizableImage: game.BaseDialog
        private backStackResizableImage: game.BaseDialog

        constructor(
            public width: number,
            public height: number,
            frontFrame: Image,
            backFrame: Image,
            blankFrame: Image,
            private frontStackFrame: Image,
            private backStackFrame: Image,
            private cardsPerPixel: number,
            private maxStackHeight: number,
            public groups: DrawGroup[],
            public margin: number,
            public spacing: number,
        ) {
            let frame = new game.BaseDialog(width, height, frontFrame)
            if (frontFrame.width === width && frontFrame.height === height) {
                this.frontImage = frontFrame
            } else {
                this.frontImage = frame.image
            }
            if (backFrame.width === width && backFrame.height === height) {
                this.backImage = backFrame
            } else {
                frame.resize(width, height, backFrame)
                this.backImage = frame.image
            }
            if (!!blankFrame) {
                if (blankFrame.width === width && blankFrame.height === height) {
                    this.blankImage = blankFrame
                } else {
                    frame.resize(width, height, blankFrame)
                    this.blankImage = frame.image
                }
            }
            this.frontStackResizableImage = new game.BaseDialog(width, height, frontStackFrame)
            this.backStackResizableImage = new game.BaseDialog(width, height, backStackFrame)
        }

        private getStackImageFullHeight(): number {
            return this.height + this.maxStackHeight
        }

        private getStackImage(cardStackSize: number, isFaceUp: boolean): Image {
            const stackHeight = this.getStackThickness(cardStackSize) + this.height
            if (isFaceUp) {
                this.frontStackResizableImage.resize(this.width, stackHeight, this.frontStackFrame)
                return this.frontStackResizableImage.image
            } else {
                this.backStackResizableImage.resize(this.width, stackHeight, this.backStackFrame)
                return this.backStackResizableImage.image
            }
        }

        getStackThickness(cardStackSize: number): number {
            return Math.floor(Math.min(this.maxStackHeight, Math.max(0, cardStackSize / this.cardsPerPixel)))
        }

        createCardBaseImage(): Image {
            return image.create(this.width, this.height)
        }

        createStackBaseimage(): Image {
            return image.create(this.width, this.getStackImageFullHeight())
        }

        drawCardFront(image: Image, x: number, y: number, card: CardData) {
            function createTextZone(width: number, height: number, text: string, color: number): FinalDrawable {
                if (text.length === 0) {
                    return null
                }

                let lines = []
                let index = 0
                const columnLimit = width > 0 ? width / tinyFont.charWidth() : text.length
                const rowLimit = height > 0 ? height / tinyFont.charHeight() : 1
                while (index < text.length && lines.length < rowLimit) {
                    lines.push(text.substr(index, columnLimit))
                    index += columnLimit
                }

                return {
                    width: lines.length > 1 ? width : tinyFont.charWidth() * text.length,
                    height: lines.length * tinyFont.charHeight(),
                    image: null,
                    lines: lines,
                    color: color
                }
            }

            function createFlatColorImage(image: Image, color: number): Image {
                const result = image.clone()
                for (let c = 1; c < 16; c++) {
                    result.replace(c, color)
                }
                return result
            }     
            
            function createImageZone(width: number, height: number, image: Image, color: number): FinalDrawable {
                if (!image) {
                    return null
                }

                return {
                    width: width > 0 ? width : image.width,
                    height: height > 0 ? height : image.height,
                    image: color >= 0 ? createFlatColorImage(image, color) : image,
                    lines: null,
                    color: color
                }
            }
    
            image.drawTransparentImage(this.frontImage, x, y)
            
            this.groups.forEach(group => {
                if (group.visibilityAttributeId >= 0 && card.attributeEquals(group.visibilityAttributeId, false)) {
                    return
                }

                const drawables: FinalDrawable[] = []
                group.items.forEach(item => {
                    let drawable: FinalDrawable = null
                    switch (item.drawableType) {
                        case DrawableTypes.Text:
                            drawable = createTextZone(item.width, item.height, item.drawable.getString(card), item.color.getNumber(card))
                            break
                        case DrawableTypes.Image:
                            drawable = createImageZone(item.width, item.height, item.drawable.getImage(card), item.color.getNumber(card))
                            break
                    }
                    if (!!drawable) {
                        for (let repeat = 0; repeat < item.repeats.getNumber(card); repeat++) {
                            drawables.push(drawable)
                        }                            
                    }
                })

                let fullWidth = group.horizontal
                    ? drawables.reduce((sum, drawable) => sum + drawable.width + this.spacing, -this.spacing)
                    : drawables.reduce((max, drawable) => Math.max(max, drawable.width), 0)
                let fullHeight = group.horizontal
                    ? drawables.reduce((max, drawable) => Math.max(max, drawable.height), 0)
                    : drawables.reduce((sum, drawable) => sum + drawable.height + this.spacing, -this.spacing)
                
                let anchorX: number
                let anchorY: number

                switch (group.horizontalAlign) {
                    case HorizontalAlignments.Left:
                        anchorX = x + this.margin + group.offsetX
                        break
                    case HorizontalAlignments.Center:
                        anchorX = x + group.offsetX + (this.width - (group.horizontal ? fullWidth : 0)) / 2 
                        break
                    case HorizontalAlignments.Right:
                        anchorX = x - this.margin + group.offsetX + this.width - (group.horizontal ? fullWidth : 0)
                        break
                }
                switch (group.verticalAlign) {
                    case VerticalAlignments.Top:
                        anchorY = y + this.margin + group.offsetY
                        break
                    case VerticalAlignments.Center:
                        anchorY = y + group.offsetY + (this.height - (group.horizontal ? 0 : fullHeight)) / 2
                        break
                    case VerticalAlignments.Bottom:
                        anchorY = y - this.margin + group.offsetY + this.height - (group.horizontal ? 0 : fullHeight)
                        break
                }

                drawables.forEach(drawable => {
                    let drawX: number
                    let drawY: number

                    switch (group.horizontalAlign) {
                        case HorizontalAlignments.Left:
                            drawX = anchorX
                            break
                        case HorizontalAlignments.Center:
                            drawX = anchorX - (group.horizontal ? 0 : drawable.width / 2)
                            break
                        case HorizontalAlignments.Right:
                            drawX = anchorX - (group.horizontal ? 0 : drawable.width)
                            break
                    }

                    switch (group.verticalAlign) {
                        case VerticalAlignments.Top:
                            drawY = anchorY
                            break
                        case VerticalAlignments.Center:
                            drawY = anchorY - (group.horizontal ? drawable.height / 2 : 0)
                            break
                        case VerticalAlignments.Bottom:
                            drawY = anchorY - (group.horizontal ? drawable.height : 0)
                            break
                    }

                    if (!!drawable.image) {
                        image.drawTransparentImage(
                            drawable.image,
                            drawX + (drawable.width - drawable.image.width) / 2,
                            drawY + (drawable.height - drawable.image.height) / 2
                        )
                    } else {
                        drawable.lines.forEach((text, line) => {
                            tinyFont.print(image, drawX, drawY + line * tinyFont.charHeight(), text, drawable.color)
                        })
                    }
                    anchorX += group.horizontal ? drawable.width + this.spacing : 0
                    anchorY += group.horizontal ? 0 : drawable.height + this.spacing
                })
            })
        }       

        drawCardBack(image: Image, x: number, y: number) {
            image.drawTransparentImage(this.backImage, x, y)
        }

        drawEmptyCard(image: Image, x: number, y: number) {
            if (!!this.blankImage) {
                image.drawTransparentImage(this.blankImage, x, y)
            }
        }
    
        drawCardStack(image: Image, x: number, y: number, cardCount: number, faceUp: boolean) {
            if (cardCount > 1) {
                const stackImage = this.getStackImage(cardCount, faceUp)
                y = y + this.getStackImageFullHeight() - stackImage.height
                image.drawTransparentImage(stackImage, x, y)
            }
        }
    }
}