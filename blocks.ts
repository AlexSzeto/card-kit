//% color="#333333" icon="\uf249" block="Card Layout"
//% groups="['Create', 'Add Row', 'Add Text', 'Add Image', 'Add Misc', 'Graphics', 'Dimensions']"
namespace cardLayout {

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
    export function createTextToImageLookupPair(text: string, image: Image): cardKit.LayoutLookup {
        return new cardKit.LayoutLookup(text, image)
    }

    //% group="Create" blockSetVariable="myCardLayout"
    //% block="new card layout"
    export function createCardLayoutTemplate(): CardLayoutTemplate {
        return new CardLayoutTemplate()
    }

    export class CardLayoutTemplate {
        //% group="Dimensions" blockSetVariable="myCardLayout"
        //% blockCombine block="width"
        width: number
        //% group="Dimensions" blockSetVariable="myCardLayout"
        //% blockCombine block="height"
        height: number
        //% group="Dimensions" blockSetVariable="myCardLayout"
        //% blockCombine block="margin"
        margin: number
        //% group="Dimensions" blockSetVariable="myCardLayout"
        //% blockCombine block="spacing"
        spacing: number
        //% group="Dimensions" blockSetVariable="myCardLayout"
        //% blockCombine block="cards per pixel on stack"
        cardsPerPixel: number
        //% group="Dimensions" blockSetVariable="myCardLayout"
        //% blockCombine block="max stack height"
        maxStackHeight: number

        //% group="Graphics" blockSetVariable="myCardLayout"
        //% blockCombine block="card front frame"
        frontFrame: Image
        //% group="Graphics" blockSetVariable="myCardLayout"
        //% blockCombine block="card back frame"
        backFrame: Image
        //% group="Graphics" blockSetVariable="myCardLayout"
        //% blockCombine block="card front stack frame"
        frontStackFrame: Image
        //% group="Graphics" blockSetVariable="myCardLayout"
        //% blockCombine block="card back stack frame"
        backStackFrame: Image

        rows: cardKit.LayoutRow[]
        
        constructor() {
            this.width = 12
            this.height = 20

            this.frontFrame = DEFAULT_CARD_FRONT
            this.backFrame = createFlatColorImage(DEFAULT_ROUNDED_RECTANGLE, 4)
            this.frontStackFrame = createFlatColorImage(DEFAULT_ROUNDED_RECTANGLE, 11)
            this.backStackFrame = createFlatColorImage(DEFAULT_ROUNDED_RECTANGLE, 14)

            this.cardsPerPixel = 5
            this.maxStackHeight = 10

            this.margin = 2
            this.spacing = 1

            resetLayoutZones(this)
        }

        export(): cardKit.CardLayout {
            return new cardKit.CardLayout(
                this.width,
                this.height,
                this.frontFrame,
                this.backFrame,
                this.frontStackFrame,
                this.backStackFrame,
                this.cardsPerPixel,
                this.maxStackHeight,
                this.rows,
                this.margin,
                this.spacing
            )
        }
    }

    //% group="Add Row"
    //% weight=100
    //% block="reset $layout zones"
    //% layout.shadow="variables_get" layout.defl="myCardLayout"
    export function resetLayoutZones(layout: CardLayoutTemplate) {
        layout.rows = []
        editNextRow(layout)
    }

    //% group="Add Row"
    //% weight=99
    //% block="edit $layout next row"
    //% layout.shadow="variables_get" layout.defl="myCardLayout"
    export function editNextRow(layout: CardLayoutTemplate) {
        layout.rows.push(new cardKit.LayoutRow(CardZoneAlignments.Center, []))
    }

    //% group="Add Row"
    //% weight=98
    //% block="align $layout current row $alignment"
    //% layout.shadow="variables_get" layout.defl="myCardLayout"
    export function changeLayoutCurrentRowAlignment(layout: CardLayoutTemplate, alignment: CardZoneAlignments) {
        layout.rows[layout.rows.length - 1].align = alignment
    }

    function addLayoutColumn(layout: CardLayoutTemplate, column: cardKit.LayoutColumn) {
        layout.rows[layout.rows.length - 1].columns.push(column)
    }

    //% group="Add Text"
    //% inlineInputMode=inline
    //% block="add to current row in $layout text $text|| in $color limit line length $charsPerLine max lines $maxLines"
    //% layout.shadow="variables_get" layout.defl="myCardLayout"
    //% color.shadow="colorindexpicker" color.defl=15
    //% charsPerLine.defl=0 maxLines.defl=1
    export function addStaticText(layout: CardLayoutTemplate, text: string, color: number = 15, charsPerLine: number = 0, maxLines: number = 1) {
        addLayoutColumn(layout, cardKit.createTextLayout(text, color, charsPerLine <= 0 ? text.length : charsPerLine, maxLines))
    }

    //% group="Add Image"
    //% block="add to current row in $layout image $image"
    //% layout.shadow="variables_get" layout.defl="myCardLayout"
    export function addStaticImage(layout: CardLayoutTemplate, image: Image) {
        addLayoutColumn(layout, cardKit.createImageLayout(image))
    }

    //% group="Add Image"
    //% block="add to current row in $layout card picture"
    //% layout.shadow="variables_get" layout.defl="myCardLayout"
    export function addCardPicture(layout: CardLayoutTemplate, ) {
        addLayoutColumn(layout, cardKit.createPictureLayout())
    }

    //% group="Add Image"
    //% inlineInputMode="inline"
    //% block="add to current row in $layout image $image repeat $attribute times"
    //% layout.shadow="variables_get" layout.defl="myCardLayout"
    //% attribute.shadow="attributePicker"
    export function addRepeatImage(layout: CardLayoutTemplate, attribute: number, image: Image) {
        addLayoutColumn(layout, cardKit.createAttributeAsRepeatImageLayout(attribute, image))
    }

    //% group="Add Text"
    //% inlineInputMode="inline"
    //% block="add to current row in $layout $attribute as text|| in $color limit line length $charsPerLine max lines $maxLines"
    //% layout.shadow="variables_get" layout.defl="myCardLayout"
    //% attribute.shadow="attributePicker"
    //% color.shadow="colorindexpicker" color.defl=15
    //% charsPerLine.defl=5 maxLines.defl=1
    export function addAttributeText(layout: CardLayoutTemplate, attribute: number, color: number = 15, charsPerLine: number = 5, maxLines: number = 1) {
        addLayoutColumn(layout, cardKit.createAttributeAsPlainTextLayout(attribute, color, charsPerLine, maxLines))
    }

    //% group="Add Text"
    //% block="add to current row in $layout text from $textLookupTable index $attribute|| in $color limit line length $charsPerLine max lines $maxLines"
    //% layout.shadow="variables_get" layout.defl="myCardLayout"
    //% attribute.shadow="attributePicker"
    //% color.shadow="colorindexpicker" color.defl=15
    //% charsPerLine.defl=5 maxLines.defl=1
    export function addAttributeIndexText(layout: CardLayoutTemplate, attribute: number, textLookupTable: string[], color: number = 15, charsPerLine: number = 5, maxLines: number = 1) {
        addLayoutColumn(layout, cardKit.createAttributeAsLookupTextLayout(attribute, color, charsPerLine, maxLines, cardKit.createNumberToTextLookupTable(textLookupTable)))
    }

    //% group="Add Image"
    //% block="add to current row in $layout image from $imageLookupTable index $attribute"
    //% layout.shadow="variables_get" layout.defl="myCardLayout"
    //% attribute.shadow="attributePicker"
    //% imageLookupTable.shadow="lists_create_with" imageLookupTable.defl="screen_image_picker"
    export function addAttributeIndexImage(layout: CardLayoutTemplate, attribute: number, imageLookupTable: Image[]) {
        addLayoutColumn(layout, cardKit.createAttributeAsLookupImageLayout(attribute, cardKit.createNumberToImageLookupTable(imageLookupTable)))
    }

    //% group="Add Image"
    //% block="add to current row in $layout image take $attribute and change $lookupTable"
    //% layout.shadow="variables_get" layout.defl="myCardLayout"
    //% attribute.shadow="attributePicker"
    //% lookupTable.shadow="lists_create_with" lookupTable.defl="textToImageLookupPicker"
    export function addAttributeTextToImage(layout: CardLayoutTemplate, attribute: number, lookupTable: cardKit.LayoutLookup[]) {
        addLayoutColumn(layout, cardKit.createAttributeAsLookupImageLayout(attribute, lookupTable))
    }

    //% group="Add Misc"
    //% block="add to current row in $layout empty space width $width height $height"
    //% layout.shadow="variables_get" layout.defl="myCardLayout"
    export function addEmptySpace(layout: CardLayoutTemplate, width: number, height: number) {
        addLayoutColumn(layout, cardKit.createEmptySpaceLayout(width, height))
    }

}

namespace cardBuilder {

}

//% color="#ff3333" icon="\uf249" block="Cards"
namespace cardSprites {
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
}