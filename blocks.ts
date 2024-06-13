enum CardDesignDimensionProperties {
    //% block="width"
    Width,
    //% block="height"
    Height,
    //% block="margin"
    Margin,
    //% block="spacing"
    Spacing,
    //% block="thickness"
    Thickness,
    //% block="max stack size"
    MaxStackSize,
}

enum CardDesignFrameTypes {
    //% block="front"
    Front,
    //% block="back"
    Back,
    //% block="empty"
    Empty,
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
    Up = 1,
    //% block="down"
    Down,
    //% block="left"
    Left,
    //% block="right"
    Right
}

enum ControllerButtons {
    A,
    B,
    Up,
    Down,
    Left,
    Right,
    Menu,
}

enum SelectionButtons {
    A,
    B,
    Menu,
}

enum CardGridScrollDirections {
    //% block="up and down"
    UpDown,
    //% block="left and right"
    LeftRight,
}

enum DrawDirections {
    //% block="left to right"
    LeftToRight,
    //% block="top to bottom"
    TopToBottom,
}

cardCursor.setImage(img`
. . . f f . . . .
. . f 1 1 f . . .
. . f 1 1 f . . .
. . f 1 1 f f . .
. f f 1 1 b b f .
f 1 f 1 1 d d d f
f 1 d 1 1 1 1 1 f
. f d 1 1 1 1 1 f
. . f d 1 1 1 d f
. . . f f f f f .
`)

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
    const DEFAULT_ROUNDED_OUTLINE = img`
    . 1 .
    1 . 1
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
    export function createTextToImageLookupPair(text: string, image: Image): cardCore.AttributeLookup {
        return { value: text, drawable: image }
    }

    export class CardDesignTemplate {
        width: number
        height: number
        margin: number
        spacing: number
        cardThickness: number
        maxStackSize: number

        frontFrame: Image
        backFrame: Image
        emptyFrame: Image
        frontStackFrame: Image
        backStackFrame: Image

        groups: cardCore.DrawGroup[]
        
        constructor() {
            this.reset()
        }

        reset() {
            this.width = 12
            this.height = 20

            this.frontFrame = DEFAULT_CARD_FRONT
            this.backFrame = createFlatColorImage(DEFAULT_ROUNDED_RECTANGLE, 4)
            this.frontStackFrame = createFlatColorImage(DEFAULT_ROUNDED_RECTANGLE, 11)
            this.backStackFrame = createFlatColorImage(DEFAULT_ROUNDED_RECTANGLE, 14)
            this.emptyFrame = createFlatColorImage(DEFAULT_ROUNDED_OUTLINE, 1)
            this.cardThickness = 0.2
            this.maxStackSize = 60

            this.margin = 2
            this.spacing = 1

            this.groups = []
        }

        export(): cardCore.CardDesign {
            return new cardCore.CardDesign(
                this.width,
                this.height,
                this.frontFrame,
                this.backFrame,
                this.emptyFrame,
                this.frontStackFrame,
                this.backStackFrame,
                Math.ceil(1.0 / this.cardThickness),
                Math.floor(this.maxStackSize * this.cardThickness),
                this.groups,
                this.margin,
                this.spacing
            )
        }
    }

    let current: CardDesignTemplate = new CardDesignTemplate()


    //% shim=ENUM_GET
    //% blockId="designTemplatePicker"
    //% blockHidden=true
    //% block="$id Design"
    //% enumName="DesignTemplates"
    //% enumMemberName="design"
    //% enumPromptHint="e.g. Playing Cards, etc..."
    //% enumInitialMembers="PlayingCards"
    export function _cardDesignTemplateEnumShim(arg: number) {
        // This function should do nothing, but must take in a single
        // argument of type number and return a number value.
        return arg;
    }

    type IndexedCardDesignTemplate = {
        id: number
        design: CardDesignTemplate
    }

    let designTemplateStore: IndexedCardDesignTemplate[] = []

    export function getDesignTemplateExport(id: number): cardCore.CardDesign {
        return designTemplateStore.find(t => t.id === id).design.export()
    }

    //% group="Create"
    //% block="create $id as current design"
    //% id.shadow="designTemplatePicker"
    export function createCardDesignTemplate(id: number) {
        let template = designTemplateStore.find(t => t.id === id)
        if (!template) {
            template = { id: id, design: new CardDesignTemplate() }
            designTemplateStore.push(template)
        } else {
            template.design.reset()
        }
        current = template.design
    }

    //% group="Sizing"
    //% block="set design $property to $value"
    //% value.defl=0
    export function setDesignDimensionProperty(property: CardDesignDimensionProperties, value: number) {
        switch (property) {
            case CardDesignDimensionProperties.Width: current.width = value; break;
            case CardDesignDimensionProperties.Height: current.height = value; break;
            case CardDesignDimensionProperties.Margin: current.margin = value; break;
            case CardDesignDimensionProperties.Spacing: current.spacing = value; break;
            case CardDesignDimensionProperties.Thickness: current.cardThickness = value; break;
            case CardDesignDimensionProperties.MaxStackSize: current.maxStackSize = value; break;
        }
    }

    //% group="Graphics"
    //% block="set design $frameType frame to $image"
    //% image.shadow="screen_image_picker"
    export function setDesignGraphics(frameType: CardDesignFrameTypes, image: Image) {
        switch (frameType) {
            case CardDesignFrameTypes.Front: current.frontFrame = image; break;
            case CardDesignFrameTypes.Back: current.backFrame = image; break;
            case CardDesignFrameTypes.Empty: current.emptyFrame = image; break;
            case CardDesignFrameTypes.FrontStack: current.frontStackFrame = image; break;
            case CardDesignFrameTypes.BackStack: current.backStackFrame = image; break;
        }
    }

    //% group="Draw Groups"
    //% weight=99
    //% inlineInputMode=inline
    //% block="add draw group in design anchor $align drawn $direction|| offset x $offsetX y $offsetY"
    //% direction.defl=0 
    //% offsetX.defl=0 offsetY.defl=0
    export function createNewGroup(align: AnchorPositions, direction: DrawDirections = DrawDirections.LeftToRight, offsetX: number = 0, offsetY: number = 0) {
        current.groups.push(new cardCore.DrawGroup(
            align,
            direction === DrawDirections.LeftToRight,
            offsetX,
            offsetY,
            -1
        ))
    }

    function addDefaultDrawGroup() {
        if (current.groups.length == 0) {
            createNewGroup(AnchorPositions.Center)
        }
    }

    //% group="Draw Groups"
    //% weight=98
    //% block="link draw group visibility to $attribute"
    //% attribute.shadow="attributePicker"
    export function setGroupVisibilityAttribute(id: number) {
        addDefaultDrawGroup()
        current.groups[current.groups.length - 1].visibilityAttributeId = id
    }

    function addItemToCurrentGroup(item: cardCore.DrawItem) {
        addDefaultDrawGroup()
        current.groups[current.groups.length - 1].items.push(item)
    }

    function getCurrentItem(current: CardDesignTemplate): cardCore.DrawItem {
        if (current.groups.length === 0) {
            return null
        }
        const group = current.groups[current.groups.length - 1]
        if (group.items.length === 0) {
            return null
        }
        return group.items[group.items.length - 1]
    }

    //% group="Add Draw Text"
    //% weight=100
    //% inlineInputMode=inline
    //% block="draw to card text $text"
    export function addStaticText(text: string) {
        addItemToCurrentGroup(cardCore.createTextItem(text))
    }

    //% group="Add Draw Text"
    //% weight=99
    //% inlineInputMode="inline"
    //% block="draw to card $attribute as text"
    //% attribute.shadow="attributePicker"
    export function addAttributeText(attribute: number) {
        const item = cardCore.createTextItem('')
        item.drawable = cardCore.createAttributeAsValue(attribute)
        addItemToCurrentGroup(item)
    }

    //% group="Add Draw Text"
    //% weight=98
    //% block="draw to card index $attribute text from $textLookupTable"
    //% attribute.shadow="attributePicker"
    export function addAttributeIndexText(attribute: number, textLookupTable: string[]) {
        const item = cardCore.createTextItem('')
        item.drawable = cardCore.createIndexedLookupValue(attribute, textLookupTable)
        addItemToCurrentGroup(item)
    }

    //% group="Add Draw Image"
    //% weight=100
    //% block="draw to card image $image"
    //% image.shadow="screen_image_picker"
    export function addStaticImage(image: Image) {
        addItemToCurrentGroup(cardCore.createImageItem(image))
    }

    //% group="Add Draw Image"
    //% weight=98
    //% block="draw to card index $attribute image from $imageLookupTable"
    //% attribute.shadow="attributePicker"
    //% imageLookupTable.shadow="lists_create_with" imageLookupTable.defl="screen_image_picker"
    export function addAttributeIndexImage(attribute: number, imageLookupTable: Image[]) {
        const item = cardCore.createImageItem(null)
        item.drawable = cardCore.createIndexedLookupValue(attribute, imageLookupTable)
        addItemToCurrentGroup(item)
    }

    //% group="Add Draw Image"
    //% weight=97
    //% block="draw to card take $attribute and change $lookupTable"
    //% attribute.shadow="attributePicker"
    //% lookupTable.shadow="lists_create_with" lookupTable.defl="textToImageLookupPicker"
    export function addAttributeTextToImage(attribute: number, lookupTable: cardCore.AttributeLookup[]) {
        const item = cardCore.createImageItem(null)
        item.drawable = cardCore.createLookupValue(attribute, lookupTable)        
        addItemToCurrentGroup(item)
    }

    //% group="Edit Draw"
    //% weight=100
    //% block="set last drawing color to $color"
    //% color.shadow="colorindexpicker"
    export function setItemColor(color: number) {
        const item = getCurrentItem(current)
        if (!!item) {
            item.color = cardCore.createStaticValue(color)
        }
    }

    //% group="Edit Draw"
    //% weight=99
    //% block="set last drawing color index to $attribute value"
    //% attribute.shadow="attributePicker"
    export function setItemColorToAttribute(attribute: number) {
        const item = getCurrentItem(current)
        if (!!item) {
            item.color = cardCore.createAttributeAsValue(attribute)
        }
    }

    //% group="Edit Draw"
    //% weight=98
    //% block="repeat last drawing $attribute times"
    //% attribute.shadow="attributePicker"
    export function setItemRepeatToAttribute(attribute: number) {
        const item = getCurrentItem(current)
        if (!!item) {
            item.repeats = cardCore.createAttributeAsValue(attribute)
        }
    }

    //% group="Edit Draw"
    //% weight=97
    //% block="set last drawing width $width height $height"
    export function setItemSize(width: number, height: number) {
        const item = getCurrentItem(current)
        if (!!item) {
            item.width = width
            item.height = height
        }
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
    //% enumInitialMembers="Rank, Suit, SuitColor"
    export function _cardAttributeEnumShim(arg: number) {
        // This function should do nothing, but must take in a single
        // argument of type number and return a number value.
        return arg;
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
    //% inlineInputMode=inline
    //% block="add to $container cards combinations of $variations face up $faceUp || make $copies copies each"
    //% container.shadow="variables_get" container.defl="myContainer"
    //% card.shadow="cardDataPicker"
    //% variations.shadow="lists_create_with" variations.defl="textAttributePicker"
    //% faceUp.defl=true
    //% copies.defl=1
    export function addCardVariantsToContainer(container: cardCore.CardContainer, variations: CardAttributeVariation[], faceUp: boolean = true, copies: number = 1) {
        const insertData: cardCore.CardData[] = []
        __addCardVariationsFromIndex(insertData, new cardCore.CardData(), variations, 0, copies)
        if (container instanceof cardCore.CardStack) {
            container.insertData(insertData)                
        } else if (container instanceof cardCore.CardSpread) {
            container.insertData(insertData, faceUp)
        } else if (container instanceof cardCore.CardGrid) {
            container.insertData(insertData, faceUp)
        }
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

    /*****************************************/
    /* Create                                */
    /*****************************************/

    //% group="Create" blockSetVariable="myContainer"
    //% inlineInputMode=inline
    //% block="empty $template $kind deck"
    //% template.shadow="designTemplatePicker"
    //% kind.shadow="containerKindPicker" kind.defl=CardContainerKinds.Draw
    export function createEmptyStack(template: number, kind: number): cardCore.CardContainer {
        const stack = new cardCore.CardStack(cardDesign.getDesignTemplateExport(template), scene.screenWidth() / 2, scene.screenHeight() / 2, kind, false)
        return stack
    }
    
    //% group="Create" blockSetVariable="myContainer"
    //% inlineInputMode=inline
    //% block="empty $template $kind card grid columns $columns rows $rows|| scroll $direction"
    //% template.shadow="designTemplatePicker"
    //% kind.shadow="containerKindPicker" kind.defl=CardContainerKinds.Puzzle
    //% columns.defl=6 rows.defl=4
    //% direction.defl=CardGridScrollDirections.UpDown
    export function createEmptyGrid(
        template: number,
        kind: number,
        rows: number, columns: number,
        direction: CardGridScrollDirections = CardGridScrollDirections.UpDown,
    ): cardCore.CardContainer {
        const scrollVertical = direction == CardGridScrollDirections.UpDown
        const grid = new cardCore.CardGrid(
            cardDesign.getDesignTemplateExport(template),
            scene.screenWidth() / 2, scene.screenHeight() / 2,
            kind,
            rows, columns,
            scrollVertical,
            scrollVertical 
                ? sprites.create(DEFAULT_SCROLL_UP, SpriteKind.Cursor)
                : sprites.create(DEFAULT_SCROLL_LEFT, SpriteKind.Cursor),
            scrollVertical 
                ? sprites.create(DEFAULT_SCROLL_DOWN, SpriteKind.Cursor)
                : sprites.create(DEFAULT_SCROLL_RIGHT, SpriteKind.Cursor),
        )
        return grid
    }
    
    //% group="Create" blockSetVariable="myContainer"
    //% inlineInputMode=inline
    //% block="empty $template $kind pile"
    //% template.shadow="designTemplatePicker"
    //% design.shadow="variables_get" design.defl="myDesign"
    //% kind.shadow="containerKindPicker" kind.defl=CardContainerKinds.Discard
    export function createEmptyPile(
        template: number,
        kind: number,
    ): cardCore.CardContainer {
        return new cardCore.CardStack(
            cardDesign.getDesignTemplateExport(template),
            scene.screenWidth() / 2,
            scene.screenHeight() / 2,
            kind, true
        )
    }

    //% group="Create" blockSetVariable="myContainer"
    //% inlineInputMode=inline
    //% block="empty $template $kind card spread $direction"
    //% template.shadow="designTemplatePicker"
    //% kind.shadow="containerKindPicker" kind.defl=CardContainerKinds.Player
    //% direction.defl=CardLayoutDirections.CenteredLeftRight
    export function createEmptyHand(
        template: number,
        kind: number,
        direction: CardLayoutDirections,
    ): cardCore.CardContainer {
        return new cardCore.CardSpread(
            cardDesign.getDesignTemplateExport(template),
            scene.screenWidth() / 2,
            scene.screenHeight() / 2,
            kind,
            direction
        )
    }

    /*****************************************/
    /* Create                                */
    /*****************************************/

    //% color="#ff9008"
    //% group="Container"
    //% block="array of all $kind containers"
    //% kind.shadow="containerKindPicker" kind.defl=CardContainerKinds.Draw
    export function getContainerKindList(kind: number): cardCore.CardContainer[] {
        return cardCore.getCardContainersOfKind(kind)
    }

    //% color="#ff9008"
    //% group="Container"
    //% block="array of $container cards"
    //% container.shadow="variables_get" container.defl="myContainer"
    export function getLayoutCardListCopy(container: cardCore.CardContainer): cardCore.Card[] {
        return container.getCards()
    }

    //% group="Container"
    //% block="$container is $kind"
    //% container.shadow="variables_get" container.defl="myContainer"
    //% kind.shadow="containerKindPicker" kind.defl=CardContainerKinds.Draw
    export function isContainerOfKind(
        container: cardCore.CardContainer,
        kind: number
    ): boolean {
        return !!container ? container.kind === kind : false
    }

    //% group="Container"
    //% block="$container card count"
    //% container.shadow="variables_get" container.defl="myContainer"
    export function getContainerCardCount(
        container: cardCore.CardContainer
    ): number {
        return !! container ? container.count : -1
    }    

    //% group="Container"
    //% block="$container has cards"
    //% container.shadow="variables_get" container.defl="myContainer"
    export function containerHasCards(
        container: cardCore.CardContainer
    ): boolean {
        return !! container ? container.count > 0 : false
    }
    
    //% group="Container"
    //% block="shuffle $container cards"
    //% container.shadow="variables_get" container.defl="myContainer"
    export function shuffleCards(container: cardCore.CardContainer) {
        container.shuffle()
    }
    
    //% group="Container"
    //% block="destroy $container"
    //% container.shadow="variables_get" container.defl="myContainer"
    //% spacing.defl=1
    export function destroyCardLayoutCards(container: cardCore.CardContainer) {
        container.destroy()
    }

    //% group="Container"
    //% block="$container $position card"
    //% container.shadow="variables_get" container.defl="myContainer"
    export function getCard(container: cardCore.CardContainer, position: CardContainerPositions): cardCore.Card {
        const index = getPositionIndex(container, position)
        if (index == null) {
            return null
        }
        return container.getCard(index)
    }    
    
    /*****************************************/
    /* Movement                              */
    /*****************************************/

    //% group="Movement" blockSetVariable="myCard"
    //% block="take $position card from $container"
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

    //% group="Movement"
    //% inlineInputMode=inline
    //% block="put $card in $container $position position $facing"
    //% container.shadow="variables_get" container.defl="myContainer"
    //% card.shadow="variables_get" card.defl="myCard"
    export function addCardTo(container: cardCore.CardContainer, card: cardCore.Card, position: CardContainerPositions, facing: CardFaces) {
        const index = getPositionIndex(container, position)
        if (index == null) {
            return
        }
        container.insertCard(card, getPositionIndex(container, position), facing)
    }

    //% group="Movement"
    //% inlineInputMode=inline
    //% block="move $startPosition card from $origin to $destination $endPosition position $facing"
    //% origin.shadow="variables_get" origin.defl="myContainer"
    //% destination.shadow="variables_get" destination.defl="myContainer"    
    export function moveCardBetween(
        origin: cardCore.CardContainer,
        startPosition: CardContainerPositions,
        destination: cardCore.CardContainer,
        endPosition: CardContainerPositions,
        facing: CardFaces
    ) {
        const start = getPositionIndex(origin, startPosition)
        if (start == null) {
            return
        }
        const end = getPositionIndex(destination, endPosition)
        if (end == null) {
            return
        }
        destination.insertCard(origin.removeCardAt(start), end, facing)
    }

    /*****************************************/
    /* Controls                              */
    /*****************************************/

    //% color="#d54322"
    //% group="Controls"
    //% block="move cursor between cards in $container with buttons"
    //% container.shadow="variables_get" container.defl="myContainer"
    export function moveCursorInsideLayoutWithButtons(container: cardCore.CardContainer) {
        cardCursor.select(container)
        autoLayoutControl = true
    }

    //% color="#d54322"
    //% group="Controls"
    //% block="stop cursor controls"
    export function disableLayoutButtonControl() {         
        autoLayoutControl = false
    }

    type CardContainerLink = {
        fromContainer: cardCursor.SelectableContainer,
        toContainer: cardCursor.SelectableContainer,
        direction: RelativeDirections
    }
    const containerLinks: CardContainerLink[] = []

    function reverseRelativeDirection(direction: RelativeDirections) {
        switch (direction) {
            case RelativeDirections.Above: return RelativeDirections.Below
            case RelativeDirections.Below: return RelativeDirections.Above
            case RelativeDirections.LeftOf: return RelativeDirections.RightOf
            case RelativeDirections.RightOf: return RelativeDirections.LeftOf
        }
    }

    type LinkableObjects = cardCore.CardContainer | Sprite

    //% color="#d54322"
    //% group="Controls"
    //% block="cursor link $toContainer $direction $fromContainer"
    //% toContainer.shadow="variables_get" toContainer.defl="myContainer"
    //% fromContainer.shadow="variables_get" fromContainer.defl="myContainer"
    export function linkContainers(
        toContainer: LinkableObjects,
        direction: RelativeDirections,
        fromContainer: LinkableObjects,
    ) {
        const fromLinkable: cardCursor.SelectableContainer = (fromContainer instanceof Sprite) ? cardCursor.getContainerFromSprite(fromContainer) : fromContainer
        const toLinkable: cardCursor.SelectableContainer = (toContainer instanceof Sprite) ? cardCursor.getContainerFromSprite(toContainer) : toContainer

        const forwardLink = containerLinks.indexOf(containerLinks.find(
            link => link.fromContainer === fromContainer && link.direction === direction
        ))
        if(forwardLink >= 0) {
            containerLinks.splice(forwardLink, 1)
            containerLinks.splice(containerLinks.indexOf(containerLinks.find(
                link => link.toContainer === fromContainer && link.direction === reverseRelativeDirection(direction)
            )), 1)
        }

        containerLinks.push({
            fromContainer: fromLinkable,
            toContainer: toLinkable,
            direction: direction
        })
        containerLinks.push({
            fromContainer: toLinkable,
            toContainer: fromLinkable,
            direction: reverseRelativeDirection(direction)
        })
    }

    type ContainerEntryPoint = {
        container: cardCore.CardContainer,
        position: CardContainerPositions,
    }
    const containerEntryPoints: ContainerEntryPoint[] = []

    //% color="#d54322"
    //% group="Controls"
    //% block="set $container link entry to $position card"
    //% container.shadow="variables_get" container.defl="myContainer"
    export function setContainerEntryPoint(container: cardCore.CardContainer, position: CardContainerPositions) {
        const entryPoint = containerEntryPoints.find(entry => entry.container === container)
        if (!entryPoint) {
            containerEntryPoints.push({
                container: container,
                position: position
            })
        } else {
            entryPoint.position = position
        }
    }

    function setEntryPoint(container: cardCore.CardContainer, direction: RelativeDirections) {
        const link = containerLinks.find(link => link.fromContainer === container && link.direction === direction)
        if (!!link) {
            const entryPoint = containerEntryPoints.find(entry => entry.container === link.toContainer)
            if (!!entryPoint && link.toContainer instanceof cardCore.CardContainer) {
                const card = link.toContainer.getCard(getPositionIndex(link.toContainer, entryPoint.position))
                if (card !== null) {
                    cardCursor.select(card)
                } else {
                    link.toContainer.switchSelection(direction)
                }
            } else {
                link.toContainer.switchSelection(direction)
            }
        }
    }
    cardCursor.addExitContainerEvent(setEntryPoint)

    export function moveCursorInDirection(direction: PointerDirections) {
        const layer = cardCursor.selectedContainer()
        if (!layer) {
            return
        }
        switch (direction) {
            case PointerDirections.Up: layer.selectUp(); break
            case PointerDirections.Down: layer.selectDown(); break
            case PointerDirections.Left: layer.selectLeft(); break
            case PointerDirections.Right: layer.selectRight(); break
        }
    }

    /*****************************************/
    /* Events                                */
    /*****************************************/

    //% group="Events"
    //% draggableParameters="reporter"
    //% expandableArgumentMode="toggle"
    //% block="on select $card in $kind $container with $button button"
    //% kind.shadow="containerKindPicker" kind.defl=CardContainerKinds.Draw
    export function createSelectEvent(
        kind: number,
        button: SelectionButtons,
        handler: (container: cardCore.CardContainer, card: cardCore.Card) => void,
    ) {
        cardCore.addCardEvent(
            kind,
            button,
            handler,
        )
    }
    
    //% group="Events"
    //% draggableParameters="reporter"
    //% expandableArgumentMode="toggle"
    //% block="on select empty $kind $container with $button button"
    //% kind.shadow="containerKindPicker" kind.defl=CardContainerKinds.Draw
    export function createSelectEmptySlotEvent(
        kind: number,
        button: SelectionButtons,
        handler: (container: cardCore.CardContainer) => void,
    ) {
        cardCore.addEmptySlotEvent(
            kind,
            button,
            handler,
        )
    }

    //% group="Events"
    //% draggableParameters="reporter"
    //% expandableArgumentMode="toggle"
    //% block="on select $card with $button button"
    export function createGenericSelectCardEvent(
        button: SelectionButtons,
        handler: (card: cardCore.Card) => void,
    ) {
        cardCore.addGenericCardEvent(
            button,
            handler,
        )
    }

    //% group="Events"
    //% draggableParameters="reporter"
    //% expandableArgumentMode="toggle"
    //% block="on select $sprite with $button button"
    export function createSelectSpriteEvent(
        button: SelectionButtons,
        handler: (sprite: Sprite) => void,
    ) {
        cardCore.addSpriteEvent(
            button,
            handler,
        )
    }    

    function getPositionIndex(container: cardCore.CardContainer, position: CardContainerPositions): number {
        switch (position) {
            case CardContainerPositions.First: return 0
            case CardContainerPositions.Middle: return Math.floor(container.slots / 2)
            case CardContainerPositions.Last: return cardCore.LAST_CARD_INDEX
            case CardContainerPositions.Random: return Math.randomRange(0, container.slots - 1)
            case CardContainerPositions.Cursor: return container.cursorIndex
        }
    }

    let autoLayoutControl: boolean = true

    let isPressed = [false, false, false, false, false, false, false]
    
    function updateControl(button: controller.Button, index: ControllerButtons, selection?: SelectionButtons, direction?: PointerDirections) {
        if (button.isPressed() && !isPressed[index]) {
            isPressed[index] = true
            if (autoLayoutControl) {
                if (direction != null) {
                    moveCursorInDirection(direction)
                }
                if (selection != null) {
                    cardCursor.activateSprite(selection)
                }
            }
        }
        if(!button.isPressed()) {
            isPressed[index] = false
        }
    }

    forever(() => {
        updateControl(controller.left, ControllerButtons.Left, null, PointerDirections.Left)
        updateControl(controller.right, ControllerButtons.Right, null, PointerDirections.Right)
        updateControl(controller.up, ControllerButtons.Up, null, PointerDirections.Up)
        updateControl(controller.down, ControllerButtons.Down, null, PointerDirections.Down)
        updateControl(controller.A, ControllerButtons.A, SelectionButtons.A)
        updateControl(controller.B, ControllerButtons.B, SelectionButtons.B)
        updateControl(controller.menu, ControllerButtons.Menu, SelectionButtons.Menu)
    })


    /*****************************************/
    /* Cursor                                */
    /*****************************************/

    //% group="Cursor"
    //% block="cursor card"
    export function getCursorCard(): cardCore.Card {
        return cardCursor.selectedCard()
    }

    //% group="Cursor"
    //% block="cursor container"
    export function getCursorContainer(): cardCore.CardContainer {
        return cardCursor.selectedCardContainer()
    }

    //% group="Cursor"
    //% block="point cursor at $sprite"
    //% sprite.shadow="variables_get" sprite.defl="mySprite"
    export function pointCursorAt(sprite: Sprite) {
        cardCursor.select(sprite)
    }

    //% group="Cursor"
    //% block="hide cursor"
    export function removeCursor() {
        cardCursor.deselect()
    }

    //% group="Cursor"
    //% block="cursor sprite"
    export function getCursorSprite(): Sprite {
        return cardCursor.cursor
    }

    /*****************************************/
    /* Card                                  */
    /*****************************************/

    //% group="Card" blockSetVariable="id"
    //% block="$card id"
    //% card.shadow="variables_get" card.defl="myCard"
    export function getCardId(card: cardCore.Card): number {
        return !!card ? card.id : -1
    }

    //% group="Card"
    //% block="card with id $id"
    //% id.shadow="variables_get" id.defl="id"
    export function getCardById(id: number): cardCore.Card {
        if (id < 1)
            return null

        const cardSprites = sprites.allOfKind(SpriteKind.Card)
        const card = cardSprites.find(sprite => {
            if (sprite instanceof cardCore.Card) {
                const card = (sprite as cardCore.Card)
                if (card.id === id) {
                    return true
                }
            }
            return false
        })
        return !!card ? (card as cardCore.Card) : null
    }

    //% group="Card"
    //% block="$card is face up"
    //% card.shadow="variables_get" card.defl="myCard"
    export function getCardFaceUp(card: cardCore.Card) {
        return !!card ? card.isFaceUp : false
    }

    //% group="Card"
    //% block="set $card face up to $isFaceUp"
    //% card.shadow="variables_get" card.defl="myCard"
    export function setCardFaceUp(card: cardCore.Card, isFaceUp: boolean) {
        if (!!card) {
            card.isFaceUp = isFaceUp            
        }
    }

    //% group="Card"
    //% block="flip $card"
    //% card.shadow="variables_get" card.defl="myCard"
    export function flipCard(card: cardCore.Card) {
        if (!!card) {
            card.flip()            
        }
    }

    //% group="Card Attributes"
    //% block="set $card $attribute to $value"
    //% card.shadow="variables_get" card.defl="myCard"
    //% attribute.shadow="attributePicker"
    export function setCardNumberAttribute(card: cardCore.Card, attribute: number, value: number) {
        card.cardData.setAttribute(attribute, value)
        card.refreshImage()
    }

    //% group="Card Attributes"
    //% block="set $card $attribute to $text"
    //% card.shadow="variables_get" card.defl="myCard"
    //% attribute.shadow="attributePicker"
    export function setCardTextAttribute(card: cardCore.Card, attribute: number, text: string) {
        card.cardData.setAttribute(attribute, text)
        card.refreshImage()
    }

    //% group="Card Attributes"
    //% block="set $card $attribute to $bool"
    //% card.shadow="variables_get" card.defl="myCard"
    //% attribute.shadow="attributePicker"
    export function setCardBooleanAttribute(card: cardCore.Card, attribute: number, bool: boolean) {
        card.cardData.setAttribute(attribute, bool)
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
        if (!card) {
            return 0
        }
        const value = card.cardData.getAttribute(attribute)
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
        if (!card) {
            return ""
        }
        const value = card.cardData.getAttribute(attribute)
        if (typeof value == "string") {
            return value
        } else {
            return value.toString()
        }
    }

    //% group="Card Attributes"
    //% block="$card $attribute boolean"
    //% card.shadow="variables_get" card.defl="myCard"
    //% attribute.shadow="attributePicker"
    export function getCardBooleanAttribute(card: cardCore.Card, attribute: number) {
        if (!card) {
            return false
        }
        const value = card.cardData.getAttribute(attribute)
        return !!value
    }
    
    //% group="Card Attributes"
    //% block="$card stamp"
    //% card.shadow="variables_get" card.defl="myCard"
    export function getCardStampText(card: cardCore.Card) {
        if (!card) {
            return ""
        }
        return card.stamp
    }

    /*****************************************/
    /* Customization                         */
    /*****************************************/

    //% group="Customization"
    //% block="set cursor anchor to $anchor|| offset x $x y $y"
    //% x.defl=0 y.defl=0
    export function setCursorAnchor(anchor: AnchorPositions, x: number = 0, y: number = 0) {
        cardCursor.setAnchor(anchor, x, y)
    }

    //% group="Customization"
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
        
    //% group="Customization"
    //% block="set $container z $layer"
    //% container.shadow="variables_get" container.defl="myContainer"
    export function setContainerLayer(
        container: cardCore.CardContainer,
        layer: number
    ) {
        container.z = layer
    }

    //% group="Customization"
    //% block="hide $container empty slots"
    //% container.shadow="variables_get" container.defl="myContainer"
    export function hideEmptySlots(
        container: cardCore.CardContainer,
    ) {
        container.showEmpty = false
    }

    //% group="Customization"
    //% block="set stack $stack top card $face"
    //% stack.shadow="variables_get" stack.defl="myContainer"
    export function flipStackTopCard(stack: cardCore.CardContainer, face: CardFaces) {
        if(stack instanceof cardCore.CardStack && face !== CardFaces.Unchanged) {
            stack.topIsFaceUp = face === CardFaces.Up
        }
    }
        
    //% group="Customization"
    //% block="set $container card spacing to $spacing"
    //% container.shadow="variables_get" container.defl="myContainer"
    //% spacing.defl=1
    export function setCardLayoutSpacing(container: cardCore.CardContainer, spacing: number) {
        container.spacing = spacing
    }

    //% group="Customization"
    //% block="freeze grid $grid|| min $lines lines"
    //% grid.shadow="variables_get" grid.defl="myContainer"
    //% lines.defl=-1
    export function lockGridCardPositions(grid: cardCore.CardContainer, lines: number) {
        if (grid instanceof cardCore.CardGrid) {
            grid.lock(lines)
        }
    }

    //% group="Customization"
    //% block="set grid $grid|scroll back sprite $scrollBack|scroll forward sprite $scrollForward"
    //% grid.shadow="variables_get" grid.defl="myContainer"
    //% scrollBack.shadow="variables_get" scrollBack.defl="mySprite"
    //% scrollForward.shadow="variables_get" scrollForward.defl="mySprite"
    export function setGridScrollSprites(grid: cardCore.CardContainer, scrollBack: Sprite, scrollForward: Sprite) {
        if (grid instanceof cardCore.CardGrid) {
            grid.setIndicators(scrollBack, scrollForward)
        }
    }    
}