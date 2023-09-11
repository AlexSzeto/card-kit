//% color="#333333" icon="\uf06d" block="Card Builder"
//% groups="['Layout', 'Data']"
namespace cardBuilder {

    function createFlatColorImage(image: Image, color: number): Image {
        const result = image.clone()
        for (let c = 0; c < 16; c++) {
            result.replace(c, color)
        }
        return result
    }
    
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

    //% blockId="textToImageLookupPicker"
    //% blockHidden=true
    //% block="text $text to image $image"
    export function createTextToImageLookupPair(text: string, image: Image): cardKit.LayoutLookup {
        return new cardKit.LayoutLookup(text, image)
    }

    class CardLayoutTemplate {
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

            this.resetZones()
        }

        //% group="Layout" blockSetVariable="myCardLayout"
        //% block="reset $this layout zones"
        resetZones() {
            this.rows = []
            this.createNextRow()
        }

        //% group="Layout" blockSetVariable="myCardLayout"
        //% block="edit $this next layout row"
        createNextRow() {
            this.rows.push(new cardKit.LayoutRow(CardZoneAlignments.Center, []))
        }

        //% group="Layout" blockSetVariable="myCardLayout"
        //% block="align $this current row to $alignment"
        changeRowAlignment(alignment: CardZoneAlignments) {
            this.rows[this.rows.length - 1].align = alignment
        }

        private addColumn(column: cardKit.LayoutColumn) {
            this.rows[this.rows.length - 1].columns.push(column)
        }

        //% group="Layout" blockSetVariable="myCardLayout"
        //% block="add $this empty space width $width height $height to current row"
        createEmptySpaceZone(width: number, height: number) {
            this.addColumn(cardKit.createEmptySpaceLayout(width, height))
        }

        //% group="Layout" blockSetVariable="myCardLayout"
        //% inlineInputMode=inline
        //% block="add $this text $text in $color to current row|| limit line length $charsPerLine max lines $maxLines"
        //% color.shadow="colorindexpicker" color.defl=15
        //% charsPerLine.defl=0 maxLines.defl=1
        createStaticTextZone(text: string, color: number, charsPerLine: number = 0, maxLines: number = 1) {
            this.addColumn(cardKit.createTextLayout(text, color, charsPerLine <= 0 ? text.length : charsPerLine, maxLines))
        }

        //% group="Layout" blockSetVariable="myCardLayout"
        //% block="add $this image $image to current row"
        createStaticImageZone(image: Image) {
            this.addColumn(cardKit.createImageLayout(image))
        }

        //% group="Layout" blockSetVariable="myCardLayout"
        //% block="add $this card picture to current row"
        createPictureZone() {
            this.addColumn(cardKit.createPictureLayout())
        }

        //% group="Layout" blockSetVariable="myCardLayout"
        //% inlineInputMode=inline
        //% block="add $this image $image to current row repeat number attribute $attribute times"
        createRepeatedImageZone(attribute: string, image: Image) {
            this.addColumn(cardKit.createAttributeAsRepeatImageLayout(attribute, image))
        }

        //% group="Layout" blockSetVariable="myCardLayout"
        //% inlineInputMode=inline
        //% block="add $this attribute $attribute as text in $color to current row|| limit line length $charsPerLine max lines $maxLines"
        //% color.shadow="colorindexpicker" color.defl=15
        //% charsPerLine.defl=5 maxLines.defl=1
        createAttributeTextZone(attribute: string, color: number, charsPerLine: number, maxLines: number) {
            this.addColumn(cardKit.createAttributeAsPlainTextLayout(attribute, color, charsPerLine, maxLines))
        }

        //% group="Layout" blockSetVariable="myCardLayout"
        //% block="$this add text to current row| in $color use number attribute $attribute to index value from $textLookupTable|| limit line length $charsPerLine max lines $maxLines"
        //% color.shadow="colorindexpicker" color.defl=15
        //% charsPerLine.defl=5 maxLines.defl=1
        createAttributeNumberToTextZone(attribute: string, textLookupTable: string[], color: number, charsPerLine: number, maxLines: number) {
            this.addColumn(cardKit.createAttributeAsLookupTextLayout(attribute, color, charsPerLine, maxLines, cardKit.createNumberToTextLookupTable(textLookupTable)))
        }

        //% group="Layout" blockSetVariable="myCardLayout"
        //% block="$this add image to current row| use number attribute $attribute to index value from $imageLookupTable"
        //% imageLookupTable.shadow="lists_create_with" imageLookupTable.defl="screen_image_picker"
        createAttributeNumberToImageZone(attribute: string, imageLookupTable: Image[]) {
            this.addColumn(cardKit.createAttributeAsLookupImageLayout(attribute, cardKit.createNumberToImageLookupTable(imageLookupTable)))
        }

        //% group="Layout" blockSetVariable="myCardLayout"
        //% block="$this add image to current row| use text attribute $attribute and change $lookupTable"
        //% lookupTable.shadow="lists_create_with" lookupTable.defl="textToImageLookupPicker"
        createAttributeTextToImageZone(attribute: string, lookupTable: cardKit.LayoutLookup[]) {
            this.addColumn(cardKit.createAttributeAsLookupImageLayout(attribute, lookupTable))
        }

    }
}