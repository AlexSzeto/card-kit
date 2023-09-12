//% color="#333333" icon="\uf249" block="Card Design"
//% groups="['Create', 'Add Row', 'Add Text', 'Add Image', 'Add Misc', 'Graphics', 'Dimensions']"
namespace cardDesign {

    const DEFAULT_CARD_FRONT = img`
    . c c c c .
    c b 1 1 b c
    c 1 1 1 1 c
    c 1 1 1 1 c
    c b 1 1 b c
    . c c c c .
    `
    const DEFAULT_ROUNDED_RECTANGLE = img`
    . 1 .
    1 1 1
    . 1 .
    `
    function createFlatColorImage(image: Image, color: number): Image {
        const result = image.clone()
        for (let c = 0; c < 16; c++) {
            result.replace(c, color)
        }
        return result
    }

    //% blockId="textToImageLookupPicker"
    //% blockHidden=true
    //% block="text $text to image $image"
    export function createTextToImageLookupPair(text: string, image: Image): cardKit.DesignLookup {
        return new cardKit.DesignLookup(text, image)
    }

    //% group="Create" blockSetVariable="myCardDesign"
    //% block="card design"
    export function createCardDesignTemplate(): CardDesignTemplate {
        return new CardDesignTemplate()
    }

    export class CardDesignTemplate {
        //% group="Dimensions" blockSetVariable="myCardDesign"
        //% blockCombine block="width"
        width: number
        //% group="Dimensions" blockSetVariable="myCardDesign"
        //% blockCombine block="height"
        height: number
        //% group="Dimensions" blockSetVariable="myCardDesign"
        //% blockCombine block="margin"
        margin: number
        //% group="Dimensions" blockSetVariable="myCardDesign"
        //% blockCombine block="spacing"
        spacing: number
        //% group="Dimensions" blockSetVariable="myCardDesign"
        //% blockCombine block="card thickness"
        cardThickness: number
        //% group="Dimensions" blockSetVariable="myCardDesign"
        //% blockCombine block="max deck size"
        maxDeckSize: number

        //% group="Graphics" blockSetVariable="myCardDesign"
        //% blockCombine block="card front frame"
        frontFrame: Image
        //% group="Graphics" blockSetVariable="myCardDesign"
        //% blockCombine block="card back frame"
        backFrame: Image
        //% group="Graphics" blockSetVariable="myCardDesign"
        //% blockCombine block="card front stack frame"
        frontStackFrame: Image
        //% group="Graphics" blockSetVariable="myCardDesign"
        //% blockCombine block="card back stack frame"
        backStackFrame: Image

        rows: cardKit.DesignRow[]
        
        constructor() {
            this.width = 12
            this.height = 20

            this.frontFrame = DEFAULT_CARD_FRONT
            this.backFrame = createFlatColorImage(DEFAULT_ROUNDED_RECTANGLE, 4)
            this.frontStackFrame = createFlatColorImage(DEFAULT_ROUNDED_RECTANGLE, 11)
            this.backStackFrame = createFlatColorImage(DEFAULT_ROUNDED_RECTANGLE, 14)

            this.cardThickness = 0.2
            this.maxDeckSize = 60

            this.margin = 2
            this.spacing = 1

            resetDesignZones(this)
        }

        export(): cardKit.CardDesign {
            return new cardKit.CardDesign(
                this.width,
                this.height,
                this.frontFrame,
                this.backFrame,
                this.frontStackFrame,
                this.backStackFrame,
                Math.ceil(1.0 / this.cardThickness),
                Math.floor(this.maxDeckSize * this.cardThickness),
                this.rows,
                this.margin,
                this.spacing
            )
        }
    }

    //% group="Add Row"
    //% weight=100
    //% block="reset $design zones"
    //% design.shadow="variables_get" design.defl="myCardDesign"
    export function resetDesignZones(design: CardDesignTemplate) {
        design.rows = []
        editNextRow(design)
    }

    //% group="Add Row"
    //% weight=99
    //% block="edit $design next row"
    //% design.shadow="variables_get" design.defl="myCardDesign"
    export function editNextRow(design: CardDesignTemplate) {
        design.rows.push(new cardKit.DesignRow(CardZoneAlignments.Center, []))
    }

    //% group="Add Row"
    //% weight=98
    //% block="align $design current row $alignment"
    //% design.shadow="variables_get" design.defl="myCardDesign"
    export function changeDesignCurrentRowAlignment(design: CardDesignTemplate, alignment: CardZoneAlignments) {
        design.rows[design.rows.length - 1].align = alignment
    }

    function addDesignColumn(design: CardDesignTemplate, column: cardKit.DesignColumn) {
        design.rows[design.rows.length - 1].columns.push(column)
    }

    //% group="Add Text"
    //% inlineInputMode=inline
    //% block="add to current row in $design text $text|| in $color limit line length $charsPerLine max lines $maxLines"
    //% design.shadow="variables_get" design.defl="myCardDesign"
    //% color.shadow="colorindexpicker" color.defl=15
    //% charsPerLine.defl=0 maxLines.defl=1
    export function addStaticText(design: CardDesignTemplate, text: string, color: number = 15, charsPerLine: number = 0, maxLines: number = 1) {
        addDesignColumn(design, cardKit.createTextColumn(text, color, charsPerLine <= 0 ? text.length : charsPerLine, maxLines))
    }

    //% group="Add Image"
    //% block="add to current row in $design image $image"
    //% design.shadow="variables_get" design.defl="myCardDesign"
    export function addStaticImage(design: CardDesignTemplate, image: Image) {
        addDesignColumn(design, cardKit.createImageColumn(image))
    }

    //% group="Add Image"
    //% block="add to current row in $design card picture"
    //% design.shadow="variables_get" design.defl="myCardDesign"
    export function addCardPicture(design: CardDesignTemplate, ) {
        addDesignColumn(design, cardKit.createPictureColumn())
    }

    //% group="Add Image"
    //% inlineInputMode="inline"
    //% block="add to current row in $design image $image repeat $attribute times"
    //% design.shadow="variables_get" design.defl="myCardDesign"
    //% attribute.shadow="attributePicker"
    export function addRepeatImage(design: CardDesignTemplate, attribute: number, image: Image) {
        addDesignColumn(design, cardKit.createAttributeAsRepeatImageColumn(attribute, image))
    }

    //% group="Add Text"
    //% inlineInputMode="inline"
    //% block="add to current row in $design $attribute as text|| in $color limit line length $charsPerLine max lines $maxLines"
    //% design.shadow="variables_get" design.defl="myCardDesign"
    //% attribute.shadow="attributePicker"
    //% color.shadow="colorindexpicker" color.defl=15
    //% charsPerLine.defl=5 maxLines.defl=1
    export function addAttributeText(design: CardDesignTemplate, attribute: number, color: number = 15, charsPerLine: number = 5, maxLines: number = 1) {
        addDesignColumn(design, cardKit.createAttributeAsPlainTextColumn(attribute, color, charsPerLine, maxLines))
    }

    //% group="Add Text"
    //% block="add to current row in $design text from $textLookupTable index $attribute|| in $color limit line length $charsPerLine max lines $maxLines"
    //% design.shadow="variables_get" design.defl="myCardDesign"
    //% attribute.shadow="attributePicker"
    //% color.shadow="colorindexpicker" color.defl=15
    //% charsPerLine.defl=5 maxLines.defl=1
    export function addAttributeIndexText(design: CardDesignTemplate, attribute: number, textLookupTable: string[], color: number = 15, charsPerLine: number = 5, maxLines: number = 1) {
        addDesignColumn(design, cardKit.createAttributeAsLookupTextColumn(attribute, color, charsPerLine, maxLines, cardKit.createNumberToTextLookupTable(textLookupTable)))
    }

    //% group="Add Image"
    //% block="add to current row in $design image from $imageLookupTable index $attribute"
    //% design.shadow="variables_get" design.defl="myCardDesign"
    //% attribute.shadow="attributePicker"
    //% imageLookupTable.shadow="lists_create_with" imageLookupTable.defl="screen_image_picker"
    export function addAttributeIndexImage(design: CardDesignTemplate, attribute: number, imageLookupTable: Image[]) {
        addDesignColumn(design, cardKit.createAttributeAsLookupImageColumn(attribute, cardKit.createNumberToImageLookupTable(imageLookupTable)))
    }

    //% group="Add Image"
    //% block="add to current row in $design image take $attribute and change $lookupTable"
    //% design.shadow="variables_get" design.defl="myCardDesign"
    //% attribute.shadow="attributePicker"
    //% lookupTable.shadow="lists_create_with" lookupTable.defl="textToImageLookupPicker"
    export function addAttributeTextToImage(design: CardDesignTemplate, attribute: number, lookupTable: cardKit.DesignLookup[]) {
        addDesignColumn(design, cardKit.createAttributeAsLookupImageColumn(attribute, lookupTable))
    }

    //% group="Add Misc"
    //% block="add to current row in $design empty space width $width height $height"
    //% design.shadow="variables_get" design.defl="myCardDesign"
    export function addEmptySpace(design: CardDesignTemplate, width: number, height: number) {
        addDesignColumn(design, cardKit.createEmptySpaceColumn(width, height))
    }

}

//% color="#ff3333" icon="\uf249" block="Deck Builder"
//% groups=['Create', 'Attributes', 'Variations', 'Add Card']
namespace deckBuilder {

    //% shim=ENUM_GET
    //% blockId="attributePicker"
    //% blockHidden=true
    //% block="Card $arg"
    //% enumName="CardAttributes"
    //% enumMemberName="attribute"
    //% enumPromptHint="e.g. Name, Cost, Power..."
    //% enumInitialMembers="Rank, Suit"
    export function _cardAttributeEnumShim(arg: number) {
        // This function should do nothing, but must take in a single
        // argument of type number and return a number value.
        return arg;
    }

    //% group="Create" blockSetVariable="myCardDeck"
    //% block="$design deck"
    //% design.shadow="variables_get" design.defl="myCardDesign"
    export function createEmptyDeck(design: cardDesign.CardDesignTemplate): cardKit.CardStack {
        return new cardKit.CardStack(design.export(), [], false, false)
    }

    //% group="Create" blockSetVariable="myCard"
    //% block="$design card|| with picture $picture"
    //% design.shadow="variables_get" design.defl="myCardDesign"
    export function createCard(design: cardDesign.CardDesignTemplate, picture: Image = null): cardKit.Card {
        return new cardKit.Card(
            design.export(),
            new cardKit.CardData(picture),
            true
        )        
    }

    //% group="Attributes"
    //% block="set $card picture to $picture"
    //% card.shadow="variables_get" card.defl="myCard"
    export function setCardPicture(card: cardKit.Card, picture: Image) {
        card.getData().picture = picture
    }

    //% group="Attributes"
    //% block="$card picture"
    //% card.shadow="variables_get" card.defl="myCard"
    export function getCardPicture(card: cardKit.Card): Image {
        return card.getData().picture
    }
    
    //% group="Attributes"
    //% block="set $card $attribute to number $value"
    //% card.shadow="variables_get" card.defl="myCard"
    //% attribute.shadow="attributePicker"
    export function setCardNumberAttribute(card: cardKit.Card, attribute: number, value: number) {
        card.getData().setAttribute(attribute, value)
    }

    //% group="Attributes"
    //% block="set $card $attribute to text $text"
    //% card.shadow="variables_get" card.defl="myCard"
    //% attribute.shadow="attributePicker"
    export function setCardTextAttribute(card: cardKit.Card, attribute: number, text: string) {
        card.getData().setAttribute(attribute, text)
    }

    //% group="Attributes"
    //% block="$card $attribute number"
    //% card.shadow="variables_get" card.defl="myCard"
    //% attribute.shadow="attributePicker"
    export function getCardNumberAttribute(card: cardKit.Card, attribute: number) {
        const value = card.getData().getAttribute(attribute)
        if(typeof value == "number") {
            return value
        } else {
            return 0
        }
    }

    //% group="Attributes"
    //% block="$card $attribute text"
    //% card.shadow="variables_get" card.defl="myCard"
    //% attribute.shadow="attributePicker"
    export function getCardTextAttribute(card: cardKit.Card, attribute: number) {
        const value = card.getData().getAttribute(attribute)
        if (typeof value == "string") {
            return value
        } else {
            return value.toString()
        }
    }

    class CardAttributeVariation {
        constructor(
            public attribute: number,
            public values: cardKit.CardAttributeValues[]
        ) {}
    }

    //% group="Variations" color="#3333ff"
    //% blockId="numberVariationsPicker"
    //% block="$attribute between $startNumber and $endNumber"
    //% attribute.shadow="attributePicker"
    //% startNumber.defl=1 endNumber.defl=10
    export function createNumberAttributeVariations(attribute: number, startNumber: number, endNumber: number): CardAttributeVariation {
        const values: number[] = []
        let direction: number = startNumber > endNumber ? -1 : 1
        for (let v = startNumber; v <= endNumber; v += direction) {
            values.push(v)
        }
        return new CardAttributeVariation(attribute, values)
    }

    //% group="Variations" color="#3333ff"
    //% blockId="numberListVariationsPicker"
    //% block="$attribute between $values"
    //% attribute.shadow="attributePicker"
    export function createNumberListAttributeVariations(attribute: number, values: number[]): CardAttributeVariation {
        return new CardAttributeVariation(attribute, values)
    }

    //% group="Variations" color="#3333ff"
    //% blockId="textVariationsPicker"
    //% block="$attribute between $texts"
    //% attribute.shadow="attributePicker"
    export function createTextAttributeVariations(attribute: number, texts: string[]): CardAttributeVariation {
        return new CardAttributeVariation(attribute, texts)
    }

    function __addCardVariationsFromIndex(deckData: cardKit.CardData[], cardData: cardKit.CardData, attributes: CardAttributeVariation[], attrIndex: number, copies: number) {
        const variation = attributes[attrIndex]
        for (let i = 0; i < variation.values.length; i++) {
            cardData.setAttribute(variation.attribute, variation.values[i])
            if(attrIndex + 1 < attributes.length) {
                __addCardVariationsFromIndex(deckData, cardData, attributes, attrIndex + 1, copies)
            } else {
                for (let c = 0; c < copies; c++) {
                    deckData.push(cardData.clone())
                }
            }
        }
    }

    //% group="Add Card"
    //% block="add to $deck modify $card add every combination of $variations|| $copies copies each"
    //% deck.shadow="variables_get" deck.defl="myCardDeck"
    //% card.shadow="variables_get" card.defl="myCard"
    //% variations.shadow="lists_create_with" variations.defl="numberVariationsPicker"
    //% copies.defl=1
    export function addCardVariantsToDeck(deck: cardKit.CardStack, card: cardKit.Card, variations: CardAttributeVariation[], copies: number = 1) {
        const insertData: cardKit.CardData[] = []
        __addCardVariationsFromIndex(insertData, card.getData().clone(), variations, 0, copies)
        deck.insertCardData(insertData)
    }
    
    //% group="Add Card"
    //% block="add to $deck $copies copies of $card"
    //% deck.shadow="variables_get" deck.defl="myCardDeck"
    //% card.shadow="variables_get" card.defl="myCard"
    //% copies.defl=1
    export function addCardCopiesToDeck(deck: cardKit.CardStack, card: cardKit.Card, copies: number = 1) {
        const insertData: cardKit.CardData[] = []
        for (let i = 0; i < copies; i++) {
            insertData.push(card.getData().clone())
        }
        deck.insertCardData(insertData)
    }
}

enum SelectedCardMoveDirections {
    Up,
    Down,
    Left,
    Right
}

function getSelectedCardOffset(moveDirection: SelectedCardMoveDirections, width: number, height: number): number {
    switch (moveDirection) {
        case SelectedCardMoveDirections.Up: return -height / 2
        case SelectedCardMoveDirections.Down: return height / 2
        case SelectedCardMoveDirections.Left: return -width / 2
        case SelectedCardMoveDirections.Right: return width / 2
    }
}

namespace cards {
    export function createEmptyHand(
        design: cardDesign.CardDesignTemplate,
        x: number, y: number,
        isSpreadingLeftRight: boolean,
        selectedCardMoveDirection: SelectedCardMoveDirections
    ): cardKit.CardSpread {
        return new cardKit.CardSpread(
            x, y, 1, [],
            design.width,
            design.height,
            isSpreadingLeftRight, 1,
            getSelectedCardOffset(selectedCardMoveDirection, design.width, design.height),
            false
        )
    }

    const DEFAULT_SCROLL_UP = img`
        . . . . . . . .
        . . . f f . . .
        . . f d d f . .
        . f d 1 1 d f .
        f 1 1 1 1 1 1 f
        f b b b b b b f
        . f f f f f f .
        . . . . . . . .
    `
    const DEFAULT_SCROLL_DOWN = img`
        . . . . . . . .
        . f f f f f f .
        f d 1 1 1 1 d f
        f 1 1 1 1 1 1 f
        . f b 1 1 b f .
        . . f b b f . .
        . . . f f . . .
        . . . . . . . .
    `
    const DEFAULT_SCROLL_LEFT = img`
        . . . . f f . .
        . . . f 1 b f .
        . . f 1 1 b f .
        . f 1 1 1 b f .
        . f d 1 1 b f .
        . . f d 1 b f .
        . . . f d b f .
        . . . . f f . .
    `
    const DEFAULT_SCROLL_RIGHT = img`
        . . f f . . . .
        . f 1 d f . . .
        . f 1 1 d f . .
        . f 1 1 1 b f .
        . f 1 1 1 b f .
        . f 1 1 b f . .
        . f 1 b f . . .
        . . f f . . . .
    `

    export function createEmptyGrid(
        design: cardDesign.CardDesignTemplate,
        x: number, y: number,
        columns: number, rows: number,
        isScrollingLeftRight: boolean
    ): cardKit.CardGrid {
        return new cardKit.CardGrid(
            x, y, 1, [],
            design.width,
            design.height,
            rows, columns,
            isScrollingLeftRight,
            1, false,
            isScrollingLeftRight 
                ? sprites.create(DEFAULT_SCROLL_LEFT, SpriteKind.Cursor) 
                : sprites.create(DEFAULT_SCROLL_UP, SpriteKind.Cursor),
            isScrollingLeftRight 
                ? sprites.create(DEFAULT_SCROLL_RIGHT, SpriteKind.Cursor)
                : sprites.create(DEFAULT_SCROLL_DOWN, SpriteKind.Cursor)
        )
    }
}