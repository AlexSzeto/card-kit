enum CardLayoutSubjects {
    Title,
    Description,
    Icon,
    Value,
    Picture,
    Text,
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

    export class Card {        
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
        ) {}
    }

    export class LayoutRowData {
        constructor(
            public align: CardLayoutAlignments,
            public columns: LayoutColumnData[]
        ) {}
    }

    export class CardLayoutData {
        background: Image
        constructor(
            public width: number,
            public height: number,
            frame: Image,
            public icons: { [id: string]: Image },
            public valueText: string[],
            public rows: LayoutRowData[],
            public margin: number,
            public spacing: number,       
        ) {
            const dialog = new game.BaseDialog(width, height, frame)
            this.background = dialog.image
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

        while(index + columnLimit < text.length && lines.length < rowLimit - 1) {
            lines.push(text.substr(index, columnLimit))
            index += columnLimit
        }
        lines.push(text.substr(index, columnLimit))
        console.log(lines)

        return {
            width: (lines.length > 1 ? columnLimit : text.length) * 4 - 1,
            height: lines.length * 6 - 1,
            image: null,
            lines: lines,
            color: color,
        }
    }

    function getImageDrawData(image: Image): DrawData {
        if(!!image) {
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

    export function drawCard(card: Card, layout: CardLayoutData, x: number, y: number, image: Image) {
        image.drawTransparentImage(layout.background, x, y)
        let top = y + layout.margin
        layout.rows.forEach(row => {
            let columnDrawData: DrawData[] = []
            let width: number = (row.columns.length - 1) * layout.spacing
            let height: number = 0

            row.columns.forEach(data => {
                switch(data.subject) {
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
                }

                width += columnDrawData[columnDrawData.length - 1].width
                height += Math.max(columnDrawData[columnDrawData.length - 1].height, height)
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
                if(!!drawData.image) {
                    image.drawTransparentImage(drawData.image, x + left, y + top)
                    top += drawData.height
                } else {
                    drawData.lines.forEach(line => {
                        tinyFont.print(image, line, x + left, y + top, drawData.color)
                        top += 6
                    })
                    top -= 1
                }
                left += layout.spacing
                top += layout.spacing
            })
        })
    }

    export function createSingleCardImage(card: Card, layout: CardLayoutData): Image {
        const cardImage = image.create(layout.width, layout.height)
        drawCard(card, layout, 0, 0, cardImage)
        return cardImage
    }

    let playingCardLayout = new CardLayoutData(
        12,
        20,
        img`
            . 1 1 1 1 .
            1 1 1 1 1 1
            1 1 1 1 1 1
            1 1 1 1 1 1
            1 1 1 1 1 1
            . 1 1 1 1 .
            `,
        {
            'heart': img`
            . 2 . 2 .
            2 2 2 2 2
            2 2 2 2 2
            2 2 2 2 2
            . 2 2 2 .
            . . 2 . .
            `,
            'diamond': img`
            . . 2 . .
            . 2 2 2 .
            2 2 2 2 2
            2 2 2 2 2
            . 2 2 2 .
            . . 2 . .
            `,
            'club': img`
            . f f f .
            f f f f f
            f f f f f
            f . f . f
            . . f . .
            . f f f .
            `,
            'spades': img`
            . . f . .
            . f f f .
            f f f f f
            f f f f f
            . . f . .
            . f f f .
            `,
        },
        ['JK', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'],
        [
            new LayoutRowData(
                CardLayoutAlignments.Left,
                [
                    new LayoutColumnData(CardLayoutSubjects.Value, '', 15, 2, 1)
                ]                
            ),
            new LayoutRowData(
                CardLayoutAlignments.Left,
                [
                    new LayoutColumnData(CardLayoutSubjects.Icon)
                ]
            )
        ],
        1,
        1,
    )

    let aceOfSpades = new Card(
        'Ace of Spades',
        'Ace of Spades',
        'spades',
        1
    )

    let mySprite = sprites.create(cardKit.createSingleCardImage(aceOfSpades, playingCardLayout), SpriteKind.Player)
}



// Card
// Collection -> Deck -> Hand -> Pile