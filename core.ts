enum DrawableAlignments {
    TopLeft,
    Top,
    TopRight,
    Left,
    Center,
    Right,
    BottomLeft,
    Bottom,
    BottomRight,
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
    type AttributeLookup = {
        value: CardAttributeValues
        drawable: AttributeLookupDrawables
    }

    function createLookupTable(drawables: AttributeLookupDrawables[]): AttributeLookup[] {
        const lookupTable: AttributeLookup[] = []
        drawables.forEach((drawable, index) => {
            lookupTable.push({ value: index, drawable: drawable })
        })
        return lookupTable
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

    /*****************************************/
    /* Drawable Data                         */
    /*****************************************/

    enum DrawableTypes {
        Text,
        Image,
    }

    type DrawSubject = {
        drawableType: DrawableTypes
        width?: number
        height?: number
        repeats: DynamicValue
        drawable: DynamicValue
        color?: DynamicValue
    }

    type DrawSequence = {
        align: DrawableAlignments
        x?: number
        y?: number
        horizontal: boolean
        subjects: DrawSubject[]
    }

    type DrawZone = {
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
            public sequences: DrawSequence[],
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
            function createTextZone(width: number, height: number, text: string, color: number): DrawZone {
                if (text.length === 0) {
                    return null
                }

                let lines = []
                let index = 0
                const columnLimit = width / tinyFont.charWidth()
                const rowLimit = height / tinyFont.charHeight()
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
        
            function createImageZone(image: Image): DrawZone {
                if (!image) {
                    return null
                }

                return {
                    width: image.width,
                    height: image.height,
                    image: image,
                    lines: null,
                    color: 0
                }
            }
    
            image.drawTransparentImage(this.frontImage, x, y)
            
            this.sequences.forEach(sequence => {
                const zones: DrawZone[] = []
                sequence.subjects.forEach(subject => {
                    let zone: DrawZone = null
                    switch (subject.drawableType) {
                        case DrawableTypes.Text:
                            zone = createTextZone(subject.width, subject.height, subject.drawable.getString(card), subject.color.getNumber(card))
                            break
                        case DrawableTypes.Image:
                            zone = createImageZone(subject.drawable.getImage(card))
                            break
                    }
                    if (!!zone) {
                        for (let repeat = 0; repeat < subject.repeats.getNumber(card); repeat++) {
                            zones.push(zone)
                        }                            
                    }
                })

                let fullWidth = sequence.horizontal
                    ? zones.reduce((sum, zone) => sum + zone.width + this.spacing, -this.spacing)
                    : zones.reduce((max, zone) => Math.max(max, zone.width), 0)
                let fullHeight = sequence.horizontal
                    ? zones.reduce((max, zone) => Math.max(max, zone.height), 0)
                    : zones.reduce((sum, zone) => sum + zone.height + this.spacing, -this.spacing)
                
                let anchorX: number
                let anchorY: number

                switch (sequence.align) {
                    case DrawableAlignments.TopLeft:
                    case DrawableAlignments.Left:
                    case DrawableAlignments.BottomLeft:
                        anchorX = x
                        break
                    case DrawableAlignments.TopRight:
                    case DrawableAlignments.Right:
                    case DrawableAlignments.BottomRight:
                        anchorX = x + this.width
                        break
                    case DrawableAlignments.Top:
                    case DrawableAlignments.Center:
                    case DrawableAlignments.Bottom:
                        anchorX = x + this.width / 2
                        break
                }
                switch (sequence.align) {
                    case DrawableAlignments.TopLeft:
                    case DrawableAlignments.Top:
                    case DrawableAlignments.TopRight:
                        anchorY = y
                        break
                    case DrawableAlignments.Left:
                    case DrawableAlignments.Center:
                    case DrawableAlignments.Right:
                        anchorY = y + this.height / 2
                        break
                    case DrawableAlignments.BottomLeft:
                    case DrawableAlignments.Bottom:
                    case DrawableAlignments.BottomRight:
                        anchorY = y + this.height
                        break
                }
            })

            // this.zones.forEach(zone => {
            //     skip = false

            //     color = zone.color.getNumber(card)

            //     switch (zone.zoneType) {
            //         case DrawableTypes.Text:
            //             prepareDrawText(zone.text, zone.width, zone.height)
            //             break
                    
            //         case DrawableTypes.AttributeText:
            //             attribute = card.getAttribute(zone.attribute)
            //             if (typeof attribute === 'number') {
            //                 prepareDrawText(attribute.toString(), zone.width, zone.height)
            //             } else if (attribute != null) {
            //                 prepareDrawText(attribute, zone.width, zone.height)
            //             } else {
            //                 skip = true
            //             }
            //             break

            //         case DrawableTypes.LookupAttributeAsText:
            //             attribute = card.getAttribute(zone.attribute)
            //             lookupValue = zone.lookupTable.find(lookup => lookup.value === attribute)
            //             if (!!lookupValue && typeof lookupValue.drawable === 'string') {
            //                 prepareDrawText(lookupValue.drawable, zone.width, zone.height)
            //             } else {
            //                 skip = true
            //             }
            //             break
                    
            //         case DrawableTypes.Image:
            //             prepareDrawImage(zone.image, true, 1)
            //             break
                    
            //         case DrawableTypes.RepeatImage:
            //             attribute = card.getAttribute(zone.attribute)
            //             if (typeof attribute === 'number') {
            //                 prepareDrawImage(zone.image, zone.horizontalRepeat, attribute)
            //             } else {
            //                 skip = true
            //             }
            //             break

            //         case DrawableTypes.LookupAttributeAsImage:
            //             attribute = card.getAttribute(zone.attribute)
            //             lookupValue = zone.lookupTable.find(lookup => lookup.value === attribute)
            //             if (!!lookupValue) {
            //                 prepareDrawImage(lookupValue.drawable as Image, true, 1)
            //             } else {
            //                 skip = true
            //             }
            //             break
            //     }

            //     switch (zone.align) {
            //         case DrawableAlignments.TopLeft:
            //         case DrawableAlignments.Left:
            //         case DrawableAlignments.BottomLeft:
            //             drawLeft = x
            //             break
            //         case DrawableAlignments.TopRight:
            //         case DrawableAlignments.Right:
            //         case DrawableAlignments.BottomRight:
            //             drawLeft = x + this.width - drawWidth
            //             break
            //         case DrawableAlignments.Top:
            //         case DrawableAlignments.Center:
            //         case DrawableAlignments.Bottom:
            //             drawLeft = x + (this.width - drawWidth) / 2
            //             break
            //     }
            //     switch (zone.align) {
            //         case DrawableAlignments.TopLeft:
            //         case DrawableAlignments.Top:
            //         case DrawableAlignments.TopRight:
            //             drawTop = y
            //             break
            //         case DrawableAlignments.Left:
            //         case DrawableAlignments.Center:
            //         case DrawableAlignments.Right:
            //             drawTop = y + (this.height - drawHeight) / 2
            //             break
            //         case DrawableAlignments.BottomLeft:
            //         case DrawableAlignments.Bottom:
            //         case DrawableAlignments.BottomRight:
            //             drawTop = y + this.height - drawHeight
            //             break
            //     }

            //     switch (zone.zoneType) {
            //         case DrawableTypes.Text:
            //         case DrawableTypes.AttributeText:
            //         case DrawableTypes.LookupAttributeAsText:
            //             if (!skip) {
            //                 lines.forEach((text, line) => {
            //                     tinyFont.print(image, drawLeft, drawTop + line * tinyFont.charHeight(), text, color)
            //                 })
            //             }
            //             break
            //         case DrawableTypes.Image:
            //         case DrawableTypes.RepeatImage:
            //         case DrawableTypes.LookupAttributeAsImage:
            //             if (!skip) {
            //                 for (let repeat = 0; repeat < drawRepeats; repeat++) {
            //                     image.drawTransparentImage(drawImage, drawLeft, drawTop)
            //                     if (zone.horizontalRepeat) {
            //                         drawLeft += drawImage.width
            //                     } else {
            //                         drawTop += drawImage.height
            //                     }
            //                 }
            //             }
            //             break
            //     }
            // })
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

    export function createTextColumn(align: DrawableAlignments, text: string, color: number, width: number, height: number): DrawSubject {
        return {
            drawableType: DrawableTypes.Text,
            align: align,
            text: text,
            color: color,
            colorAttribute: -1,
            width: width,
            height: height,
        }
    }
    export function createAttributeAsPlainTextColumn(align: DrawableAlignments, attribute: number, color: number, columns: number, rows: number, isDynamic: boolean): DrawSubject {
        return {
            drawableType: DrawableTypes.AttributeText,
            align: align,
            attribute: attribute,
            color: color,
            colorAttribute: -1,
            width: columns,
            height: rows,
            isDynamic: isDynamic,
        }
    }
    export function createAttributeAsLookupTextColumn(align: DrawableAlignments, attribute: number, lookupTable: AttributeLookup[], color: number, columns: number, rows: number, isDynamic: boolean): DrawSubject {
        return {
            drawableType: DrawableTypes.LookupAttributeAsText,
            align: align,
            attribute: attribute,
            color: color,
            colorAttribute: -1,
            width: columns,
            height: rows,
            isDynamic: isDynamic,
            lookupTable: lookupTable
        }
    }
    export function createImageColumn(align: DrawableAlignments, image: Image): DrawSubject {
        return {
            drawableType: DrawableTypes.Image,
            align: align,
            image: image,
        }
    }
    export function createAttributeAsRepeatImageColumn(align: DrawableAlignments, attribute: number, image: Image): DrawSubject {
        return {
            drawableType: DrawableTypes.RepeatImage,
            align: align,
            attribute: attribute,
            image: image,            
        }
    }
    export function createAttributeAsLookupImageColumn(align: DrawableAlignments, attribute: number, lookupTable: AttributeLookup[]): DrawSubject {
        return {
            drawableType: DrawableTypes.LookupAttributeAsImage,
            align: align,
            attribute: attribute,
            lookupTable: lookupTable
        }
    }
    export function modifyTextColumnWithAttributeColorLookup(column: DrawSubject, colorAttribute: number): void {
        column.colorAttribute = colorAttribute
    }
}