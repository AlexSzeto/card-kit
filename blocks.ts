namespace cardKit {
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

    class CardLayoutTemplate {
        width: number
        height: number
        frontFrame: Image
        backFrame: Image
        frontStackFrame: Image
        backStackFrame: Image
        cardsPerPixel: number
        maxStackHeight: number
        rows: cardKitCore.LayoutRow[]
        margin: number
        spacing: number

        constructor() {
            this.width = 12
            this.height = 20

            this.frontFrame = DEFAULT_CARD_FRONT
            this.backFrame = createFlatColorImage(DEFAULT_ROUNDED_RECTANGLE, 4)
            this.frontStackFrame = createFlatColorImage(DEFAULT_ROUNDED_RECTANGLE, 11)
            this.backStackFrame = createFlatColorImage(DEFAULT_ROUNDED_RECTANGLE, 14)

            this.cardsPerPixel = 5
            this.maxStackHeight = 10

            this.rows = []
            this.margin = 2
            this.spacing = 1            
        }
    }
}