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

    export type CardAttributeValues = string | number
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
            const valueText: string = (typeof value === 'number') ? value.toString() : value
            const attribute = this._attributes.find(attr => attr.attribute === id)
            if (!attribute) {
                return (valueText === '' || valueText === '0')
            }
            const attrText: string = (typeof attribute.value === 'number') ? attribute.value.toString() : attribute.value
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
            if (typeof value === 'number') {
                return value.toString()
            } else if (typeof value === 'string') {
                return value
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

    export type DrawSubject = {
        drawableType: DrawableTypes
        repeats: DynamicValue
        drawable: DynamicValue
        color: DynamicValue
        width?: number
        height?: number
    }

    export function createImageSubject(image: Image): DrawSubject {
        return {
            drawableType: DrawableTypes.Image,
            repeats: createStaticValue(1),
            drawable: createStaticValue(image),
            color: createStaticValue(-1),
        }
    }

    export function createTextSubject(text: string, width: number = 0, height: number = 0): DrawSubject {
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

    export class DrawSection {
        public subjects: DrawSubject[] = []
        public horizontalAlign: HorizontalAlignments
        public verticalAlign: VerticalAlignments

        public constructor(
            align: AnchorPositions,
            public horizontal: boolean = true,
            public offsetX: number = 0,
            public offsetY: number = 0,
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
            public sections: DrawSection[],
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
        
            function createImageZone(image: Image, color: number): FinalDrawable {
                if (!image) {
                    return null
                }

                return {
                    width: image.width,
                    height: image.height,
                    image: image,
                    lines: null,
                    color: color
                }
            }
    
            image.drawTransparentImage(this.frontImage, x, y)
            
            this.sections.forEach(section => {
                const drawables: FinalDrawable[] = []
                section.subjects.forEach(subject => {
                    let drawable: FinalDrawable = null
                    switch (subject.drawableType) {
                        case DrawableTypes.Text:
                            drawable = createTextZone(subject.width, subject.height, subject.drawable.getString(card), subject.color.getNumber(card))
                            break
                        case DrawableTypes.Image:
                            drawable = createImageZone(subject.drawable.getImage(card), subject.color.getNumber(card))
                            break
                    }
                    if (!!drawable) {
                        for (let repeat = 0; repeat < subject.repeats.getNumber(card); repeat++) {
                            drawables.push(drawable)
                        }                            
                    }
                })

                let fullWidth = section.horizontal
                    ? drawables.reduce((sum, drawable) => sum + drawable.width + this.spacing, -this.spacing)
                    : drawables.reduce((max, drawable) => Math.max(max, drawable.width), 0)
                let fullHeight = section.horizontal
                    ? drawables.reduce((max, drawable) => Math.max(max, drawable.height), 0)
                    : drawables.reduce((sum, drawable) => sum + drawable.height + this.spacing, -this.spacing)
                
                let anchorX: number
                let anchorY: number

                switch (section.horizontalAlign) {
                    case HorizontalAlignments.Left:
                        anchorX = x + this.margin + section.offsetX
                        break
                    case HorizontalAlignments.Center:
                        anchorX = x + section.offsetX + (this.width - (section.horizontal ? fullWidth : 0)) / 2 
                        break
                    case HorizontalAlignments.Right:
                        anchorX = x - this.margin + section.offsetX + this.width - (section.horizontal ? fullWidth : 0)
                        break
                }
                switch (section.verticalAlign) {
                    case VerticalAlignments.Top:
                        anchorY = y + this.margin + section.offsetY
                        break
                    case VerticalAlignments.Center:
                        anchorY = y + section.offsetY + (this.height - (section.horizontal ? 0 : fullHeight)) / 2
                        break
                    case VerticalAlignments.Bottom:
                        anchorY = y - this.margin + section.offsetY + this.height - (section.horizontal ? 0 : fullHeight)
                        break
                }

                drawables.forEach(drawable => {
                    let drawX: number
                    let drawY: number

                    switch (section.horizontalAlign) {
                        case HorizontalAlignments.Left:
                            drawX = anchorX
                            break
                        case HorizontalAlignments.Center:
                            drawX = anchorX - (section.horizontal ? 0 : drawable.width / 2)
                            break
                        case HorizontalAlignments.Right:
                            drawX = anchorX - (section.horizontal ? 0 : drawable.width)
                            break
                    }

                    switch (section.verticalAlign) {
                        case VerticalAlignments.Top:
                            drawY = anchorY
                            break
                        case VerticalAlignments.Center:
                            drawY = anchorY - (section.horizontal ? drawable.height / 2 : 0)
                            break
                        case VerticalAlignments.Bottom:
                            drawY = anchorY - (section.horizontal ? drawable.height : 0)
                            break
                    }

                    if (!!drawable.image) {
                        image.drawTransparentImage(drawable.image, drawX, drawY)
                    } else {
                        drawable.lines.forEach((text, line) => {
                            tinyFont.print(image, drawX, drawY + line * tinyFont.charHeight(), text, drawable.color)
                        })
                    }
                    anchorX += section.horizontal ? drawable.width + this.spacing : 0
                    anchorY += section.horizontal ? 0 : drawable.height + this.spacing
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