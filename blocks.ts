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
    //% block="up and down"
    UpDown,
    //% block="left and right"
    LeftRight,
}

//% color="#183f4e" icon="\uf249" block="Card Design"
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
        for (let c = 1; c < 16; c++) {
            result.replace(c, color)
        }
        return result
    }

    //% blockId="textToImageLookupPicker"
    //% blockHidden=true
    //% block="text $text to image $image"
    //% image.shadow="screen_image_picker"
    export function createTextToImageLookupPair(text: string, image: Image): cardKit.DesignLookup {
        return { value: text, drawable: image }
    }

    //% group="Create" blockSetVariable="myCardDesign"
    //% block="blank design"
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

        frontFrame: Image
        backFrame: Image
        frontStackFrame: Image
        backStackFrame: Image

        rows: cardKit.DesignRow[]
        stamps: cardKit.StampLookup[]
        
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

            this.stamps = []
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
                this.stamps,
                this.margin,
                this.spacing
            )
        }
    }

    //% group="Graphics"
    //% block="set $design $frameType frame to $image"
    //% design.shadow="variables_get" design.defl="myCardDesign"
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
        design.rows.push([])
    }

    function addDesignColumn(design: CardDesignTemplate, column: cardKit.DesignColumn) {
        design.rows[design.rows.length - 1].push(column)
    }

    //% group="Add Text"
    //% weight=100
    //% inlineInputMode=inline
    //% block="add to current row in $design align $align text $text|| in $color limit line length $charsPerLine max lines $maxLines fixed size $isFixedSize"
    //% design.shadow="variables_get" design.defl="myCardDesign"
    //% color.shadow="colorindexpicker" color.defl=15
    //% charsPerLine.defl=0 maxLines.defl=1
    //% isFixedSize.defl=false
    export function addStaticText(design: CardDesignTemplate, align: CardZoneAlignments, text: string, color: number = 15, charsPerLine: number = 0, maxLines: number = 1, isFixedSize: boolean = false) {
        addDesignColumn(design, cardKit.createTextColumn(align, text, color, charsPerLine <= 0 ? text.length : charsPerLine, maxLines, !isFixedSize))
    }

    //% group="Add Text"
    //% weight=99
    //% inlineInputMode="inline"
    //% block="add to current row in $design align $align $attribute as text|| in $color limit line length $charsPerLine max lines $maxLines fixed size $isFixedSize"
    //% design.shadow="variables_get" design.defl="myCardDesign"
    //% attribute.shadow="attributePicker"
    //% color.shadow="colorindexpicker" color.defl=15
    //% charsPerLine.defl=5 maxLines.defl=1
    //% isFixedSize.defl=false
    export function addAttributeText(design: CardDesignTemplate, align: CardZoneAlignments, attribute: number, color: number = 15, charsPerLine: number = 5, maxLines: number = 1, isFixedSize: boolean = false) {
        addDesignColumn(design, cardKit.createAttributeAsPlainTextColumn(align, attribute, color, charsPerLine, maxLines, !isFixedSize))
    }

    //% group="Add Text"
    //% weight=98
    //% block="add to current row in $design align $align index $attribute text from $textLookupTable|| in $color limit line length $charsPerLine max lines $maxLines fixed size $isFixedSize"
    //% design.shadow="variables_get" design.defl="myCardDesign"
    //% attribute.shadow="attributePicker"
    //% color.shadow="colorindexpicker" color.defl=15
    //% charsPerLine.defl=5 maxLines.defl=1
    //% isFixedSize.defl=false
    export function addAttributeIndexText(design: CardDesignTemplate, align: CardZoneAlignments, attribute: number, textLookupTable: string[], color: number = 15, charsPerLine: number = 5, maxLines: number = 1, isFixedSize: boolean = false) {
        addDesignColumn(design, cardKit.createAttributeAsLookupTextColumn(align, attribute, cardKit.createNumberToTextLookupTable(textLookupTable), color, charsPerLine, maxLines, !isFixedSize))
    }

    //% group="Add Image"
    //% weight=100
    //% block="add to current row in $design align $align image $image"
    //% design.shadow="variables_get" design.defl="myCardDesign"
    //% image.shadow="screen_image_picker"
    export function addStaticImage(design: CardDesignTemplate, align: CardZoneAlignments, image: Image) {
        addDesignColumn(design, cardKit.createImageColumn(align, image))
    }

    //% group="Add Image"
    //% weight=99
    //% inlineInputMode="inline"
    //% block="add to current row in $design align $align image $image repeat $attribute times"
    //% design.shadow="variables_get" design.defl="myCardDesign"
    //% attribute.shadow="attributePicker"
    //% image.shadow="screen_image_picker"
    export function addRepeatImage(design: CardDesignTemplate, align: CardZoneAlignments, attribute: number, image: Image) {
        addDesignColumn(design, cardKit.createAttributeAsRepeatImageColumn(align, attribute, image))
    }

    //% group="Add Image"
    //% weight=98
    //% block="add to current row in $design align $align index $attribute image from $imageLookupTable"
    //% design.shadow="variables_get" design.defl="myCardDesign"
    //% attribute.shadow="attributePicker"
    //% imageLookupTable.shadow="lists_create_with" imageLookupTable.defl="screen_image_picker"
    export function addAttributeIndexImage(design: CardDesignTemplate, align: CardZoneAlignments, attribute: number, imageLookupTable: Image[]) {
        addDesignColumn(design, cardKit.createAttributeAsLookupImageColumn(align, attribute, cardKit.createNumberToImageLookupTable(imageLookupTable)))
    }

    //% group="Add Image"
    //% weight=97
    //% block="add to current row in $design align $align take $attribute and change $lookupTable"
    //% design.shadow="variables_get" design.defl="myCardDesign"
    //% attribute.shadow="attributePicker"
    //% lookupTable.shadow="lists_create_with" lookupTable.defl="textToImageLookupPicker"
    export function addAttributeTextToImage(design: CardDesignTemplate, align: CardZoneAlignments, attribute: number, lookupTable: cardKit.DesignLookup[]) {
        addDesignColumn(design, cardKit.createAttributeAsLookupImageColumn(align, attribute, lookupTable))
    }

    //% group="Add Misc"
    //% block="add to current row in $design align $align empty space width $width height $height"
    //% design.shadow="variables_get" design.defl="myCardDesign"
    export function addEmptySpace(design: CardDesignTemplate, align: CardZoneAlignments, width: number, height: number) {
        addDesignColumn(design, cardKit.createEmptySpaceColumn(align, width, height))
    }

    //% group="Add Misc"
    //% block="set $design stamp collection $lookupTable"
    //% design.shadow="variables_get" design.defl="myCardDesign"
    //% lookupTable.shadow="lists_create_with" lookupTable.defl="textToImageLookupPicker"
    export function setStampImages(design: CardDesignTemplate, lookupTable: cardKit.StampLookup[]) {
        design.stamps = lookupTable
    }    

}

//% color="#255f74" icon="\uf044" block="Deck Builder"
//% groups=['Deck Builder']
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

    //% group="Deck Builder" blockSetVariable="myCardDeck"
    //% block="empty $design deck named $id"
    //% design.shadow="variables_get" design.defl="myCardDesign"
    //% id.defl="Card Deck"
    export function createEmptyDeck(design: cardDesign.CardDesignTemplate, id: string): cardKit.CardStack {
        return new cardKit.CardStack(id, design.export(), [], false, false)
    }

    class CardAttributeVariation {
        constructor(
            public attribute: number,
            public values: cardKit.CardAttributeValues[]
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

    //% group="Deck Builder"
    //% block="add to $deck cards combinations of $variations|| make $copies copies each"
    //% deck.shadow="variables_get" deck.defl="myCardDeck"
    //% card.shadow="cardDataPicker"
    //% variations.shadow="lists_create_with" variations.defl="textAttributePicker"
    //% copies.defl=1
    export function addCardVariantsToDeck(deck: cardKit.CardStack, variations: CardAttributeVariation[], copies: number = 1) {
        const insertData: cardKit.CardData[] = []
        __addCardVariationsFromIndex(insertData, new cardKit.CardData(), variations, 0, copies)
        deck.insertCardData(insertData)
    }
}

//% color="#307d9c" icon="\uf2bb" block="Cards"
//% groups=['Attributes']
namespace cardLayout {
    
    //% group="Attributes"
    //% block="set $card $attribute to number $value"
    //% card.shadow="variables_get" card.defl="myCard"
    //% attribute.shadow="attributePicker"
    export function setCardNumberAttribute(card: cardKit.Card, attribute: number, value: number) {
        card.getData().setAttribute(attribute, value)
        card.refreshImage()
    }

    //% group="Attributes"
    //% block="set $card $attribute to text $text"
    //% card.shadow="variables_get" card.defl="myCard"
    //% attribute.shadow="attributePicker"
    export function setCardTextAttribute(card: cardKit.Card, attribute: number, text: string) {
        card.getData().setAttribute(attribute, text)
        card.refreshImage()
    }

    //% group="Attributes"
    //% block="set $card stamp to $text"
    //% card.shadow="variables_get" card.defl="myCard"
    export function setCardStampText(card: cardKit.Card, text: string) {
        card.stamp = text
        card.refreshImage()
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
    
    //% group="Attributes"
    //% block="$card stamp"
    //% card.shadow="variables_get" card.defl="myCard"
    export function getCardStampText(card: cardKit.Card) {
        return card.stamp
    }    

    //% group="Create" blockSetVariable="myCardContainer"
    //% block="empty $design card pile named $id"
    //% design.shadow="variables_get" design.defl="myCardDesign"
    //% id.defl="Discard Pile"
    export function createEmptyPile(
        id: string,
        design: cardDesign.CardDesignTemplate,
    ): cardKit.CardStack {
        return new cardKit.CardStack(id, design.export(), [], true, true)
    }

    //% group="Create" blockSetVariable="myCardContainer"
    //% block="empty card hand named $id x $x y $y spread $spreadDirection|| add cards face up $isFaceUp"
    //% design.shadow="variables_get" design.defl="myCardDesign"
    //% id.defl="Player Hand"
    //% x.defl=80 y.defl=100
    //% spreadDirection.defl=1
    //% isFaceUp.defl=true
    export function createEmptyHand(
        id: string, x: number, y: number,
        spreadDirection: CardLayoutSpreadDirections,
        isFaceUp: boolean = true,originContainer
    ): cardKit.CardSpread {
        return new cardKit.CardSpread(
            id, x, y, 1, [], isFaceUp,
            spreadDirection === CardLayoutSpreadDirections.LeftRight, 1,
            0, -10,
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

    //% group="Create" blockSetVariable="myCardContainer"
    //% block="empty card grid named $id x $x y $y columns $columns rows $rows|| add cards face up $isFaceUp scroll $scrollDirection"
    //% id.defl="Card Grid"
    //% x.defl=80 y.defl=60
    //% columns.defl=6 rows.defl=4
    //% scrollDirection.defl=0
    //% isFaceUp.defl=true
    export function createEmptyGrid(
        id: string, x: number, y: number,
        columns: number, rows: number,
        scrollDirection: CardLayoutSpreadDirections,
        isFaceUp: boolean = true,
    ): cardKit.CardGrid {
        const isScrollingLeftRight = scrollDirection == CardLayoutSpreadDirections.LeftRight
        return new cardKit.CardGrid(
            id, x, y, 1, [],
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

    //% group="Container Properties"
    //% block="$container id"
    //% container.shadow="variables_get" container.defl="myCardContainer"
    export function getContainerId(
        container: cardKit.CardContainer
    ): string {
        return container.getId()
    }

    //% group="Container Properties"
    //% block="$container card count"
    //% container.shadow="variables_get" container.defl="myCardContainer"
    export function getContainerCardCount(
        container: cardKit.CardContainer
    ): number {
        return container.getCardCount()
    }

    //% group="Modify Container"
    //% block="set $container position x $x y $y"
    //% container.shadow="variables_get" container.defl="myCardContainer"
    export function setContainerPosition(
        container: cardKit.CardContainer,
        x: number,
        y: number
    ) { 
        container.setPosition(x, y)
    }

    //% group="Modify Container"
    //% block="set $container z $layer"
    //% container.shadow="variables_get" container.defl="myCardContainer"
    export function setContainerLayer(
        container: cardKit.CardContainer,
        layer: number
    ) {
        container.setLayer(layer)
    }

    //% group="Container Cards"
    //% block="shuffle $container cards"
    //% container.shadow="variables_get" container.defl="myCardContainer"
    export function shuffleCards(container: cardKit.CardContainer) {}


    //% group="Card Events"
    //% draggableParameters="reporter"
    //% block="on $container $card added from $originContainer"
    //% container.shadow="variables_get" container.defl="myCardContainer"
    export function createContainerEvent(
        container: cardKit.CardContainer,
        handler: (originContainer: cardKit.CardContainer, card: cardKit.Card) => void
    ) {
        container.addEvent(null, handler)
    }

    //% group="Card Events"
    //% draggableParameters="reporter"
    //% block="on $container $card added from $originContainer where $attribute is $text"
    //% container.shadow="variables_get" container.defl="myCardContainer"
    //% attribute.shadow="attributePicker"
    //% text.shadowOptions.toString=true
    export function addContainerConditionEvent(
        container: cardKit.CardContainer,
        attribute: number,
        text: string,
        handler: (originContainer: cardKit.CardContainer, card: cardKit.Card) => void
    ) {
        container.addEvent({ attribute: attribute, value: text }, handler)
    }
    
    
    function getPositionIndex(container: cardKit.CardContainer, position: CardContainerPositions): number {
        switch (position) {
            case CardContainerPositions.First: return 0
            case CardContainerPositions.Middle: return Math.floor(container.getCardCount() / 2)
            case CardContainerPositions.Last: return -1
            case CardContainerPositions.Random: return Math.randomRange(0, container.getCardCount() - 1)
            case CardContainerPositions.Cursor: return container.getCursorIndex()
        }
    }

    //% group="Container Cards" blockSetVariable="myCard"
    //% block="remove $position card from $container"
    //% container.shadow="variables_get" container.defl="myCardContainer"
    export function removeCardFrom(container: cardKit.CardContainer, position: CardContainerPositions): cardKit.Card {
        const index = getPositionIndex(container, position)
        if (index == null) {
            return null
        }
        const card = container.removeCardAt(index)
        card.container = null
        return card
    }

    //% group="Container Cards"
    //% block="add $card to $container at $position position"
    //% container.shadow="variables_get" container.defl="myCardContainer"
    //% card.shadow="variables_get" card.defl="myCard"
    export function addCardTo(container: cardKit.CardContainer, card: cardKit.Card, position: CardContainerPositions) {
        const index = getPositionIndex(container, position)
        if (index == null) {
            return
        }
        container.insertCard(card, getPositionIndex(container, position))
    }

    //% group="Container Cards"
    //% block="move $startPosition card from $origin to $destination $endPosition position"
    //% origin.shadow="variables_get" origin.defl="myCardContainer"
    //% destination.shadow="variables_get" destination.defl="myCardContainer"    
    export function moveCardBetween(
        origin: cardKit.CardContainer,
        startPosition: CardContainerPositions,
        destination: cardKit.CardContainer,
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

    //% group="Container Cards" blockSetVariable="list"
    //% block="copy of $container card list"
    //% container.shadow="variables_get" container.defl="myCardContainer"
    export function getLayoutCardListCopy(container: cardKit.LayoutContainer): cardKit.Card[] {
        return container.getCardsCopy()
    }

    //% group="Card List" blockSetVariable="list"
    //% block="cards in $list where $attribute is $text"
    //% cards.shadow="variables_get" cards.defl="list"
    //% attribute.shadow="attributePicker"
    //% text.shadowOptions.toString=true
    export function filterCardListWithTextCondition(cards: cardKit.Card[], attribute: number, text: string): cardKit.Card[] {
        return cards.filter(card => card.getData().attributeEquals(attribute, text))
    }

    //% group="Cursor"
    //% block="cursor card"
    export function getCursorCard(): cardKit.Card {
        return cardKit.getCursorCard()
    }

    //% group="Cursor"
    //% block="cursor card container id"
    export function getCursorContainerId(): string {
        const container = cardKit.getMostRecentCursorContainer()
        if (!!container.getId) {
            return container.getId()
        } else {
            return ""
        }
    }

    //% group="Cursor"
    //% block="move cursor between cards in $container with buttons"
    //% container.shadow="variables_get" container.defl="myCardContainer"
    export function moveCursorInsideLayoutWithButtons(container: cardKit.LayoutContainer) {
        cardKit.preselectCursorContainer(container)
        autoLayoutControl = true
    }

    //% group="Cursor"
    //% block="stop cursor controls"
    export function disableLayoutButtonControl() {         
        autoLayoutControl = false
        cardKit.removeCursor()
    }

    //% group="Cursor"
    //% block="move cursor $direction"
    export function moveCursorInDirection(direction: PointerDirections) {
        const layer = cardKit.getMostRecentCursorContainer()
        if (!!layer.isCardSpread) {
            const spread = layer as cardKit.CardSpread
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
            const grid = layer as cardKit.CardGrid
            switch (direction) {
                case PointerDirections.Up: grid.moveCursorUp(); break
                case PointerDirections.Down: grid.moveCursorDown(); break
                case PointerDirections.Left: grid.moveCursorLeft(); break
                case PointerDirections.Right: grid.moveCursorRight(); break
            }
        }
    }

    //% group="Cursor"
    //% block="point cursor at $sprite"
    //% sprite.shadow="variables_get" sprite.defl="mySprite"
    export function pointCursorAt(sprite: Sprite) {
        cardKit.pointCursorAt(sprite)
    }

    //% group="Cursor"
    //% block="hide cursor"
    export function removeCursor() {
        cardKit.removeCursor()
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

    //% group="Modify Hand/Grid"
    //% block="set $container cursor wrapping to $isWrappingSelection"
    //% container.shadow="variables_get" container.defl="myCardContainer"
    export function setSpreadOrGridWrapping(container: cardKit.CardSpread | cardKit.CardGrid, isWrappingSelection: boolean) {
        container.isWrappingSelection = isWrappingSelection            
    }

    //% group="Modify Hand/Grid"
    //% block="set $container card spacing to $spacing"
    //% container.shadow="variables_get" container.defl="myCardContainer"
    //% spacing.defl=1
    export function setSpreadOrGridSpacing(container: cardKit.CardSpread | cardKit.CardGrid, spacing: number) {
        container.spacing = spacing
    }

    //% group="Modify Deck"
    //% block="flip deck $stack top card"
    //% stack.shadow="variables_get" stack.defl="myCardContainer"
    export function flipStackTopCard(stack: cardKit.CardStack) {
        stack.flipTopCard()
    }
    
    //% group="Modify Hand"
    //% block="set $spread cursor card offset $distance px $direction"
    //% spread.shadow="variables_get" spread.defl="myCardContainer"
    //% distance.defl=10    
    export function setSpreadHover(spread: cardKit.CardSpread, direction: PointerDirections, distance: number) {
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

    //% group="Modify Grid"
    //% block="set $grid|scroll back sprite $scrollBack|scroll forward sprite $scrollForward"
    //% grid.shadow="variables_get" grid.defl="myCardContainer"
    //% scrollBack.shadow="variables_get" scrollBack.defl="mySprite"
    //% scrollForward.shadow="variables_get" scrollForward.defl="mySprite"
    export function setGridScrollSprites(grid: cardKit.CardGrid, scrollBack: Sprite, scrollForward: Sprite) {
        grid.setScrollSprites(scrollBack, scrollForward)
    }    
}