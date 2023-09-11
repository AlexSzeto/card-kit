enum CardZoneAlignments {
    Left,
    Center,
    Right
}

namespace cardKit {

    type CardAttributeValues = string | number
    export class CardAttribute {
        constructor(
            public name: string,
            public value: CardAttributeValues,
        ) {}
    }

    export class CardData {
        private attributes: CardAttribute[]

        constructor(
            public picture?: Image,
        ) {
            this.attributes = []
        }

        getAttribute(name: string): CardAttributeValues {
            const attribute = this.attributes.find(attr => attr.name === name)
            if (!!attribute) {
                return attribute.value
            } else {
                return null
            }
        }

        setAttribute(name: string, value: CardAttributeValues): void {
            const attribute = this.attributes.find(attr => attr.name === name)
            if (!!attribute) {
                attribute.value = value
            } else {
                this.attributes.push(new CardAttribute(name, value))
            }
        }
    }

    enum ZoneTypes {
        CardPicture,
        AttributeText,
        RepeatImage,
        LookupAttributeAsText,
        LookupAttributeAsImage,
        Text,
        Image,
        EmptySpace,
    }
        
    type AttributeLookupDrawables = string | Image
    export class LayoutLookup {
        constructor(
            public value: CardAttributeValues,
            public drawable: AttributeLookupDrawables,
        ) {}
    }

    export function createNumberToTextLookupTable(texts: string[]): LayoutLookup[] {
        const lookupTable: LayoutLookup[] = []
        texts.forEach((text, index) => {
            lookupTable.push(new LayoutLookup(index, text))
        })
        return lookupTable
    }

    export function createNumberToImageLookupTable(images: Image[]): LayoutLookup[] {
        const lookupTable: LayoutLookup[] = []
        images.forEach((image, index) => {
            lookupTable.push(new LayoutLookup(index, image))
        })
        return lookupTable
    }

    export class LayoutColumn {
        constructor(
            public zoneType: ZoneTypes,
            public text?: string,
            public color?: number,
            public width?: number,
            public height?: number,
            public image?: Image,
            public lookupTable?: LayoutLookup[]
        ) { }
    }

    export class LayoutRow {
        constructor(
            public align: CardZoneAlignments,
            public columns: LayoutColumn[]
        ) { }
    }

    type DrawZone = {
        width: number
        height: number
        image: Image
        repeats: number
        lines: string[]
        color: number
    }
    
    export class CardLayout {
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
            public rows: LayoutRow[],
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
            return Math.floor(Math.min(this.maxStackHeight, Math.max(1, cardStackSize / this.cardsPerPixel))) + this.height
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

        getStackTopYOffset(cardStackSize: number): number {
            return this.getStackImageFullHeight() / 2 - this.getStackHeight(cardStackSize) + this.height / 2
        }
        
        createCardBaseImage(): Image {
            return image.create(this.width, this.height)
        }

        createStackBaseimage(): Image {
            return image.create(this.width, this.getStackImageFullHeight())
        }

        drawCardFront(image: Image, x: number, y: number, card: CardData) {

            function createTextDrawZone(text: string, color: number, rowLimit: number, columnLimit: number): DrawZone {
                let lines = []
                let index = 0
        
                while (index < text.length && lines.length < rowLimit) {
                    lines.push(text.substr(index, columnLimit))
                    index += columnLimit
                }
        
                return {
                    width: (lines.length > 1 ? columnLimit : text.length) * tinyFont.charWidth() - 1,
                    height: lines.length * tinyFont.charHeight() - 1,
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
                let columns: DrawZone[] = []
                let drawZone: DrawZone
                let rowWidth: number = (row.columns.length - 1) * this.spacing
                let rowHeight: number = 0
                let attribute: CardAttributeValues
                row.columns.forEach(zone => {
                    drawZone = null
                    switch (zone.zoneType) {
                        case ZoneTypes.Text:
                            drawZone = createTextDrawZone(zone.text, zone.color, zone.height, zone.width)
                            break
                        case ZoneTypes.Image:
                            drawZone = createImageDrawZone(zone.image, 1)
                            break
                        case ZoneTypes.EmptySpace:
                            drawZone = createSpaceDrawZone(zone.width - this.spacing, zone.height - this.spacing)
                            break
                        case ZoneTypes.CardPicture:
                            drawZone = createImageDrawZone(card.picture, 1)
                            break
                        case ZoneTypes.AttributeText:
                            attribute = card.getAttribute(zone.text)
                            if (typeof attribute === 'number') {
                                drawZone = createTextDrawZone(attribute.toString(), zone.color, zone.height, zone.width)
                            } else if (attribute != null) {
                                drawZone = createTextDrawZone(attribute, zone.color, zone.height, zone.width)
                            }
                            break
                        case ZoneTypes.RepeatImage:
                            attribute = card.getAttribute(zone.text)
                            if (typeof attribute === 'number') {
                                drawZone = createImageDrawZone(zone.image, attribute)
                            }
                            break
                        case ZoneTypes.LookupAttributeAsText:
                        case ZoneTypes.LookupAttributeAsImage:
                            attribute = card.getAttribute(zone.text)
                            const lookupValue = zone.lookupTable.find(lookup => lookup.value === attribute)
                            if (!!lookupValue) {
                                if (typeof lookupValue.drawable === 'string' && zone.zoneType === ZoneTypes.LookupAttributeAsText) {
                                    drawZone = createTextDrawZone(lookupValue.drawable, zone.color, zone.height, zone.width)
                                } else if (zone.zoneType === ZoneTypes.LookupAttributeAsImage) {
                                    drawZone = createImageDrawZone(lookupValue.drawable as Image, 1)
                                }
                            }
                            break
                    }
                    if (drawZone === null) {
                        drawZone = createSpaceDrawZone(-this.spacing, 0)                    
                    }
                    rowWidth += drawZone.width
                    rowHeight = Math.max(drawZone.height, rowHeight)
                    columns.push(drawZone)
                })
    
                let left = x
                switch (row.align) {
                    case CardZoneAlignments.Left:
                        left += this.margin
                        break
                    case CardZoneAlignments.Center:
                        left += (this.width - rowWidth) / 2
                        break
                    case CardZoneAlignments.Right:
                        left += this.width - this.margin - rowWidth
                        break
                }
    
                columns.forEach(drawZone => {
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

    export function createTextLayout(text: string, color: number, columns: number, rows: number): LayoutColumn {
        return new LayoutColumn(ZoneTypes.Text, text, color, columns, rows, null, null)
    }
    export function createImageLayout(image: Image): LayoutColumn {
        return new LayoutColumn(ZoneTypes.Image, null, 0, 0, 0, image, null)
    }
    export function createEmptySpaceLayout(width: number, height: number): LayoutColumn {
        return new LayoutColumn(ZoneTypes.EmptySpace, null, null, width, height, null, null)
    }
    export function createPictureLayout(): LayoutColumn {
        return new LayoutColumn(ZoneTypes.CardPicture, null, 0, 0, 0, null, null)
    }
    export function createAttributeAsPlainTextLayout(attribute: string, color: number, columns: number, rows: number): LayoutColumn {
        return new LayoutColumn(ZoneTypes.AttributeText, attribute, color, columns, rows, null, null)
    }
    export function createAttributeAsRepeatImageLayout(attribute: string, image: Image): LayoutColumn {
        return new LayoutColumn(ZoneTypes.RepeatImage, attribute, 0, 0, 0, image, null)
    }
    export function createAttributeAsLookupTextLayout(attribute: string, color: number, columns: number, rows: number, lookupTable: LayoutLookup[]): LayoutColumn {
        return new LayoutColumn(ZoneTypes.LookupAttributeAsText, attribute, color, columns, rows, null, lookupTable)
    }
    export function createAttributeAsLookupImageLayout(attribute: string, lookupTable: LayoutLookup[]): LayoutColumn {
        return new LayoutColumn(ZoneTypes.LookupAttributeAsImage, attribute, 0, 0, 0, null, lookupTable)
    }
}