//% color="#333333" icon="\uf06d" block="Card Builder"
//% groups="['Layout', 'Data']"
namespace cardBuilder {

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

    //% shim=ENUM_GET
    //% blockId="attributePicker"
    //% block="Card $arg"
    //% enumName="CardAttributes"
    //% enumMemberName="attribute"
    //% enumPromptHint="e.g. Name, Cost, Power..."
    //% enumInitialMembers="Suit, Rank"
    export function _attributeEnumShim(arg: number) {
        // This function should do nothing, but must take in a single
        // argument of type number and return a number value.
        return arg;
    }

    //% blockId="textToImageLookupPicker"
    //% blockHidden=true
    //% block="text $text to image $image"
    export function createTextToImageLookupPair(text: string, image: Image): cardKit.LayoutLookup {
        return new cardKit.LayoutLookup(text, image)
    }

    //% group="Layout" blockSetVariable="myCardLayout"
    //% block="set $this to "
    export function createCardLayoutTemplate(): CardLayoutTemplate {
        return new CardLayoutTemplate()
    }

    export class CardLayoutTemplate {
        //% group="Layout" blockSetVariable="myCardLayout"
        //% blockCombine block="width"
        width: number
        //% group="Layout" blockSetVariable="myCardLayout"
        //% blockCombine block="height"
        height: number
        //% group="Layout" blockSetVariable="myCardLayout"
        //% blockCombine block="card front frame"
        frontFrame: Image
        //% group="Layout" blockSetVariable="myCardLayout"
        //% blockCombine block="card back frame"
        backFrame: Image
        //% group="Layout" blockSetVariable="myCardLayout"
        //% blockCombine block="card front stack frame"
        frontStackFrame: Image
        //% group="Layout" blockSetVariable="myCardLayout"
        //% blockCombine block="card back stack frame"
        backStackFrame: Image
        //% group="Layout" blockSetVariable="myCardLayout"
        //% blockCombine block="cards per pixel on stack"
        cardsPerPixel: number
        //% group="Layout" blockSetVariable="myCardLayout"
        //% blockCombine block="max stack height"
        maxStackHeight: number
        //% group="Layout" blockSetVariable="myCardLayout"
        //% blockCombine block="margin"
        margin: number
        //% group="Layout" blockSetVariable="myCardLayout"
        //% blockCombine block="spacing"
        spacing: number

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
        }
    }

    //% group="Layout"
    //% block="reset $layout zones"
    //% layout.shadow="variables_get" layout.defl="myCardLayout"
    export function resetLayoutZones(layout: CardLayoutTemplate) {
        layout.rows = []
        editNextLayoutRow(layout)
    }

    //% group="Layout"
    //% block="edit $layout next row"
    //% layout.shadow="variables_get" layout.defl="myCardLayout"
    export function editNextLayoutRow(layout: CardLayoutTemplate) {
        layout.rows.push(new cardKit.LayoutRow(CardZoneAlignments.Center, []))
    }

    //% group="Layout"
    //% block="align $layout current row to $alignment"
    //% layout.shadow="variables_get" layout.defl="myCardLayout"
    export function changeLayoutCurrentRowAlignment(layout: CardLayoutTemplate, alignment: CardZoneAlignments) {
        layout.rows[layout.rows.length - 1].align = alignment
    }

    function addLayoutColumn(layout: CardLayoutTemplate, column: cardKit.LayoutColumn) {
        layout.rows[layout.rows.length - 1].columns.push(column)
    }

    //% group="Layout"
    //% block="add to current row in $layout empty space width $width height $height"
    //% layout.shadow="variables_get" layout.defl="myCardLayout"
    export function createLayoutEmptySpaceZone(layout: CardLayoutTemplate, width: number, height: number) {
        addLayoutColumn(layout, cardKit.createEmptySpaceLayout(width, height))
    }

    //% group="Layout"
    //% inlineInputMode=inline
    //% block="add to current row in $layout text $text|| in $color limit line length $charsPerLine max lines $maxLines"
    //% layout.shadow="variables_get" layout.defl="myCardLayout"
    //% color.shadow="colorindexpicker" color.defl=15
    //% charsPerLine.defl=0 maxLines.defl=1
    export function createLayoutStaticTextZone(layout: CardLayoutTemplate, text: string, color: number, charsPerLine: number = 0, maxLines: number = 1) {
        addLayoutColumn(layout, cardKit.createTextLayout(text, color, charsPerLine <= 0 ? text.length : charsPerLine, maxLines))
    }

    //% group="Layout"
    //% block="add to current row in $layout image $image"
    //% layout.shadow="variables_get" layout.defl="myCardLayout"
    export function createLayoutStaticImageZone(layout: CardLayoutTemplate, image: Image) {
        addLayoutColumn(layout, cardKit.createImageLayout(image))
    }

    //% group="Layout"
    //% block="add to current row in $layout card picture"
    //% layout.shadow="variables_get" layout.defl="myCardLayout"
    export function createLayoutPictureZone(layout: CardLayoutTemplate, ) {
        addLayoutColumn(layout, cardKit.createPictureLayout())
    }

    //% group="Layout"
    //% inlineInputMode="inline"
    //% block="add to current row in $layout image $image repeat $attribute times"
    //% layout.shadow="variables_get" layout.defl="myCardLayout"
    //% attribute.shadow="attributePicker"
    export function createLayoutRepeatedImageZone(layout: CardLayoutTemplate, attribute: number, image: Image) {
        addLayoutColumn(layout, cardKit.createAttributeAsRepeatImageLayout(attribute, image))
    }

    //% group="Layout"
    //% inlineInputMode="inline"
    //% block="add to current row in $layout attribute $attribute as text|| in $color limit line length $charsPerLine max lines $maxLines"
    //% layout.shadow="variables_get" layout.defl="myCardLayout"
    //% attribute.shadow="attributePicker"
    //% color.shadow="colorindexpicker" color.defl=15
    //% charsPerLine.defl=5 maxLines.defl=1
    export function createLayoutAttributeTextZone(layout: CardLayoutTemplate, attribute: number, color: number, charsPerLine: number, maxLines: number) {
        addLayoutColumn(layout, cardKit.createAttributeAsPlainTextLayout(attribute, color, charsPerLine, maxLines))
    }

    //% group="Layout"
    //% block="add to current row in $layout use index value $attribute to get text from $textLookupTable|| in $color limit line length $charsPerLine max lines $maxLines"
    //% layout.shadow="variables_get" layout.defl="myCardLayout"
    //% attribute.shadow="attributePicker"
    //% color.shadow="colorindexpicker" color.defl=15
    //% charsPerLine.defl=5 maxLines.defl=1
    export function createLayoutAttributeNumberToTextZone(layout: CardLayoutTemplate, attribute: number, textLookupTable: string[], color: number, charsPerLine: number, maxLines: number) {
        addLayoutColumn(layout, cardKit.createAttributeAsLookupTextLayout(attribute, color, charsPerLine, maxLines, cardKit.createNumberToTextLookupTable(textLookupTable)))
    }

    //% group="Layout"
    //% block="add to current row in $layout use index value $attribute to get image from $imageLookupTable"
    //% layout.shadow="variables_get" layout.defl="myCardLayout"
    //% attribute.shadow="attributePicker"
    //% imageLookupTable.shadow="lists_create_with" imageLookupTable.defl="screen_image_picker"
    export function createLayoutAttributeNumberToImageZone(layout: CardLayoutTemplate, attribute: number, imageLookupTable: Image[]) {
        addLayoutColumn(layout, cardKit.createAttributeAsLookupImageLayout(attribute, cardKit.createNumberToImageLookupTable(imageLookupTable)))
    }

    //% group="Layout"
    //% block="add to current row in $layout use $attribute and change $lookupTable"
    //% layout.shadow="variables_get" layout.defl="myCardLayout"
    //% attribute.shadow="attributePicker"
    //% lookupTable.shadow="lists_create_with" lookupTable.defl="textToImageLookupPicker"
    export function createLayoutAttributeTextToImageZone(layout: CardLayoutTemplate, attribute: number, lookupTable: cardKit.LayoutLookup[]) {
        addLayoutColumn(layout, cardKit.createAttributeAsLookupImageLayout(attribute, lookupTable))
    }
}