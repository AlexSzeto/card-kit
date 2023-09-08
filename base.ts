enum CardLayoutSubjects {
    Title,
    Description,
    Icon,
    Value,
    Picture,
    Text,
    Space,
}

enum CardLayoutAlignments {
    Left,
    Center,
    Right
}

namespace cardKit {

    // export class Cost {
    //     constructor(
    //         public category: string,
    //         public value: number,
    //     ) {}
    // }

    export class CardData {
        title: string
        description: string
        icon: string
        value: number
        picture: Image

        constructor(
            title?: string,
            description?: string,
            icon?: string,
            value?: number,
            picture?: Image,
        ) {
            this.title = !!title ? title : ""
            this.description = !!description ? description : ""
            this.icon = !!icon ? icon : ""
            this.value = isNaN(value) ? 0 : value
            this.picture = !!picture ? picture : null
        }
    }

    export class LayoutColumnData {
        constructor(
            public subject: CardLayoutSubjects,
            public text?: string,
            public color?: number,
            public textColumnLimit?: number,
            public textRowLimit?: number,
        ) { }
    }

    export class LayoutRowData {
        constructor(
            public align: CardLayoutAlignments,
            public columns: LayoutColumnData[]
        ) { }
    }

    export class CardLayoutData {
        frontImage: Image
        backImage: Image
        frontStackFrame: game.BaseDialog
        backStackFrame: game.BaseDialog
        stackImageHeight: number

        constructor(
            public width: number,
            public height: number,
            front: Image,
            back: Image,
            private frontStack: Image,
            private backStack: Image,
            public cardsPerPixel: number,
            public maxStackHeight: number,
            public shadowColor: number,
            public icons: { [id: string]: Image },
            public valueText: string[],
            public rows: LayoutRowData[],
            public margin: number,
            public spacing: number,
        ) {
            let dialog = new game.BaseDialog(width, height, front)
            this.frontImage = dialog.image
            dialog = new game.BaseDialog(width, height, back)
            this.backImage = dialog.image
            this.frontStackFrame = new game.BaseDialog(width, height, frontStack)
            this.backStackFrame = new game.BaseDialog(width, height, backStack)
            this.stackImageHeight = height + maxStackHeight
        }

        getStackHeight(cardStackSize: number): number {
            return Math.floor(Math.min(this.maxStackHeight, Math.max(1, cardStackSize / this.cardsPerPixel))) + this.height
        }

        getStackImage(cardStackSize: number, isFaceUp: boolean): Image {
            const stackHeight = this.getStackHeight(cardStackSize)
            if (isFaceUp) {
                this.frontStackFrame.resize(this.width, stackHeight, this.frontStack)
                return this.frontStackFrame.image
            } else {
                this.backStackFrame.resize(this.width, stackHeight, this.backStack)
                return this.backStackFrame.image
            }
        }
    }

    type DrawData = {
        width: number
        height: number
        image: Image
        lines: string[]
        color: number
    }

    function getTextDrawData(text: string, color: number, rowLimit: number, columnLimit: number): DrawData {
        let lines = []
        let index = 0

        while (index + columnLimit < text.length && lines.length < rowLimit - 1) {
            lines.push(text.substr(index, columnLimit))
            index += columnLimit
        }
        lines.push(text.substr(index, columnLimit))

        return {
            width: (lines.length > 1 ? columnLimit : text.length) * 4 - 1,
            height: lines.length * 6 - 1,
            image: null,
            lines: lines,
            color: color,
        }
    }

    function getImageDrawData(image: Image): DrawData {
        if (!!image) {
            return {
                width: image.width,
                height: image.height,
                image: image,
                lines: null,
                color: 0,
            }
        } else {
            return {
                width: 0,
                height: 0,
                image: null,
                lines: [""],
                color: 0,
            }
        }
    }

    function getSpaceData(width: number, height: number): DrawData {
        return {
            width: width,
            height: height,
            image: null,
            lines: null,
            color: 0
        }
    }

    export function drawFront(card: CardData, layout: CardLayoutData, image: Image, x: number, y: number) {
        image.drawTransparentImage(layout.frontImage, x, y)
        let top = y + layout.margin
        layout.rows.forEach(row => {
            let columnDrawData: DrawData[] = []
            let width: number = (row.columns.length - 1) * layout.spacing
            let height: number = 0

            row.columns.forEach(data => {
                switch (data.subject) {
                    case CardLayoutSubjects.Picture:
                        columnDrawData.push(getImageDrawData(card.picture))
                        break
                    case CardLayoutSubjects.Icon:
                        columnDrawData.push(getImageDrawData(layout.icons[card.icon]))
                        break
                    case CardLayoutSubjects.Title:
                        columnDrawData.push(getTextDrawData(card.title, data.color, data.textRowLimit, data.textColumnLimit))
                        break
                    case CardLayoutSubjects.Description:
                        columnDrawData.push(getTextDrawData(card.description, data.color, data.textRowLimit, data.textColumnLimit))
                        break
                    case CardLayoutSubjects.Value:
                        columnDrawData.push(getTextDrawData(!!layout.valueText ? layout.valueText[card.value] : card.value.toString(), data.color, data.textRowLimit, data.textColumnLimit))
                        break
                    case CardLayoutSubjects.Text:
                        columnDrawData.push(getTextDrawData(data.text, data.color, data.textRowLimit, data.textColumnLimit))
                        break
                    case CardLayoutSubjects.Space:
                        columnDrawData.push(getSpaceData(data.textColumnLimit - layout.spacing, data.textRowLimit - layout.spacing))
                        break
                }

                width += columnDrawData[columnDrawData.length - 1].width
                height = Math.max(columnDrawData[columnDrawData.length - 1].height, height)
            })

            let left = x
            switch (row.align) {
                case CardLayoutAlignments.Left:
                    left += layout.margin
                    break
                case CardLayoutAlignments.Center:
                    left += (layout.width - width) / 2
                    break
                case CardLayoutAlignments.Right:
                    left += layout.width - layout.margin - width
                    break
            }

            columnDrawData.forEach(drawData => {
                if (!!drawData.image) {
                    image.drawTransparentImage(drawData.image, x + left, y + top)
                    top += drawData.height
                } else if (!!drawData.lines) {
                    drawData.lines.forEach(line => {
                        tinyFont.print(image, line, x + left, y + top, drawData.color)
                        top += 6
                    })
                    top -= 1
                } else {
                    left += drawData.width
                }
                left += layout.spacing
                top += layout.spacing
            })
        })
    }

    export function drawBack(layout: CardLayoutData, image: Image, x: number, y: number) {
        image.drawTransparentImage(layout.backImage, x, y)
    }

    export function drawStack(deck: CardData[], layout: CardLayoutData, isStackFaceUp: boolean, isTopCardFaceUp: boolean, image: Image, x: number, y: number) {
        if (deck.length > 1) {
            const stackImage = layout.getStackImage(deck.length, isStackFaceUp)
            y = y + layout.stackImageHeight - stackImage.height
            image.drawTransparentImage(stackImage, x, y)
        } else if (deck.length === 1) {
            y = y + layout.stackImageHeight - layout.height
        } else {
            return
        }
        if (isTopCardFaceUp) {
            drawFront(deck[0], layout, image, x, y)
        } else {
            drawBack(layout, image, x, y)
        }
    }

    export function createCardImage(card: CardData, layout: CardLayoutData): Image {
        const cardImage = image.create(layout.width, layout.height)
        return cardImage
    }

    export function createStackImage(deck: CardData[], layout: CardLayoutData): Image {
        const deckImage = image.create(layout.width, layout.stackImageHeight)
        return deckImage
    }
}