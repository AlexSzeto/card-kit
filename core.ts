enum CardZoneAlignments {
    Left,
    Center,
    Right
}

namespace cardCore {

    export type CardAttributeValues = string | number
    export type CardAttribute = {
        attribute: number
        value: CardAttributeValues
    }

    export class CardData {
        private _attributes: CardAttribute[]

        constructor(
            public attributes?: CardAttribute[],
        ) {
            this._attributes = attributes ? attributes : []
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
            console.log('id ' + id)
            console.log('value ' + value)
            console.log(typeof value)
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
    }

    enum ZoneTypes {
        EmptySpace,

        Text,
        AttributeText,
        LookupAttributeAsText,

        Image,
        RepeatImage,
        LookupAttributeAsImage,
    }
        
    type AttributeLookupDrawables = string | Image
    export type DesignLookup = {
        value: CardAttributeValues
        drawable: AttributeLookupDrawables
    }

    export function createNumberToTextLookupTable(texts: string[]): DesignLookup[] {
        const lookupTable: DesignLookup[] = []
        texts.forEach((text, index) => {
            lookupTable.push({ value: index, drawable: text })
        })
        return lookupTable
    }

    export function createNumberToImageLookupTable(images: Image[]): DesignLookup[] {
        const lookupTable: DesignLookup[] = []
        images.forEach((image, index) => {
            lookupTable.push({ value: index, drawable: image })
        })
        return lookupTable
    }

    export type StampLookup = {
        value: string
        image: Image
    }

    export type DesignColumn = {
        zoneType: ZoneTypes
        align: CardZoneAlignments
        attribute?: number
        text?: string
        color?: number
        width?: number
        height?: number
        isDynamic?: boolean
        image?: Image
        lookupTable?: DesignLookup[]
    }
    export type DesignRow = DesignColumn[]

    type DrawRowSection = {
        align: CardZoneAlignments
        width: number
        zones: DrawZone[]
    }

    type DrawZone = {
        width: number
        height: number
        image: Image
        repeats: number
        lines: string[]
        color: number
    }
    
    export class CardDesign {
        frontImage: Image
        backImage: Image
        private frontStackResizableImage: game.BaseDialog
        private backStackResizableImage: game.BaseDialog

        constructor(
            public width: number,
            public height: number,
            frontFrame: Image,
            backFrame: Image,
            private frontStackFrame: Image,
            private backStackFrame: Image,
            private cardsPerPixel: number,
            private maxStackHeight: number,
            public rows: DesignRow[],
            public stamps: StampLookup[],
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
            this.frontStackResizableImage = new game.BaseDialog(width, height, frontStackFrame)
            this.backStackResizableImage = new game.BaseDialog(width, height, backStackFrame)
        }

        private getStackImageFullHeight(): number {
            return this.height + this.maxStackHeight
        }

        private getStackHeight(cardStackSize: number): number {
            return this.getStackThickness(cardStackSize) + this.height
        }

        private getStackImage(cardStackSize: number, isFaceUp: boolean): Image {
            const stackHeight = this.getStackHeight(cardStackSize)
            if (isFaceUp) {
                this.frontStackResizableImage.resize(this.width, stackHeight, this.frontStackFrame)
                return this.frontStackResizableImage.image
            } else {
                this.backStackResizableImage.resize(this.width, stackHeight, this.backStackFrame)
                return this.backStackResizableImage.image
            }
        }

        getStackThickness(cardStackSize: number): number {
            return Math.floor(Math.min(this.maxStackHeight, Math.max(1, cardStackSize / this.cardsPerPixel)))
        }
        
        getStackTopYOffset(cardStackSize: number): number {
            return this.getStackImageFullHeight() / 2 - this.getStackHeight(cardStackSize) + this.height / 2
        }
        
        createCardBaseImage(): Image {
            return image.create(this.width, this.height)
        }

        createStackBaseimage(): Image {
            return image.create(this.width, this.getStackImageFullHeight())
        }

        drawStamp(image: Image, value: CardAttributeValues) {
            const match = this.stamps.find(stamp => value === stamp.value)
            if (!!match) {
                image.drawTransparentImage(match.image, (this.width - match.image.width) / 2, (this.height - match.image.height) / 2)
            }
        }

        drawCardFront(image: Image, x: number, y: number, card: CardData) {
            function createTextDrawZone(text: string, color: number, rowLimit: number, columnLimit: number, isDynamic: boolean): DrawZone {
                let lines = []
                let index = 0
        
                while (index < text.length && lines.length < rowLimit) {
                    lines.push(text.substr(index, columnLimit))
                    index += columnLimit
                }
        
                return {
                    width: isDynamic
                        ? (lines.length > 1 ? columnLimit : text.length) * tinyFont.charWidth() - 1
                        : columnLimit * tinyFont.charWidth() - 1,
                    height: isDynamic
                        ? lines.length * tinyFont.charHeight() - 1
                        : rowLimit * tinyFont.charHeight() - 1,
                    image: null,
                    repeats: 0,
                    lines: lines,
                    color: color,
                }
            }
        
            function createImageDrawZone(image: Image, repeats: number): DrawZone {
                if (!!image) {
                    return {
                        width: image.width * repeats,
                        height: image.height,
                        image: image,
                        repeats: repeats,
                        lines: null,
                        color: 0,
                    }
                } else {
                    return null
                }
            }
        
            function createSpaceDrawZone(width: number, height: number): DrawZone {
                return {
                    width: width,
                    height: height,
                    image: null,
                    repeats: 0,
                    lines: null,
                    color: 0
                }
            }
    
            image.drawTransparentImage(this.frontImage, x, y)
            let top = y + this.margin
            this.rows.forEach(row => {
                let sections: DrawRowSection[] = []
                for (let align = 0; align < 3; align++) {                    
                    sections.push({
                        align: align,
                        width: 0,
                        zones: []
                    })
                }
                let drawZone: DrawZone
                let rowHeight: number = 0
                let attribute: CardAttributeValues
                row.forEach(zone => {
                    drawZone = null
                    switch (zone.zoneType) {
                        case ZoneTypes.Text:
                            drawZone = createTextDrawZone(zone.text, zone.color, zone.height, zone.width, zone.isDynamic)
                            break
                        case ZoneTypes.Image:
                            drawZone = createImageDrawZone(zone.image, 1)
                            break
                        case ZoneTypes.EmptySpace:
                            drawZone = createSpaceDrawZone(zone.width - this.spacing, zone.height - this.spacing)
                            break
                        case ZoneTypes.AttributeText:
                            attribute = card.getAttribute(zone.attribute)
                            if (typeof attribute === 'number') {
                                drawZone = createTextDrawZone(attribute.toString(), zone.color, zone.height, zone.width, zone.isDynamic)
                            } else if (attribute != null) {
                                drawZone = createTextDrawZone(attribute, zone.color, zone.height, zone.width, zone.isDynamic)
                            }
                            break
                        case ZoneTypes.RepeatImage:
                            attribute = card.getAttribute(zone.attribute)
                            if (typeof attribute === 'number') {
                                drawZone = createImageDrawZone(zone.image, attribute)
                            }
                            break
                        case ZoneTypes.LookupAttributeAsText:
                        case ZoneTypes.LookupAttributeAsImage:
                            attribute = card.getAttribute(zone.attribute)
                            const lookupValue = zone.lookupTable.find(lookup => lookup.value === attribute)
                            if (!!lookupValue) {
                                if (typeof lookupValue.drawable === 'string' && zone.zoneType === ZoneTypes.LookupAttributeAsText) {
                                    drawZone = createTextDrawZone(lookupValue.drawable, zone.color, zone.height, zone.width, zone.isDynamic)
                                } else if (zone.zoneType === ZoneTypes.LookupAttributeAsImage) {
                                    drawZone = createImageDrawZone(lookupValue.drawable as Image, 1)
                                }
                            }
                            break
                    }
                    if (drawZone == null) {
                        drawZone = createSpaceDrawZone(-this.spacing, 0)                    
                    }
                    sections[zone.align].width += drawZone.width + this.spacing
                    rowHeight = Math.max(drawZone.height, rowHeight)
                    sections[zone.align].zones.push(drawZone)
                })

                sections.forEach(section => {
                    let left = x
                    switch (section.align) {
                        case CardZoneAlignments.Left:
                            left += this.margin
                            break
                        case CardZoneAlignments.Center:
                            left += (this.width - section.width) / 2
                            break
                        case CardZoneAlignments.Right:
                            left += this.width - this.margin - section.width
                            break
                    }
        
                    section.zones.forEach(drawZone => {
                        if (!!drawZone.image) {
                            for (let repeat = 0; repeat < drawZone.repeats; repeat++) {
                                image.drawTransparentImage(drawZone.image, left, top)
                                left += drawZone.image.width
                            }
                        } else if (!!drawZone.lines) {
                            drawZone.lines.forEach((text, line) => {
                                tinyFont.print(image, left, top + line * tinyFont.charHeight(), text, drawZone.color)
                            })
                            left += drawZone.width
                        }
                        left += this.spacing
                    })
                })

                top += rowHeight + this.spacing
            })
        }        

        drawCardBack(image: Image, x: number, y: number) {
            image.drawTransparentImage(this.backImage, x, y)
        }
    
        drawCardStack(image: Image, x: number, y: number, cards: CardData[], isStackFaceUp: boolean, isTopCardFaceUp: boolean, ) {
            if (cards.length > 1) {
                const stackImage = this.getStackImage(cards.length, isStackFaceUp)
                y = y + this.getStackImageFullHeight() - stackImage.height
                image.drawTransparentImage(stackImage, x, y)
            } else if (cards.length === 1) {
                y = y + this.getStackImageFullHeight() - this.height
            } else {
                return
            }
            if (isTopCardFaceUp) {
                this.drawCardFront(image, x, y, cards[0])
            } else {
                this.drawCardBack(image, x, y)
            }
        }
    }

    export function createEmptySpaceColumn(align: CardZoneAlignments, width: number, height: number): DesignColumn {
        return {
            zoneType: ZoneTypes.EmptySpace,
            align: align,
            width: width,
            height: height,
        }
    }
    export function createTextColumn(align: CardZoneAlignments, text: string, color: number, columns: number, rows: number, isDynamic: boolean): DesignColumn {
        return {
            zoneType: ZoneTypes.Text,
            align: align,
            text: text,
            color: color,
            width: columns,
            height: rows,
            isDynamic: isDynamic,
        }
    }
    export function createAttributeAsPlainTextColumn(align: CardZoneAlignments, attribute: number, color: number, columns: number, rows: number, isDynamic: boolean): DesignColumn {
        return {
            zoneType: ZoneTypes.AttributeText,
            align: align,
            attribute: attribute,
            color: color,
            width: columns,
            height: rows,
            isDynamic: isDynamic,
        }
    }
    export function createAttributeAsLookupTextColumn(align: CardZoneAlignments, attribute: number, lookupTable: DesignLookup[], color: number, columns: number, rows: number, isDynamic: boolean): DesignColumn {
        return {
            zoneType: ZoneTypes.LookupAttributeAsText,
            align: align,
            attribute: attribute,
            color: color,
            width: columns,
            height: rows,
            isDynamic: isDynamic,
            lookupTable: lookupTable
        }
    }
    export function createImageColumn(align: CardZoneAlignments, image: Image): DesignColumn {
        return {
            zoneType: ZoneTypes.Image,
            align: align,
            image: image,
        }
    }
    export function createAttributeAsRepeatImageColumn(align: CardZoneAlignments, attribute: number, image: Image): DesignColumn {
        return {
            zoneType: ZoneTypes.RepeatImage,
            align: align,
            attribute: attribute,
            image: image,            
        }
    }
    export function createAttributeAsLookupImageColumn(align: CardZoneAlignments, attribute: number, lookupTable: DesignLookup[]): DesignColumn {
        return {
            zoneType: ZoneTypes.LookupAttributeAsImage,
            align: align,
            attribute: attribute,
            lookupTable: lookupTable
        }
    }
}