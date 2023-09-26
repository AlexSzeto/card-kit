enum CardDesignFrameTypes {
    //% block="front"
    Front,
    //% block="back"
    Back,
    //% block="front stack"
    FrontStack,
    //% block="back stack"
    BackStack
}

enum CardContainerPositions {
    //% block="first"
    First,
    //% block="middle"
    Middle,
    //% block="last"
    Last,
    //% block="random"
    Random,
    //% block="cursor"
    Cursor
}

enum PointerDirections {
    //% block="up"
    Up,
    //% block="down"
    Down,
    //% block="left"
    Left,
    //% block="right"
    Right
}

enum CardLayoutSpreadDirections {
    //% block="left and right"
    LeftRight,
    //% block="up and down"
    UpDown,
}

//% color="#307d9c" icon="\uf2bb" block="Card Design"
//% advanced="true"
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
        for (let c = 1; c < 16; c++) {
            result.replace(c, color)
        }
        return result
    }

    //% blockId="textToImageLookupPicker"
    //% blockHidden=true
    //% block="text $text to image $image"
    //% image.shadow="screen_image_picker"
    export function createTextToImageLookupPair(text: string, image: Image): cardCore.DesignLookup {
        return { value: text, drawable: image }
    }

    //% group="Create" blockSetVariable="myDesign"
    //% block="blank design"
    export function createCardDesignTemplate(): CardDesignTemplate {
        return new CardDesignTemplate()
    }

    export class CardDesignTemplate {
        //% group="Dimensions" blockSetVariable="myDesign"
        //% blockCombine block="width"
        width: number
        //% group="Dimensions" blockSetVariable="myDesign"
        //% blockCombine block="height"
        height: number
        //% group="Dimensions" blockSetVariable="myDesign"
        //% blockCombine block="margin"
        margin: number
        //% group="Dimensions" blockSetVariable="myDesign"
        //% blockCombine block="spacing"
        spacing: number
        //% group="Dimensions" blockSetVariable="myDesign"
        //% blockCombine block="card thickness"
        cardThickness: number
        //% group="Dimensions" blockSetVariable="myDesign"
        //% blockCombine block="max stack size"
        maxStackSize: number

        frontFrame: Image
        backFrame: Image
        frontStackFrame: Image
        backStackFrame: Image

        rows: cardCore.DesignRow[]
        stamps: cardCore.StampLookup[]
        
        constructor() {
            this.width = 12
            this.height = 20

            this.frontFrame = DEFAULT_CARD_FRONT
            this.backFrame = createFlatColorImage(DEFAULT_ROUNDED_RECTANGLE, 4)
            this.frontStackFrame = createFlatColorImage(DEFAULT_ROUNDED_RECTANGLE, 11)
            this.backStackFrame = createFlatColorImage(DEFAULT_ROUNDED_RECTANGLE, 14)

            this.cardThickness = 0.2
            this.maxStackSize = 60

            this.margin = 2
            this.spacing = 1

            this.stamps = []
            resetDesignZones(this)
        }

        export(): cardCore.CardDesign {
            return new cardCore.CardDesign(
                this.width,
                this.height,
                this.frontFrame,
                this.backFrame,
                this.frontStackFrame,
                this.backStackFrame,
                Math.ceil(1.0 / this.cardThickness),
                Math.floor(this.maxStackSize * this.cardThickness),
                this.rows,
                this.stamps,
                this.margin,
                this.spacing
            )
        }
    }

    //% group="Graphics"
    //% block="set $design $frameType frame to $image"
    //% design.shadow="variables_get" design.defl="myDesign"
    //% image.shadow="screen_image_picker"
    export function setDesignGraphics(design: CardDesignTemplate, frameType: CardDesignFrameTypes, image: Image) {
        switch (frameType) {
            case CardDesignFrameTypes.Front: design.frontFrame = image; break;
            case CardDesignFrameTypes.Back: design.backFrame = image; break;
            case CardDesignFrameTypes.FrontStack: design.frontStackFrame = image; break;
            case CardDesignFrameTypes.BackStack: design.backStackFrame = image; break;
        }
    }

    //% group="Add Row"
    //% weight=100
    //% block="reset $design zones"
    //% design.shadow="variables_get" design.defl="myDesign"
    export function resetDesignZones(design: CardDesignTemplate) {
        design.rows = []
        editNextRow(design)
    }

    //% group="Add Row"
    //% weight=99
    //% block="edit $design next row"
    //% design.shadow="variables_get" design.defl="myDesign"
    export function editNextRow(design: CardDesignTemplate) {
        design.rows.push([])
    }

    function addDesignColumn(design: CardDesignTemplate, column: cardCore.DesignColumn) {
        design.rows[design.rows.length - 1].push(column)
    }

    //% group="Add Text"
    //% weight=100
    //% inlineInputMode=inline
    //% block="add to current row in $design align $align text $text|| in $color limit line length $charsPerLine max lines $maxLines fixed size $isFixedSize"
    //% design.shadow="variables_get" design.defl="myDesign"
    //% color.shadow="colorindexpicker" color.defl=15
    //% charsPerLine.defl=0 maxLines.defl=1
    //% isFixedSize.defl=false
    export function addStaticText(design: CardDesignTemplate, align: CardZoneAlignments, text: string, color: number = 15, charsPerLine: number = 0, maxLines: number = 1, isFixedSize: boolean = false) {
        addDesignColumn(design, cardCore.createTextColumn(align, text, color, charsPerLine <= 0 ? text.length : charsPerLine, maxLines, !isFixedSize))
    }

    //% group="Add Text"
    //% weight=99
    //% inlineInputMode="inline"
    //% block="add to current row in $design align $align $attribute as text|| in $color limit line length $charsPerLine max lines $maxLines fixed size $isFixedSize"
    //% design.shadow="variables_get" design.defl="myDesign"
    //% attribute.shadow="attributePicker"
    //% color.shadow="colorindexpicker" color.defl=15
    //% charsPerLine.defl=5 maxLines.defl=1
    //% isFixedSize.defl=false
    export function addAttributeText(design: CardDesignTemplate, align: CardZoneAlignments, attribute: number, color: number = 15, charsPerLine: number = 5, maxLines: number = 1, isFixedSize: boolean = false) {
        addDesignColumn(design, cardCore.createAttributeAsPlainTextColumn(align, attribute, color, charsPerLine, maxLines, !isFixedSize))
    }

    //% group="Add Text"
    //% weight=98
    //% block="add to current row in $design align $align index $attribute text from $textLookupTable|| in $color limit line length $charsPerLine max lines $maxLines fixed size $isFixedSize"
    //% design.shadow="variables_get" design.defl="myDesign"
    //% attribute.shadow="attributePicker"
    //% color.shadow="colorindexpicker" color.defl=15
    //% charsPerLine.defl=5 maxLines.defl=1
    //% isFixedSize.defl=false
    export function addAttributeIndexText(design: CardDesignTemplate, align: CardZoneAlignments, attribute: number, textLookupTable: string[], color: number = 15, charsPerLine: number = 5, maxLines: number = 1, isFixedSize: boolean = false) {
        addDesignColumn(design, cardCore.createAttributeAsLookupTextColumn(align, attribute, cardCore.createNumberToTextLookupTable(textLookupTable), color, charsPerLine, maxLines, !isFixedSize))
    }

    //% group="Add Image"
    //% weight=100
    //% block="add to current row in $design align $align image $image"
    //% design.shadow="variables_get" design.defl="myDesign"
    //% image.shadow="screen_image_picker"
    export function addStaticImage(design: CardDesignTemplate, align: CardZoneAlignments, image: Image) {
        addDesignColumn(design, cardCore.createImageColumn(align, image))
    }

    //% group="Add Image"
    //% weight=99
    //% inlineInputMode="inline"
    //% block="add to current row in $design align $align image $image repeat $attribute times"
    //% design.shadow="variables_get" design.defl="myDesign"
    //% attribute.shadow="attributePicker"
    //% image.shadow="screen_image_picker"
    export function addRepeatImage(design: CardDesignTemplate, align: CardZoneAlignments, attribute: number, image: Image) {
        addDesignColumn(design, cardCore.createAttributeAsRepeatImageColumn(align, attribute, image))
    }

    //% group="Add Image"
    //% weight=98
    //% block="add to current row in $design align $align index $attribute image from $imageLookupTable"
    //% design.shadow="variables_get" design.defl="myDesign"
    //% attribute.shadow="attributePicker"
    //% imageLookupTable.shadow="lists_create_with" imageLookupTable.defl="screen_image_picker"
    export function addAttributeIndexImage(design: CardDesignTemplate, align: CardZoneAlignments, attribute: number, imageLookupTable: Image[]) {
        addDesignColumn(design, cardCore.createAttributeAsLookupImageColumn(align, attribute, cardCore.createNumberToImageLookupTable(imageLookupTable)))
    }

    //% group="Add Image"
    //% weight=97
    //% block="add to current row in $design align $align take $attribute and change $lookupTable"
    //% design.shadow="variables_get" design.defl="myDesign"
    //% attribute.shadow="attributePicker"
    //% lookupTable.shadow="lists_create_with" lookupTable.defl="textToImageLookupPicker"
    export function addAttributeTextToImage(design: CardDesignTemplate, align: CardZoneAlignments, attribute: number, lookupTable: cardCore.DesignLookup[]) {
        addDesignColumn(design, cardCore.createAttributeAsLookupImageColumn(align, attribute, lookupTable))
    }

    //% group="Add Misc"
    //% block="add to current row in $design align $align empty space width $width height $height"
    //% design.shadow="variables_get" design.defl="myDesign"
    export function addEmptySpace(design: CardDesignTemplate, align: CardZoneAlignments, width: number, height: number) {
        addDesignColumn(design, cardCore.createEmptySpaceColumn(align, width, height))
    }

    //% group="Add Misc"
    //% block="set $design stamp collection to $lookupTable"
    //% design.shadow="variables_get" design.defl="myDesign"
    //% lookupTable.shadow="lists_create_with" lookupTable.defl="textToImageLookupPicker"
    export function setStampImages(design: CardDesignTemplate, lookupTable: cardCore.StampLookup[]) {
        design.stamps = lookupTable
    }    

}

namespace cardDesign {

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

    //% weight=100
    //% group="Deck Builder" blockSetVariable="myDeck"
    //% block="empty $design $kind deck"
    //% design.shadow="variables_get" design.defl="myDesign"
    //% kind.shadow="containerKindPicker" kind.defl=0
    export function createEmptyStack(design: cardDesign.CardDesignTemplate, kind: number): cardCore.CardStack {
        return new cardCore.CardStack(kind, design.export(), [], false, false)
    }

    class CardAttributeVariation {
        constructor(
            public attribute: number,
            public values: cardCore.CardAttributeValues[]
        ) {}
    }

    //% group="Deck Builder"
    //% blockId="numberAttributePicker"
    //% block="$attribute $value"
    //% attribute.shadow="attributePicker"
    export function createCardNumberAttribute(attribute: number, value: number): CardAttributeVariation {
        return new CardAttributeVariation(attribute, [value])
    }

    //% group="Deck Builder"
    //% blockId="textAttributePicker"
    //% block="$attribute $text"
    //% attribute.shadow="attributePicker"
    export function createCardTextAttribute(attribute: number, text: string): CardAttributeVariation {
        return new CardAttributeVariation(attribute, [text])
    }

    //% group="Deck Builder"
    //% blockId="numberVariationsPicker"
    //% block="$attribute each number from $startNumber to $endNumber"
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

    //% group="Deck Builder"
    //% blockId="numberListVariationsPicker"
    //% block="$attribute each number from $values"
    //% attribute.shadow="attributePicker"
    export function createNumberListAttributeVariations(attribute: number, values: number[]): CardAttributeVariation {
        return new CardAttributeVariation(attribute, values)
    }

    //% group="Deck Builder"
    //% blockId="textVariationsPicker"
    //% block="$attribute each text from $texts"
    //% attribute.shadow="attributePicker"
    export function createTextAttributeVariations(attribute: number, texts: string[]): CardAttributeVariation {
        return new CardAttributeVariation(attribute, texts)
    }

    function __addCardVariationsFromIndex(deckData: cardCore.CardData[], cardData: cardCore.CardData, attributes: CardAttributeVariation[], attrIndex: number, copies: number) {
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

    //% weight=99
    //% group="Deck Builder"
    //% block="add to $stack cards combinations of $variations|| make $copies copies each"
    //% deck.shadow="variables_get" deck.defl="myStack"
    //% card.shadow="cardDataPicker"
    //% variations.shadow="lists_create_with" variations.defl="textAttributePicker"
    //% copies.defl=1
    export function addCardVariantsToStack(deck: cardCore.CardStack, variations: CardAttributeVariation[], copies: number = 1) {
        const insertData: cardCore.CardData[] = []
        __addCardVariationsFromIndex(insertData, new cardCore.CardData(), variations, 0, copies)
        deck.insertCardData(insertData)
    }
}

//% color="#255f74" icon="\uf2bb" block="Card Kit"
namespace cardKit {

    //% shim=ENUM_GET
    //% blockId="containerKindPicker"
    //% blockHidden=true
    //% block="$arg"
    //% enumName="CardContainerKinds"
    //% enumMemberName="type"
    //% enumPromptHint="e.g. Draw, Discard, Player..."
    //% enumInitialMembers="Draw, Discard, Player, Puzzle"
    export function _containerKindEnumShim(arg: number) {
        // This function should do nothing, but must take in a single
        // argument of type number and return a number value.
        return arg;
    }    

    //% group="Create" blockSetVariable="myContainer"
    //% block="empty $kind pile"
    //% design.shadow="variables_get" design.defl="myDesign"
    //% kind.shadow="containerKindPicker" kind.defl=1
    export function createEmptyPile(
        kind: number,
    ): cardCore.CardStack {
        return new cardCore.CardStack(kind, null, [], true, true)
    }

    //% group="Create" blockSetVariable="myContainer"
    //% inlineInputMode=inline
    //% block="empty $kind card spread x $x y $y spread $spreadDirection|| from $alignment face up $isFaceUp"
    //% x.shadow="positionPicker" x.defl=80
    //% y.shadow="positionPicker" y.defl=60
    //% kind.shadow="containerKindPicker" kind.defl=2
    //% x.defl=80 y.defl=100
    //% alignment.defl=CardLayoutSpreadAlignments.Center
    //% spreadDirection.defl=CardLayoutSpreadDirections.LeftRight
    //% isFaceUp.defl=true
    export function createEmptyHand(
        kind: number, x: number, y: number,
        spreadDirection: CardLayoutSpreadDirections,
        alignment: CardLayoutSpreadAlignments,
        isFaceUp: boolean = true
    ): cardCore.CardSpread {
        return new cardCore.CardSpread(
            kind, x, y, 1, [], isFaceUp,
            spreadDirection === CardLayoutSpreadDirections.LeftRight,
            alignment,
            1,
            0, 0,
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

    //% group="Create" blockSetVariable="myContainer"
    //% inlineInputMode=inline
    //% block="empty $kind card grid x $x y $y columns $columns rows $rows|| add cards face up $isFaceUp scroll $scrollDirection"
    //% x.shadow="positionPicker" x.defl=80
    //% y.shadow="positionPicker" y.defl=60
    //% kind.shadow="containerKindPicker" kind.defl=3
    //% columns.defl=6 rows.defl=4
    //% scrollDirection.defl=CardLayoutSpreadDirections.UpDown
    //% isFaceUp.defl=true
    export function createEmptyGrid(
        kind: number, x: number, y: number,
        columns: number, rows: number,
        scrollDirection: CardLayoutSpreadDirections = CardLayoutSpreadDirections.UpDown,
        isFaceUp: boolean = true,
    ): cardCore.CardGrid {
        const isScrollingLeftRight = scrollDirection == CardLayoutSpreadDirections.LeftRight
        return new cardCore.CardGrid(
            kind, x, y, 1, [],
            rows, columns,
            isScrollingLeftRight,
            isFaceUp,
            1, false,
            isScrollingLeftRight 
                ? sprites.create(DEFAULT_SCROLL_LEFT, SpriteKind.Cursor) 
                : sprites.create(DEFAULT_SCROLL_UP, SpriteKind.Cursor),
            isScrollingLeftRight 
                ? sprites.create(DEFAULT_SCROLL_RIGHT, SpriteKind.Cursor)
                : sprites.create(DEFAULT_SCROLL_DOWN, SpriteKind.Cursor)
        )
    }

    //% group="Create" blockSetVariable="myCard"
    //% block="view of $card using $design"
    //% card.shadow="variables_get" card.defl="myCard"
    //% design.shadow="variables_get" design.defl="myDesign"
    export function createCardView(card: cardCore.Card, design: cardCore.CardDesign): cardCore.Card {
        return card.createView(design)
    }
    
    //% group="Create" blockSetVariable="myCard"
    //% block="clone of $card"
    //% card.shadow="variables_get" card.defl="myCard"
    export function createCardClone(card: cardCore.Card): cardCore.Card {
        return card.clone()
    }
    
    //% group="Card"
    //% block="$card is face up"
    //% card.shadow="variables_get" card.defl="myCard"
    export function getCardFaceUp(card: cardCore.Card) {
        return card.isFaceUp
    }

    //% group="Card"
    //% block="set $card face up to $isFaceUp"
    //% card.shadow="variables_get" card.defl="myCard"
    export function setCardFaceUp(card: cardCore.Card, isFaceUp: boolean) {
        card.isFaceUp = isFaceUp
    }

    //% group="Card"
    //% block="flip $card"
    //% card.shadow="variables_get" card.defl="myCard"
    export function flipCard(card: cardCore.Card) {
        card.flip()
    }

    //% group="Card Attributes"
    //% block="set $card $attribute to $value"
    //% card.shadow="variables_get" card.defl="myCard"
    //% attribute.shadow="attributePicker"
    export function setCardNumberAttribute(card: cardCore.Card, attribute: number, value: number) {
        card.getData().setAttribute(attribute, value)
        card.refreshImage()
    }

    //% group="Card Attributes"
    //% block="set $card $attribute to $text"
    //% card.shadow="variables_get" card.defl="myCard"
    //% attribute.shadow="attributePicker"
    export function setCardTextAttribute(card: cardCore.Card, attribute: number, text: string) {
        card.getData().setAttribute(attribute, text)
        card.refreshImage()
    }

    //% group="Card Attributes"
    //% block="set $card stamp to $text"
    //% card.shadow="variables_get" card.defl="myCard"
    export function setCardStampText(card: cardCore.Card, text: string) {
        card.stamp = text
        card.refreshImage()
    }

    //% group="Card Attributes"
    //% block="$card $attribute number"
    //% card.shadow="variables_get" card.defl="myCard"
    //% attribute.shadow="attributePicker"
    export function getCardNumberAttribute(card: cardCore.Card, attribute: number) {
        const value = card.getData().getAttribute(attribute)
        if(typeof value == "number") {
            return value
        } else {
            return 0
        }
    }

    //% group="Card Attributes"
    //% block="$card $attribute text"
    //% card.shadow="variables_get" card.defl="myCard"
    //% attribute.shadow="attributePicker"
    export function getCardTextAttribute(card: cardCore.Card, attribute: number) {
        const value = card.getData().getAttribute(attribute)
        if (typeof value == "string") {
            return value
        } else {
            return value.toString()
        }
    }
    
    //% group="Card Attributes"
    //% block="$card stamp"
    //% card.shadow="variables_get" card.defl="myCard"
    export function getCardStampText(card: cardCore.Card) {
        return card.stamp
    }

    //% color="#d54322"
    //% group="Cursor"
    //% block="cursor card"
    export function getCursorCard(): cardCore.Card {
        return cardCore.getCursorCard()
    }

    //% color="#d54322"
    //% group="Cursor"
    //% block="cursor card container type"
    export function getCursorContainerKind(): string {
        const container = cardCore.getMostRecentCursorContainer()
        if (!!container.getKind) {
            return container.getKind()
        } else {
            return ""
        }
    }

    //% color="#d54322"
    //% group="Cursor"
    //% block="move cursor between cards in $container with buttons"
    //% container.shadow="variables_get" container.defl="myContainer"
    export function moveCursorInsideLayoutWithButtons(container: cardCore.LayoutContainer) {
        cardCore.preselectCursorContainer(container)
        container.moveCursorIntoContainer()
        autoLayoutControl = true
    }

    //% color="#d54322"
    //% group="Cursor"
    //% block="stop cursor controls"
    export function disableLayoutButtonControl() {         
        autoLayoutControl = false
        cardCore.removeCursor()
    }

    export function moveCursorInDirection(direction: PointerDirections) {
        const layer = cardCore.getMostRecentCursorContainer()
        if (!layer) {
            return
        }
        if (!!layer.isCardSpread) {
            const spread = layer as cardCore.CardSpread
            if (spread.isLeftRight) {
                switch (direction) {
                    case PointerDirections.Left: spread.moveCursorBack(); break
                    case PointerDirections.Right: spread.moveCursorForward(); break
                }
            } else {
                switch (direction) {
                    case PointerDirections.Up: spread.moveCursorBack(); break
                    case PointerDirections.Down: spread.moveCursorForward(); break
                }
            }
        } else if (!!layer.isCardGrid) {
            const grid = layer as cardCore.CardGrid
            switch (direction) {
                case PointerDirections.Up: grid.moveCursorUp(); break
                case PointerDirections.Down: grid.moveCursorDown(); break
                case PointerDirections.Left: grid.moveCursorLeft(); break
                case PointerDirections.Right: grid.moveCursorRight(); break
            }
        }
    }

    //% color="#d54322"
    //% group="Cursor"
    //% block="point cursor at $sprite"
    //% sprite.shadow="variables_get" sprite.defl="mySprite"
    export function pointCursorAt(sprite: Sprite) {
        cardCore.pointCursorAt(sprite)
    }

    //% color="#d54322"
    //% group="Cursor"
    //% block="hide cursor"
    export function removeCursor() {
        cardCore.removeCursor()
    }
    
    //% group="Move Card" blockSetVariable="myCard"
    //% block="remove $position card from $container"
    //% container.shadow="variables_get" container.defl="myContainer"
    export function removeCardFrom(container: cardCore.CardContainer, position: CardContainerPositions): cardCore.Card {
        const index = getPositionIndex(container, position)
        if (index == null) {
            return null
        }
        const card = container.removeCardAt(index)
        card.container = null
        return card
    }

    //% group="Move Card"
    //% block="add $card to $container at $position position"
    //% container.shadow="variables_get" container.defl="myContainer"
    //% card.shadow="variables_get" card.defl="myCard"
    export function addCardTo(container: cardCore.CardContainer, card: cardCore.Card, position: CardContainerPositions) {
        const index = getPositionIndex(container, position)
        if (index == null) {
            return
        }
        container.insertCard(card, getPositionIndex(container, position))
    }

    //% group="Move Card"
    //% inlineInputMode=inline
    //% block="move $startPosition card from $origin to $destination $endPosition position"
    //% origin.shadow="variables_get" origin.defl="myContainer"
    //% destination.shadow="variables_get" destination.defl="myContainer"    
    export function moveCardBetween(
        origin: cardCore.CardContainer,
        startPosition: CardContainerPositions,
        destination: cardCore.CardContainer,
        endPosition: CardContainerPositions
    ) {
        const start = getPositionIndex(origin, startPosition)
        if (start == null) {
            return
        }
        const end = getPositionIndex(destination, endPosition)
        if (end == null) {
            return
        }
        destination.insertCard(origin.removeCardAt(start), end)
    }

    //% group="Card List"
    //% block="copy of $container $position card"
    //% container.shadow="variables_get" container.defl="myContainer"
    export function getContainerCardAtPosition(container: cardCore.CardContainer, position: CardContainerPositions): cardCore.Card {        
        return container.getCardCopyAt(getPositionIndex(container, position))
    }

    //% group="Card List"
    //% block="copy of $container card at $index"
    //% container.shadow="variables_get" container.defl="myContainer"
    export function getContainerCardAtIndex(container: cardCore.CardContainer, index: number): cardCore.Card {
        return container.getCardCopyAt(index)
    }

    //% color="#ff9008"
    //% group="Card List" blockSetVariable="list"
    //% block="copy of $container cards"
    //% container.shadow="variables_get" container.defl="myContainer"
    export function getLayoutCardListCopy(container: cardCore.CardContainer): cardCore.Card[] {
        return container.getCardsCopy()
    }

    //% color="#ff9008"
    //% group="Card List" blockSetVariable="list"
    //% block="copy of $container cards where $attribute is $text"
    //% container.shadow="variables_get" container.defl="myContainer"
    //% attribute.shadow="attributePicker"
    //% text.shadowOptions.toString=true
    export function filterCardListWithCondition(container: cardCore.CardContainer, attribute: number, text: string): cardCore.Card[] {
        return container.getCardsCopy().filter(card => {
            const data = card.getData()
            return !!data && data.attributeEquals(attribute, text)
        })
    }

    //% group="Card Events"
    //% draggableParameters="reporter"
    //% expandableArgumentMode="toggle"
    //% block="on $card added from $source to type $kind $destination|| where $attribute is $text"
    //% kind.shadow="containerKindPicker" kind.defl=0
    //% attribute.shadow="attributePicker"
    //% text.shadowOptions.toString=true
    export function createContainerEvent(
        kind: number,
        handler: (source: cardCore.CardContainer, destination: cardCore.CardContainer, card: cardCore.Card) => void,
        attribute: number = null,
        text: string = null,
    ) {
        cardCore.addCardEvent(
            kind,
            handler,
            attribute !== null && text !== null
                ? { attribute: attribute, value: text }
                : null
        )
    }    
    
    function getPositionIndex(container: cardCore.CardContainer, position: CardContainerPositions): number {
        switch (position) {
            case CardContainerPositions.First: return 0
            case CardContainerPositions.Middle: return Math.floor(container.getCardCount() / 2)
            case CardContainerPositions.Last: return -1
            case CardContainerPositions.Random: return Math.randomRange(0, container.getCardCount() - 1)
            case CardContainerPositions.Cursor: return container.getCursorIndex()
        }
    }

    let autoLayoutControl: boolean = true
    controller.left.onEvent(ControllerButtonEvent.Pressed, function() {
        if (autoLayoutControl) {
            moveCursorInDirection(PointerDirections.Left)
        }
    })
    controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
        if (autoLayoutControl) {
            moveCursorInDirection(PointerDirections.Right)
        }
    })
    controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
        if (autoLayoutControl) {
            moveCursorInDirection(PointerDirections.Up)
        }
    })
    controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
        if (autoLayoutControl) {
            moveCursorInDirection(PointerDirections.Down)
        }
    })

    //% group="Stack/Spread/Grid Operations"
    //% block="$container type"
    //% container.shadow="variables_get" container.defl="myContainer"
    export function getContainerKind(
        container: cardCore.CardContainer
    ): number {
        return container.getKind()
    }

    //% group="Stack/Spread/Grid Operations"
    //% block="$container card count"
    //% container.shadow="variables_get" container.defl="myContainer"
    export function getContainerCardCount(
        container: cardCore.CardContainer
    ): number {
        return container.getCardCount()
    }

    //% group="Stack/Spread/Grid Operations"
    //% block="set $container position x $x y $y"
    //% x.shadow="positionPicker" x.defl=80
    //% y.shadow="positionPicker" y.defl=60
    //% container.shadow="variables_get" container.defl="myContainer"
    export function setContainerPosition(
        container: cardCore.CardContainer,
        x: number,
        y: number
    ) { 
        container.setPosition(x, y)
    }

    //% group="Stack/Spread/Grid Operations"
    //% block="set $container z $layer"
    //% container.shadow="variables_get" container.defl="myContainer"
    export function setContainerLayer(
        container: cardCore.CardContainer,
        layer: number
    ) {
        container.setLayer(layer)
    }

    //% group="Stack/Spread/Grid Operations"
    //% block="set $container card design to $design"
    //% container.shadow="variables_get" container.defl="myContainer"
    //% design.shadow="variables_get" design.defl="myDesign"
    export function setContainerDesign(
        container: cardCore.CardContainer,
        design: cardDesign.CardDesignTemplate
    ) {
        container.setDesign(design.export())
    }

    //% group="Stack/Spread/Grid Operations"
    //% block="shuffle $container cards"
    //% container.shadow="variables_get" container.defl="myContainer"
    export function shuffleCards(container: cardCore.CardContainer) {
        container.shuffle()
    }

    //% group="Stack Operations" blockSetVariable="myContainer"
    //% block="split from $stack top $count cards"
    //% stack.shadow="variables_get" stack.defl="myContainer"
    //% count.defl=10
    export function splitStack(stack: cardCore.CardStack, count: number): cardCore.CardStack {
        return stack.split(count)
    }

    //% group="Stack Operations"
    //% block="flip entire stack $stack"
    //% stack.shadow="variables_get" stack.defl="myContainer"
    export function flipEntireStack(stack: cardCore.CardStack) {
        stack.flipStack()
    }
        
    //% group="Stack Operations"
    //% block="flip stack $stack top card"
    //% stack.shadow="variables_get" stack.defl="myContainer"
    export function flipStackTopCard(stack: cardCore.CardStack) {
        stack.flipTopCard()
    }
        
    //% group="Spread/Grid Operations"
    //% block="set spread or grid $container cursor wrapping to $isWrappingSelection"
    //% container.shadow="variables_get" container.defl="myContainer"
    export function setCardLayoutWrapping(container: cardCore.CardSpread | cardCore.CardGrid, isWrappingSelection: boolean) {
        container.isWrappingSelection = isWrappingSelection            
    }

    //% group="Spread/Grid Operations"
    //% block="set spread or grid $container card spacing to $spacing"
    //% container.shadow="variables_get" container.defl="myContainer"
    //% spacing.defl=1
    export function setCardLayoutSpacing(container: cardCore.CardSpread | cardCore.CardGrid, spacing: number) {
        container.spacing = spacing
    }

    //% group="Spread/Grid Operations"
    //% block="destroy spread or grid $container cards"
    //% container.shadow="variables_get" container.defl="myContainer"
    //% spacing.defl=1
    export function destroyCardLayoutCards(container: cardCore.LayoutContainer) {
        container.destroyCards()
    }

    //% group="Spread Operations"
    //% block="set spread $spread cursor card offset $distance px $direction"
    //% spread.shadow="variables_get" spread.defl="myContainer"
    //% distance.defl=10    
    export function setSpreadHover(spread: cardCore.CardSpread, direction: PointerDirections, distance: number) {
        let offsetX = 0
        switch (direction) {
            case PointerDirections.Left: offsetX = -distance; break;
            case PointerDirections.Right: offsetX = distance; break;
        }
        
        let offsetY = 0
        switch (direction) {
            case PointerDirections.Up: offsetY = -distance; break;
            case PointerDirections.Down: offsetY = distance; break;
        }

        spread.setHoverOffset(offsetX, offsetY)
    }

    //% group="Grid Operations"
    //% block="lock grid $grid card positions"
    //% grid.shadow="variables_get" grid.defl="myContainer"
    export function lockGridCardPositions(grid: cardCore.CardGrid) {
        grid.lock()
    }

    //% group="Grid Operations"
    //% block="unlock grid $grid card positions"
    //% grid.shadow="variables_get" grid.defl="myContainer"
    export function unlockGridCardPositions(grid: cardCore.CardGrid) {
        grid.unlock()
    }

    //% group="Grid Operations"
    //% block="set grid $grid|scroll back sprite $scrollBack|scroll forward sprite $scrollForward"
    //% grid.shadow="variables_get" grid.defl="myContainer"
    //% scrollBack.shadow="variables_get" scrollBack.defl="mySprite"
    //% scrollForward.shadow="variables_get" scrollForward.defl="mySprite"
    export function setGridScrollSprites(grid: cardCore.CardGrid, scrollBack: Sprite, scrollForward: Sprite) {
        grid.setScrollSprites(scrollBack, scrollForward)
    }    
}